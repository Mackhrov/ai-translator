from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import defaultdict
from datetime import datetime
from typing import Optional
import requests as req
import os

from database import SessionLocal, User, Saved, History, init_db
from auth import hash_password, verify_password, create_token, decode_token

app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-translator-snowy-ten.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DAILY_LIMIT = 10
limits = defaultdict(lambda: {"count": 0, "date": ""})

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None), db=Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Нужна авторизация")
    token = authorization.replace("Bearer ", "")
    user_id = decode_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user

def check_limit(request: Request):
    ip = request.client.host
    today = datetime.now().strftime("%Y-%m-%d")
    if limits[ip]["date"] != today:
        limits[ip] = {"count": 0, "date": today}
    if limits[ip]["count"] >= DAILY_LIMIT:
        raise HTTPException(status_code=429, detail="Лимит переводов исчерпан")
    limits[ip]["count"] += 1

def call_groq(system: str, user: str) -> str:
    response = req.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            "max_tokens": 1024,
        }
    )
    data = response.json()
    return data["choices"][0]["message"]["content"]

# --- Модели запросов ---

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "English"
    source_language: str = "auto"
    sections: dict = {}
    ui_language: str = "Russian"

class SaveRequest(BaseModel):
    original: str
    translation: str
    target_lang: str
    mode: str

# --- Auth endpoints ---

@app.post("/register")
def register(req_body: RegisterRequest, db=Depends(get_db)):
    if db.query(User).filter(User.email == req_body.email).first():
        raise HTTPException(status_code=400, detail="Email уже занят")
    if db.query(User).filter(User.username == req_body.username).first():
        raise HTTPException(status_code=400, detail="Имя пользователя занято")
    if len(req_body.password) < 6:
        raise HTTPException(status_code=400, detail="Пароль минимум 6 символов")
    user = User(
        email=req_body.email,
        username=req_body.username,
        password_hash=hash_password(req_body.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id)
    return {"token": token, "username": user.username}

@app.post("/login")
def login(req_body: LoginRequest, db=Depends(get_db)):
    user = db.query(User).filter(User.email == req_body.email).first()
    if not user or not verify_password(req_body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    token = create_token(user.id)
    return {"token": token, "username": user.username}

@app.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"username": current_user.username, "email": current_user.email}

# --- Translate endpoints ---

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/limit")
def get_limit(request: Request):
    ip = request.client.host
    today = datetime.now().strftime("%Y-%m-%d")
    if limits[ip]["date"] != today:
        return {"used": 0, "total": DAILY_LIMIT, "remaining": DAILY_LIMIT}
    used = limits[ip]["count"]
    return {"used": used, "total": DAILY_LIMIT, "remaining": DAILY_LIMIT - used}

@app.post("/translate")
def translate(req_body: TranslateRequest, request: Request, current_user=Depends(get_current_user), db=Depends(get_db)):
    check_limit(request)
    system = f"You are a professional translator. Translate text to {req_body.target_language}. Return only the translation, nothing else."
    result = call_groq(system, req_body.text)
    entry = History(user_id=current_user.id, original=req_body.text, translation=result, target_lang=req_body.target_language, mode="simple")
    db.add(entry)
    db.commit()
    return {"translation": result}

@app.post("/translate/detailed")
def translate_detailed(req_body: TranslateRequest, request: Request, current_user=Depends(get_current_user), db=Depends(get_db)):
    check_limit(request)

    ui_lang = req_body.ui_language if hasattr(req_body, 'ui_language') else 'Russian'

    sections = req_body.sections if hasattr(req_body, 'sections') else {}

    system = f"You are a professional translator. Always respond in {ui_lang} language only.\n\n"
    system += "LANGUAGE: [source language name]\n\nTRANSLATION:\n[translation]\n\n"

    if sections.get('variants', True):
        system += "VARIANTS:\n- [variant 1]\n- [variant 2]\n- [variant 3]\n\n"
    if sections.get('grammar', True):
        system += "GRAMMAR:\n[grammar explanation]\n\n"
    if sections.get('tip', False):
        system += "TIP:\n[usage tip]\n\n"
    if sections.get('formality', False):
        system += "FORMALITY:\n[formal or conversational explanation]\n\n"
    if sections.get('transcription', False):
        system += "TRANSCRIPTION:\n[pronunciation transcription]\n\n"

    user_msg = f"Translate to {req_body.target_language}:\n\n{req_body.text}"
    result = call_groq(system, user_msg)
    entry = History(user_id=current_user.id, original=req_body.text, translation=result, target_lang=req_body.target_language, mode="detailed")
    db.add(entry)
    db.commit()
    return {"translation": result}

# --- Словарь endpoints ---

@app.post("/saved")
def save_word(req_body: SaveRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    already = db.query(Saved).filter(Saved.user_id == current_user.id, Saved.original == req_body.original, Saved.target_lang == req_body.target_lang).first()
    if already:
        raise HTTPException(status_code=400, detail="Уже сохранено")
    item = Saved(user_id=current_user.id, original=req_body.original, translation=req_body.translation, target_lang=req_body.target_lang, mode=req_body.mode)
    db.add(item)
    db.commit()
    return {"ok": True}

@app.get("/saved")
def get_saved(current_user=Depends(get_current_user), db=Depends(get_db)):
    items = db.query(Saved).filter(Saved.user_id == current_user.id).order_by(Saved.created_at.desc()).all()
    return [{"id": i.id, "original": i.original, "translation": i.translation, "targetLang": i.target_lang, "mode": i.mode} for i in items]

@app.delete("/saved/{item_id}")
def delete_saved(item_id: int, current_user=Depends(get_current_user), db=Depends(get_db)):
    item = db.query(Saved).filter(Saved.id == item_id, Saved.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Не найдено")
    db.delete(item)
    db.commit()
    return {"ok": True}

@app.get("/history")
def get_history(current_user=Depends(get_current_user), db=Depends(get_db)):
    items = db.query(History).filter(History.user_id == current_user.id).order_by(History.created_at.desc()).limit(20).all()
    return [{"original": i.original, "translation": i.translation, "targetLang": i.target_lang, "mode": i.mode} for i in items]