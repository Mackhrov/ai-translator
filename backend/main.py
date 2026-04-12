from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import defaultdict
from datetime import datetime
from typing import Optional
import requests as req
import os

from database import SessionLocal, User, Saved, History, DailyLimit, init_db
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

LANG_NAMES = {
    'ru': 'Russian', 'en': 'English', 'de': 'German',
    'uk': 'Ukrainian', 'es': 'Spanish', 'zh': 'Chinese', 'fr': 'French'
}

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

def check_limit(current_user, db):
    today = datetime.now().strftime("%Y-%m-%d")
    record = db.query(DailyLimit).filter(DailyLimit.user_id == current_user.id).first()

    if not record:
        record = DailyLimit(user_id=current_user.id, count=0, date=today)
        db.add(record)

    if record.date != today:
        record.count = 0
        record.date = today

    if record.count >= DAILY_LIMIT:
        db.commit()
        raise HTTPException(status_code=429, detail="Лимит переводов исчерпан")

    record.count += 1
    db.commit()

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
    ui_language: str = "en"

class SaveRequest(BaseModel):
    original: str
    translation: str
    target_lang: str
    mode: str

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

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/limit")
def get_limit(current_user=Depends(get_current_user), db=Depends(get_db)):
    today = datetime.now().strftime("%Y-%m-%d")
    record = db.query(DailyLimit).filter(DailyLimit.user_id == current_user.id).first()
    if not record or record.date != today:
        return {"used": 0, "total": DAILY_LIMIT, "remaining": DAILY_LIMIT}
    return {"used": record.count, "total": DAILY_LIMIT, "remaining": DAILY_LIMIT - record.count}

@app.post("/translate")
def translate(req_body: TranslateRequest, request: Request, current_user=Depends(get_current_user), db=Depends(get_db)):
    check_limit(current_user, db)
    system = f"You are a professional translator. Translate text to {req_body.target_language}. Return only the translation, nothing else. No explanations."
    result = call_groq(system, req_body.text)
    entry = History(user_id=current_user.id, original=req_body.text, translation=result, target_lang=req_body.target_language, mode="simple")
    db.add(entry)
    db.commit()
    return {"translation": result}

@app.post("/translate/detailed")
def translate_detailed(req_body: TranslateRequest, request: Request, current_user=Depends(get_current_user), db=Depends(get_db)):
    check_limit(current_user, db)

    ui_lang = LANG_NAMES.get(req_body.ui_language[:2] if req_body.ui_language else 'en', 'English')
    sections = req_body.sections

    system = (
        f"You are a professional translator and language teacher.\n"
        f"IMPORTANT: Write ALL your explanations, labels and text ONLY in {ui_lang}.\n"
        f"The translation itself should be in {req_body.target_language}.\n"
        f"Never mix languages in your response.\n\n"
        f"Use EXACTLY this format:\n\n"
        f"LANGUAGE: [name of the source language in {ui_lang}]\n\n"
        f"TRANSLATION:\n[translation in {req_body.target_language}]\n\n"
    )

    if sections.get('variants', True):
        system += f"VARIANTS:\n- [variant 1 in {req_body.target_language}]\n- [variant 2 in {req_body.target_language}]\n- [variant 3 in {req_body.target_language}]\n\n"
    if sections.get('grammar', True):
        system += f"GRAMMAR:\n[grammar explanation in {ui_lang}]\n\n"
    if sections.get('tip', False):
        system += f"TIP:\n[usage tip in {ui_lang}]\n\n"
    if sections.get('formality', False):
        system += f"FORMALITY:\n[formality explanation in {ui_lang}]\n\n"
    if sections.get('transcription', False):
        system += f"TRANSCRIPTION:\n[pronunciation of the {req_body.target_language} translation]\n\n"

    user_msg = f"Translate this text to {req_body.target_language}:\n\n{req_body.text}"
    result = call_groq(system, user_msg)
    entry = History(user_id=current_user.id, original=req_body.text, translation=result, target_lang=req_body.target_language, mode="detailed")
    db.add(entry)
    db.commit()
    return {"translation": result}

@app.post("/saved")
def save_word(req_body: SaveRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    already = db.query(Saved).filter(
        Saved.user_id == current_user.id,
        Saved.original == req_body.original,
        Saved.target_lang == req_body.target_lang
    ).first()
    if already:
        raise HTTPException(status_code=400, detail="Уже сохранено")
    item = Saved(
        user_id=current_user.id,
        original=req_body.original,
        translation=req_body.translation,
        target_lang=req_body.target_lang,
        mode=req_body.mode
    )
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