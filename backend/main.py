from datetime import datetime
from typing import Optional

import requests as req
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from auth import create_token, decode_token, hash_password, verify_password
from config import ALLOWED_ORIGINS, ALLOWED_ORIGIN_REGEX, GROQ_API_KEY, JWT_SECRET_KEY_IS_EPHEMERAL
from database import DailyLimit, History, Saved, SessionLocal, User, init_db

app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGINS,  "http://localhost:5173",
        "https://ai-translator-snowy-ten.vercel.app",],
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

DAILY_LIMIT = 30

LANG_NAMES = {
    "ru": "Russian",
    "en": "English",
    "de": "German",
    "uk": "Ukrainian",
    "es": "Spanish",
    "zh": "Chinese",
    "fr": "French",
}

LANG_ALIASES = {
    "russian": "ru",
    "english": "en",
    "german": "de",
    "ukrainian": "uk",
    "spanish": "es",
    "chinese": "zh",
    "french": "fr",
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

    token = authorization.replace("Bearer ", "", 1)
    user_id = decode_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user


def get_today() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def ensure_limit_available(current_user, db):
    today = get_today()
    record = db.query(DailyLimit).filter(DailyLimit.user_id == current_user.id).first()

    if not record:
        record = DailyLimit(user_id=current_user.id, count=0, date=today)
        db.add(record)
        db.flush()

    if record.date != today:
        record.count = 0
        record.date = today

    if record.count >= DAILY_LIMIT:
        raise HTTPException(status_code=429, detail="Лимит переводов исчерпан")

    return record


def save_successful_translation(db, limit_record, history_entry: History):
    limit_record.count += 1
    db.add(history_entry)
    db.commit()


def resolve_ui_language(value: Optional[str]) -> str:
    if not value:
        return "English"

    normalized = value.strip().lower()

    if normalized in LANG_NAMES:
        return LANG_NAMES[normalized]

    if normalized in LANG_ALIASES:
        return LANG_NAMES[LANG_ALIASES[normalized]]

    base_code = normalized.split("-", 1)[0]
    if base_code in LANG_NAMES:
        return LANG_NAMES[base_code]

    return "English"


def build_detailed_system_prompt(target: str, ui_lang: str, sections: dict) -> str:
    prompt = f"""You are a professional translator.
Follow these rules exactly:
- Keep ALL section headers in English exactly as written below.
- Write the content of LANGUAGE, GRAMMAR, TIP and FORMALITY in {ui_lang}.
- Write TRANSLATION and VARIANTS in {target}.
- Write TRANSCRIPTION as pronunciation guidance that is easy for a {ui_lang} speaker to read.
- Do not add any introduction, conclusion or extra sections.
- If a section is not requested, omit it completely.

Return this exact structure:
LANGUAGE:
[source language name written in {ui_lang}]

TRANSLATION:
[translation in {target}]"""

    if sections.get("variants", True):
        prompt += f"""

VARIANTS:
- [alternative 1 in {target}]
- [alternative 2 in {target}]
- [alternative 3 in {target}]"""

    if sections.get("grammar", True):
        prompt += f"""

GRAMMAR:
[grammar explanation written in {ui_lang}]"""

    if sections.get("tip", False):
        prompt += f"""

TIP:
[usage tip written in {ui_lang}]"""

    if sections.get("formality", False):
        prompt += f"""

FORMALITY:
[formality explanation written in {ui_lang}]"""

    if sections.get("transcription", False):
        prompt += f"""

TRANSCRIPTION:
[pronunciation guidance for the {target} translation, written for a {ui_lang} speaker]"""

    return prompt


def call_groq(system: str, user: str) -> str:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="Сервис перевода не настроен")

    try:
        response = req.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "max_tokens": 1024,
                "temperature": 0.2,
            },
            timeout=30,
        )
        response.raise_for_status()
    except req.Timeout as exc:
        raise HTTPException(status_code=504, detail="Сервис перевода не ответил вовремя") from exc
    except req.RequestException as exc:
        raise HTTPException(status_code=502, detail="Сервис перевода временно недоступен") from exc

    try:
        data = response.json()
        content = data["choices"][0]["message"]["content"].strip()
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="Сервис перевода вернул неожиданный ответ") from exc

    if not content:
        raise HTTPException(status_code=502, detail="Сервис перевода вернул пустой ответ")

    return content


if JWT_SECRET_KEY_IS_EPHEMERAL:
    print("Warning: JWT_SECRET_KEY is not set. Using an ephemeral secret for this process.")


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
    sections: dict = Field(default_factory=dict)
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
        password_hash=hash_password(req_body.password),
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
    today = get_today()
    record = db.query(DailyLimit).filter(DailyLimit.user_id == current_user.id).first()
    if not record or record.date != today:
        return {"used": 0, "total": DAILY_LIMIT, "remaining": DAILY_LIMIT}
    return {"used": record.count, "total": DAILY_LIMIT, "remaining": DAILY_LIMIT - record.count}


@app.post("/translate")
def translate(req_body: TranslateRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    limit_record = ensure_limit_available(current_user, db)
    system = (
        f"You are a professional translator. Translate text to {req_body.target_language}. "
        "Return only the translation, nothing else. No explanations."
    )
    result = call_groq(system, req_body.text)

    history_entry = History(
        user_id=current_user.id,
        original=req_body.text,
        translation=result,
        target_lang=req_body.target_language,
        mode="simple",
    )
    save_successful_translation(db, limit_record, history_entry)
    return {"translation": result}


@app.post("/translate/detailed")
def translate_detailed(req_body: TranslateRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    limit_record = ensure_limit_available(current_user, db)

    ui_lang = resolve_ui_language(req_body.ui_language)
    target = req_body.target_language
    sections = req_body.sections

    system = build_detailed_system_prompt(target, ui_lang, sections)
    source_hint = ""
    if req_body.source_language and req_body.source_language != "auto":
        source_hint = f"Source language hint: {req_body.source_language}\n"
    user_msg = f"{source_hint}Text to translate:\n{req_body.text}"

    result = call_groq(system, user_msg)

    history_entry = History(
        user_id=current_user.id,
        original=req_body.text,
        translation=result,
        target_lang=target,
        mode="detailed",
    )
    save_successful_translation(db, limit_record, history_entry)
    return {"translation": result}


@app.post("/saved")
def save_word(req_body: SaveRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    already = db.query(Saved).filter(
        Saved.user_id == current_user.id,
        Saved.original == req_body.original,
        Saved.target_lang == req_body.target_lang,
    ).first()
    if already:
        raise HTTPException(status_code=400, detail="Уже сохранено")

    item = Saved(
        user_id=current_user.id,
        original=req_body.original,
        translation=req_body.translation,
        target_lang=req_body.target_lang,
        mode=req_body.mode,
    )
    db.add(item)
    db.commit()
    return {"ok": True}


@app.get("/saved")
def get_saved(current_user=Depends(get_current_user), db=Depends(get_db)):
    items = db.query(Saved).filter(Saved.user_id == current_user.id).order_by(Saved.created_at.desc()).all()
    return [
        {
            "id": item.id,
            "original": item.original,
            "translation": item.translation,
            "targetLang": item.target_lang,
            "mode": item.mode,
        }
        for item in items
    ]


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
    return [
        {
            "original": item.original,
            "translation": item.translation,
            "targetLang": item.target_lang,
            "mode": item.mode,
        }
        for item in items
    ]


@app.delete("/history")
def clear_history(current_user=Depends(get_current_user), db=Depends(get_db)):
    db.query(History).filter(History.user_id == current_user.id).delete()
    db.commit()
    return {"ok": True}
