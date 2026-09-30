import os
import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.models.infrastructure import DistrictInfrastructureBaseline
from app.models.feedback import CitizenFeedback
from app.services.clustering_service import cluster_and_calculate_hotspots
from app.api.router import api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("jansetu_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database tables
    logger.info("Initializing JanSetu database tables...")
    await init_db()
    
    # Auto-seed initial baseline and synthetic demonstration data if empty
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(func.count(DistrictInfrastructureBaseline.id)))
        count = res.scalar() or 0
        if count == 0:
            logger.info("Database is empty. Auto-seeding realistic district baselines and synthetic demo complaints...")
            base_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(base_dir, "..", "data")
            
            # Seed baselines
            b_path = os.path.join(data_dir, "district_baselines.json")
            if os.path.exists(b_path):
                with open(b_path, "r", encoding="utf-8") as f:
                    b_data = json.load(f)
                for item in b_data:
                    db.add(DistrictInfrastructureBaseline(**item))
                await db.commit()
                
            # Seed synthetic complaints
            c_path = os.path.join(data_dir, "synthetic_complaints.json")
            if os.path.exists(c_path):
                with open(c_path, "r", encoding="utf-8") as f:
                    c_data = json.load(f)
                for item in c_data:
                    db.add(CitizenFeedback(**item))
                await db.commit()
                
            # Compute initial hotspots
            h_count = await cluster_and_calculate_hotspots(db)
            logger.info(f"Auto-seed completed. {len(b_data)} districts, {len(c_data)} complaints, {h_count} hotspots generated.")
            
    yield
    logger.info("Shutting down JanSetu backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multilingual Citizen Voice-to-Needs Civic Intelligence & Infrastructure Prioritization Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "project": "JanSetu AI",
        "description": "Civic intelligence prototype converting multilingual citizen voice/text feedback into structured infrastructure priorities.",
        "status": "online",
        "version": "1.0.0",
        "disclaimer": "DEMONSTRATION PROTOTYPE: All citizen grievances are synthetic test cases generated for civic technology research.",
        "endpoints": {
            "docs": "/docs",
            "citizen_text": "/api/v1/citizen/submit-text",
            "citizen_voice": "/api/v1/citizen/submit-voice",
            "government_stats": "/api/v1/gov/stats",
            "hotspots": "/api/v1/gov/hotspots",
            "recalculate": "/api/v1/gov/recalculate",
            "demo_scenarios": "/api/v1/admin/scenarios"
        }
    }
