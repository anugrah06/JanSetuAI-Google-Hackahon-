import json
import os
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.database import get_db
from app.models.feedback import CitizenFeedback
from app.models.infrastructure import DistrictInfrastructureBaseline
from app.models.hotspot import Hotspot
from app.services.clustering_service import cluster_and_calculate_hotspots

router = APIRouter(prefix="/admin", tags=["Demo Administration & Seeding"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")

@router.post("/seed-demo")
async def seed_demo_data(db: AsyncSession = Depends(get_db)):
    """
    Clears existing feedback & hotspots, loads realistic district baselines
    and clearly labelled synthetic citizen demonstration data, then calculates hotspots.
    """
    # 1. Clear existing tables
    await db.execute(delete(Hotspot))
    await db.execute(delete(CitizenFeedback))
    await db.execute(delete(DistrictInfrastructureBaseline))
    await db.commit()

    # 2. Load district baselines
    baselines_path = os.path.join(DATA_DIR, "district_baselines.json")
    with open(baselines_path, "r", encoding="utf-8") as f:
        baselines_data = json.load(f)

    for item in baselines_data:
        b = DistrictInfrastructureBaseline(**item)
        db.add(b)
    await db.commit()

    # 3. Load synthetic complaints
    complaints_path = os.path.join(DATA_DIR, "synthetic_complaints.json")
    with open(complaints_path, "r", encoding="utf-8") as f:
        complaints_data = json.load(f)

    for item in complaints_data:
        c = CitizenFeedback(**item)
        db.add(c)
    await db.commit()

    # 4. Trigger clustering & deterministic priority scoring
    hotspot_count = await cluster_and_calculate_hotspots(db)

    return {
        "status": "success",
        "message": "Demo data successfully seeded. All citizen data is clearly labeled synthetic.",
        "districts_loaded": len(baselines_data),
        "complaints_loaded": len(complaints_data),
        "hotspots_generated": hotspot_count
    }


@router.get("/scenarios")
async def list_demo_scenarios():
    """
    Returns pre-configured demonstration scenarios.
    """
    return [
        {
            "id": "marathwada_water_crisis",
            "title": "Marathwada Drought & Water Tanker Disruption",
            "region": "Beed District (Ashti & Gevrai)",
            "category": "WATER_AND_SANITATION",
            "description": "Acute water shortages, dried borewells, and sewage mixing with broken public drinking water pipelines.",
            "languages": ["Marathi", "Hindi", "English"],
            "expected_priority": "CRITICAL (80+)"
        },
        {
            "id": "konkan_road_washout",
            "title": "Konkan Coastal Highway Culvert Collapse",
            "region": "Ratnagiri District (Chiplun Ghats)",
            "category": "ROADS_AND_TRANSPORT",
            "description": "Monsoon road washouts, structural cracks on river culvert bridge blocking emergency ambulances.",
            "languages": ["Marathi", "English"],
            "expected_priority": "CRITICAL (75+)"
        },
        {
            "id": "vidarbha_grid_failure",
            "title": "Vidarbha Agricultural Transformer & Health Center Outage",
            "region": "Chandrapur District (Bhadravati)",
            "category": "ELECTRICITY_AND_ENERGY",
            "description": "11KV transformer burn-out impacting paddy crop irrigation and threatening vaccine cold-chain in rural health clinic.",
            "languages": ["Hindi", "Marathi"],
            "expected_priority": "HIGH (70+)"
        },
        {
            "id": "urban_sanitation_overflow",
            "title": "Peri-Urban Drainage & Uncollected Waste",
            "region": "Pune District (Haveli - Wagholi)",
            "category": "CIVIC_AMENITIES",
            "description": "Blocked stormwater drains overflowing onto school access routes with dengue outbreak risk.",
            "languages": ["Marathi", "English"],
            "expected_priority": "MEDIUM (55-65)"
        }
    ]
