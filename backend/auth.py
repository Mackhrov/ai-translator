from datetime import datetime, timedelta

from fastapi import HTTPException
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import JWT_SECRET_KEY

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, JWT_SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> int:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Токен недействителен") from exc
