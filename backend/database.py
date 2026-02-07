from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Go up one level to root if needed, or keep in backend.
# The user's list_dir showed expenses.db in d:/mini (root).
# database.py is in d:/mini/backend.
# So we want d:/mini/expenses.db = os.path.join(os.path.dirname(BASE_DIR), "expenses.db")

ROOT_DIR = os.path.dirname(BASE_DIR)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(ROOT_DIR, 'expenses.db')}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
