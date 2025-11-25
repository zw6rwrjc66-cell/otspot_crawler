from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import get_db, init_db, Hotspot
from crawler import run_crawler_task
from apscheduler.schedulers.background import BackgroundScheduler
from typing import List, Optional
from pydantic import BaseModel
import datetime
import os

app = FastAPI(title="Hotspot Crawler API")

# Mount static files directory for screenshots
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scheduler (disabled for manual-only mode)
# scheduler = BackgroundScheduler()
# scheduler.add_job(run_crawler_task, 'interval', minutes=30)
# scheduler.start()

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
    content: Optional[str] = None
    media_paths: Optional[str] = None
    summary: Optional[str] = None

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
    """Get list of all data sources"""
    sources = db.query(Hotspot.source).distinct().all()
    return [source[0] for source in sources]

@app.delete("/hotspots/{hotspot_id}")
def delete_hotspot(hotspot_id: int, db: Session = Depends(get_db)):
    """Delete a hotspot by ID"""
    hotspot = db.query(Hotspot).filter(Hotspot.id == hotspot_id).first()
    if not hotspot:
        raise HTTPException(status_code=404, detail="Hotspot not found")
    db.delete(hotspot)
    db.commit()
    return {"message": "Hotspot deleted successfully", "id": hotspot_id}

@app.delete("/hotspots")
def delete_hotspots_batch(ids: List[int], db: Session = Depends(get_db)):
    """Delete multiple hotspots by IDs"""
    deleted_count = db.query(Hotspot).filter(Hotspot.id.in_(ids)).delete(synchronize_session=False)
    db.commit()
    return {"message": f"Deleted {deleted_count} hotspots", "count": deleted_count}

from crawler import fetch_hotspot_details

@app.post("/hotspots/{hotspot_id}/fetch_details")
def fetch_details_endpoint(hotspot_id: int, db: Session = Depends(get_db)):
    """Fetch content and generate summary for a specific hotspot"""
    hotspot = db.query(Hotspot).filter(Hotspot.id == hotspot_id).first()
    if not hotspot:
        raise HTTPException(status_code=404, detail="Hotspot not found")
    
    content, media_paths, summary = fetch_hotspot_details(hotspot.url, hotspot.source)
    
    hotspot.content = content
    hotspot.media_paths = media_paths
    hotspot.summary = summary
    
    db.commit()
    db.refresh(hotspot)
    return hotspot

@app.get("/scheduler/status")
def get_scheduler_status():
    """Get scheduler status - currently in manual-only mode"""
    return {
        "status": "manual_only",
        "mode": "手动触发模式",
        "description": "需要手动点击按钮触发爬取"
    }

# @app.on_event("shutdown")
# def shutdown_event():
#     scheduler.shutdown()
