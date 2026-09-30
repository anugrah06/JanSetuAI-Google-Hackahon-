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
            logger.info("Database is empty. Running deterministic demo auto-seed...")
            from app.api.v1.admin import execute_deterministic_seed
            result = await execute_deterministic_seed(db)
            logger.info(f"Auto-seed completed: {result['districts_loaded']} districts, {result['synthetic_complaints_loaded']} complaints, {result['hotspots_generated']} hotspots.")

        # Ensure default development admin and citizen accounts exist with secure password hashes
        from app.models.user import User
        from app.core.security import get_password_hash

        # 1. Admin Account
        admin_res = await db.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
        if not admin_res.scalar_one_or_none():
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                username="admin",
                full_name="Government Administrator",
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                role="GOVERNMENT_ADMIN",
                is_active=True
            )
            db.add(admin_user)
            logger.info(f"Created default development admin user ({settings.ADMIN_EMAIL})")

        # 2. Citizen Account
        citizen_res = await db.execute(select(User).where(User.email == settings.CITIZEN_EMAIL))
        if not citizen_res.scalar_one_or_none():
            citizen_user = User(
                email=settings.CITIZEN_EMAIL,
                username="citizen",
                full_name="Ramesh Pawar (Citizen)",
                password_hash=get_password_hash(settings.CITIZEN_PASSWORD),
                role="CITIZEN",
                is_active=True
            )
            db.add(citizen_user)
            logger.info(f"Created default development citizen user ({settings.CITIZEN_EMAIL})")

        await db.commit()
            
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
