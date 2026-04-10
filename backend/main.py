from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import defaultdict
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set. Please create a .env file with GROQ_API_KEY=your_key")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

limits = defaultdict(lambda: {"count": 0, "date": ""})
DAILY_LIMIT = 10
def check_limit(request: Request):
    ip = request.client.host
    today = datetime.now().strftime("%Y-%m-%d")

    # Если новый день — сбрасываем счётчик
    if limits[ip]["date"] != today:
        limits[ip] = {"count": 0, "date": today}

    if limits[ip]["count"] >= DAILY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Лимит {DAILY_LIMIT} переводов в день исчерпан. Приходи завтра!"
        )

    limits[ip]["count"] += 1

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "English"
    source_language: str = "auto"

def call_groq(system: str, user: str) -> str:
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ],
                "max_tokens": 1024,
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        if "choices" not in data or not data["choices"]:
            raise ValueError("Invalid API response: no choices found")
        
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"API error: {str(e)}")
    except (KeyError, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse API response: {str(e)}")

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
def translate(req: TranslateRequest, request: Request):
    check_limit(request)
    system = f"You are a professional translator. Translate text to {req.target_language}. Return only the translation, nothing else."
    result = call_groq(system, req.text)
    return {"translation": result}

@app.post("/translate/detailed")
def translate_detailed(req: TranslateRequest, request: Request):
    check_limit(request)
    system = """Ты профессиональный переводчик и преподаватель языков. Отвечай ТОЛЬКО на русском языке.
Твой ответ должен содержать ровно 4 секции в таком формате:

ЯЗЫК: [название языка оригинала]

ПЕРЕВОД:
[перевод на целевой язык]

ВАРИАНТЫ:
- [вариант 1]
- [вариант 2]
- [вариант 3]

ГРАММАТИКА:
[объяснение грамматики на русском]

СОВЕТ:
[совет по использованию на русском]"""

    user = f"Переведи на {req.target_language}:\n\n{req.text}"
    result = call_groq(system, user)
    return {"translation": result}