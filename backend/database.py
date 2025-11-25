from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./hotspots.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True)
    title = Column(String, index=True)
    url = Column(String)
    rank = Column(Integer)
    hot_value = Column(String) # e.g., "1000万热度"
    created_at = Column(DateTime, default=datetime.utcnow)
    content = Column(String, nullable=True) # Full text content
    media_paths = Column(String, nullable=True) # JSON string of local paths to images/videos
    summary = Column(String, nullable=True) # AI generated summary

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
