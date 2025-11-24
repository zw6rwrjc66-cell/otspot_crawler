from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, init_db, Hotspot
from crawler import run_crawler_task
from apscheduler.schedulers.background import BackgroundScheduler
from typing import List, Optional
from pydantic import BaseModel
import datetime

app = FastAPI(title="Hotspot Crawler API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(run_crawler_task, 'interval', minutes=30) # Default 30 mins
scheduler.start()

# Init DB
init_db()

# Pydantic Models
class HotspotModel(BaseModel):
    id: int
    source: str
    title: str
    url: str
    rank: int
    hot_value: str
    created_at: datetime.datetime

    class Config:
        orm_mode = True

@app.get("/")
def read_root():
    return {"message": "Hotspot Crawler API is running"}

@app.post("/crawl")
def trigger_crawl():
    """Manually trigger a crawl task"""
    run_crawler_task()
    return {"message": "Crawl task triggered"}

@app.get("/hotspots", response_model=List[HotspotModel])
def get_hotspots(source: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(Hotspot)
    if source:
        query = query.filter(Hotspot.source == source)
    # Get latest ones. Ideally we should group by crawl batch, but for now just latest by time.
    return query.order_by(Hotspot.created_at.desc()).limit(limit).all()

@app.get("/sources")
def get_sources(db: Session = Depends(get_db)):
    return db.query(Hotspot.source).distinct().all()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()
