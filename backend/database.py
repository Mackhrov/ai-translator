from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from config import DATABASE_URL

engine_kwargs = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    saved = relationship("Saved", back_populates="user", cascade="all, delete")
    history = relationship("History", back_populates="user", cascade="all, delete")
    daily_limit = relationship("DailyLimit", back_populates="user", cascade="all, delete")


class Saved(Base):
    __tablename__ = "saved"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    original = Column(Text)
    translation = Column(Text)
    target_lang = Column(String)
    mode = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="saved")


class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    original = Column(Text)
    translation = Column(Text)
    target_lang = Column(String)
    mode = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="history")


class DailyLimit(Base):
    __tablename__ = "daily_limits"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    count = Column(Integer, default=0)
    date = Column(String, default="")
    user = relationship("User", back_populates="daily_limit")


def init_db():
    Base.metadata.create_all(engine)
