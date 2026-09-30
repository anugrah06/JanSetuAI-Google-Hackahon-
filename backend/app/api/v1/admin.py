import json
import os
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, desc
from app.core.database import get_db
from app.models.feedback import CitizenFeedback
from app.models.infrastructure import DistrictInfrastructureBaseline
from app.models.hotspot import Hotspot
from app.services.clustering_service import cluster_and_calculate_hotspots
from app.schemas.hotspot import HotspotSummary, HotspotDetail
from app.schemas.score_breakdown import ScoreBreakdown, FactorComponent, EvidenceCitation, ActionItem

router = APIRouter(prefix="/admin", tags=["Demo Administration & Seeding"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_DIR = os.path.join(BASE_DIR, "data")


async def execute_deterministic_seed(
    db: AsyncSession,
    reset_user_records: bool = False,
    scenario_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Deterministically seeds or resets demonstration data.
    - If reset_user_records is False, ONLY synthetic demo records are reset,
      leaving genuine user-submitted feedback completely intact.
    - If reset_user_records is True, all citizen feedback records are cleared.
    - Never appends duplicate synthetic complaints on repeated invocations.
    """
    # 1. Clear designated feedback records
    if reset_user_records:
        await db.execute(delete(CitizenFeedback))
    else:
        # Delete ONLY synthetic records
        await db.execute(delete(CitizenFeedback).where(CitizenFeedback.is_synthetic == True))

    # 2. Reset district baselines to fixed reference data
    await db.execute(delete(DistrictInfrastructureBaseline))
    await db.commit()

    baselines_path = os.path.join(DATA_DIR, "district_baselines.json")
    with open(baselines_path, "r", encoding="utf-8") as f:
        baselines_data = json.load(f)

    for item in baselines_data:
        db.add(DistrictInfrastructureBaseline(**item))
    await db.commit()

    # 3. Load fixed deterministic synthetic complaints
    complaints_path = os.path.join(DATA_DIR, "synthetic_complaints.json")
    with open(complaints_path, "r", encoding="utf-8") as f:
        complaints_data = json.load(f)

    if scenario_id:
        seed_complaints = [c for c in complaints_data if c.get("demo_scenario_id") == scenario_id]
    else:
        seed_complaints = complaints_data

    for item in seed_complaints:
        db.add(CitizenFeedback(**item))
    await db.commit()

    # 4. Trigger deterministic clustering & priority calculation
    hotspot_count = await cluster_and_calculate_hotspots(db)

    # 5. Count preserved user records
    user_res = await db.execute(select(func.count(CitizenFeedback.id)).where(CitizenFeedback.is_synthetic == False))
    user_records_count = user_res.scalar() or 0

    return {
        "status": "success",
        "message": "Deterministic demo data successfully seeded. Genuine citizen records preserved.",
        "districts_loaded": len(baselines_data),
        "synthetic_complaints_loaded": len(seed_complaints),
        "user_records_preserved": user_records_count,
        "hotspots_generated": hotspot_count
    }


@router.post("/seed-demo")
async def seed_demo_data(
    reset_user_records: bool = Query(False, description="Whether to also clear genuine user-submitted complaints"),
    scenario_id: Optional[str] = Query(None, description="Optional single scenario ID to seed"),
    db: AsyncSession = Depends(get_db)
):
    """
    Idempotent deterministic seed endpoint.
    Safely resets synthetic demonstration records while preserving genuine citizen feedback.
    """
    return await execute_deterministic_seed(
        db=db,
        reset_user_records=reset_user_records,
        scenario_id=scenario_id
    )


@router.post("/reset-demo")
async def reset_demo_data(
    reset_user_records: bool = Query(False, description="Whether to also clear genuine user-submitted complaints"),
    scenario_id: Optional[str] = Query(None, description="Optional single scenario ID to reset"),
    db: AsyncSession = Depends(get_db)
):
    """
    Explicit alias for developer/admin demo reset.
    Guarantees that repeated executions return to the exact same deterministic dataset.
    """
    return await execute_deterministic_seed(
        db=db,
        reset_user_records=reset_user_records,
        scenario_id=scenario_id
    )


@router.get("/complaints")
async def list_demo_complaints(
    scenario_id: Optional[str] = Query(None, description="Filter complaints by demo scenario ID"),
    district: Optional[str] = Query(None, description="Filter complaints by district"),
    category: Optional[str] = Query(None, description="Filter complaints by category"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns synthetic citizen feedback complaints for inspection in Demo Mode.
    """
    query = select(CitizenFeedback).order_by(CitizenFeedback.id)
    if scenario_id:
        query = query.where(CitizenFeedback.demo_scenario_id == scenario_id)
    if district:
        query = query.where(CitizenFeedback.district.ilike(f"%{district}%"))
    if category:
        query = query.where(CitizenFeedback.category == category)
    result = await db.execute(query)
    complaints = result.scalars().all()
    return [
        {
            "id": c.id,
            "language": c.language,
            "input_mode": c.input_mode,
            "raw_input": c.raw_input,
            "category": c.category,
            "sub_issue": c.sub_issue,
            "state": c.state,
            "district": c.district,
            "taluka_or_ward": c.taluka_or_ward,
            "landmark": c.landmark,
            "severity_score": c.severity_score,
            "urgency": c.urgency,
            "affected_group": c.affected_group,
            "is_synthetic": c.is_synthetic,
            "demo_scenario_id": c.demo_scenario_id
        }
        for c in complaints
    ]


@router.get("/scenarios")
async def list_demo_scenarios():
    """
    Returns pre-configured demonstration scenarios with deterministic priority expectations.
    """
    return [
        {
            "id": "marathwada_water_crisis",
            "title": "Marathwada Drought & Water Tanker Disruption",
            "civic_problem": "Acute water shortages, dried borewells, and sewage mixing with broken drinking supply pipelines.",
            "region": "Beed District (Ashti & Gevrai)",
            "synthetic_complaints_count": 6,
            "resulting_hotspot": "Beed (Ashti) — Rank #1 Hotspot",
            "category": "WATER_AND_SANITATION",
            "description": "Acute water shortages, dried borewells, and sewage mixing with broken public drinking water pipelines.",
            "languages": ["Hindi", "English"],
            "priority_score": 72.0,
            "expected_priority": "CRITICAL (72.0)"
        },
        {
            "id": "konkan_road_washout",
            "title": "Konkan Coastal Highway Culvert Collapse",
            "civic_problem": "Monsoon road washouts and structural cracks on river culvert bridge blocking emergency ambulances.",
            "region": "Ratnagiri District (Chiplun)",
            "synthetic_complaints_count": 3,
            "resulting_hotspot": "Ratnagiri (Chiplun) — Rank #2 Hotspot",
            "category": "ROADS_AND_TRANSPORT",
            "description": "Monsoon road washouts, structural cracks on river culvert bridge blocking emergency ambulances.",
            "languages": ["Hindi", "English"],
            "priority_score": 63.0,
            "expected_priority": "HIGH (63.0)"
        },
        {
            "id": "vidarbha_grid_failure",
            "title": "Vidarbha Agricultural Transformer & Health Center Outage",
            "civic_problem": "11KV transformer burn-out impacting paddy crop irrigation and threatening clinic vaccine cold-chain.",
            "region": "Chandrapur District (Bhadravati)",
            "synthetic_complaints_count": 3,
            "resulting_hotspot": "Chandrapur (Bhadravati) — Rank #4 Hotspot",
            "category": "ELECTRICITY_AND_ENERGY",
            "description": "11KV transformer burn-out impacting paddy crop irrigation and threatening vaccine cold-chain in rural health clinic.",
            "languages": ["Hindi", "English"],
            "priority_score": 55.0,
            "expected_priority": "HIGH (55.0)"
        },
        {
            "id": "urban_sanitation_overflow",
            "title": "Peri-Urban Drainage & Uncollected Waste",
            "civic_problem": "Blocked stormwater drains overflowing onto school access routes with dengue outbreak risk.",
            "region": "Pune District (Haveli - Wagholi)",
            "synthetic_complaints_count": 2,
            "resulting_hotspot": "Pune (Haveli) — Rank #5 Hotspot",
            "category": "CIVIC_AMENITIES",
            "description": "Blocked stormwater drains overflowing onto school access routes with dengue outbreak risk.",
            "languages": ["Hindi", "English"],
            "priority_score": 48.4,
            "expected_priority": "MEDIUM (48.4)"
        }
    ]


@router.get("/demo-hotspots", response_model=List[HotspotSummary])
async def list_demo_hotspots(
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Public/Judge endpoint for Hackathon Demo Mode.
    Returns synthetic demonstration hotspots without requiring administrative login.
    """
    query = select(Hotspot).order_by(desc(Hotspot.final_priority_score))

    if state:
        query = query.where(Hotspot.state.ilike(f"%{state}%"))
    if district:
        query = query.where(Hotspot.district.ilike(f"%{district}%"))
    if category:
        query = query.where(Hotspot.category == category)

    result = await db.execute(query)
    hotspots = result.scalars().all()

    return [
        HotspotSummary(
            id=str(h.id),
            category=h.category,
            state=h.state,
            district=h.district,
            taluka_or_ward=h.taluka_or_ward,
            center_lat=h.center_lat,
            center_lng=h.center_lng,
            radius_km=h.radius_km,
            complaint_count=h.complaint_count,
            dominant_urgency=h.dominant_urgency,
            avg_severity=h.avg_severity,
            final_priority_score=h.final_priority_score,
            detected_headline=h.detected_headline,
            last_updated=h.updated_at
        )
        for h in hotspots
    ]


@router.get("/demo-hotspots/{hotspot_id}", response_model=HotspotDetail)
async def get_demo_hotspot_detail(
    hotspot_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Public/Judge endpoint for Hackathon Demo Mode walkthrough and hotspot inspection.
    """
    result = await db.execute(select(Hotspot).where(Hotspot.id == hotspot_id))
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(status_code=404, detail="Hotspot not found.")

    raw_demand = round((h.score_citizen_demand / 0.35), 1) if h.score_citizen_demand else 0.0
    raw_infra = round((h.score_infrastructure_gap / 0.25), 1) if h.score_infrastructure_gap else 0.0
    raw_pop = round((h.score_population_impact / 0.20), 1) if h.score_population_impact else 0.0
    raw_sev = round((h.score_severity / 0.10), 1) if h.score_severity else 0.0
    raw_inv = round((h.score_investment_gap / 0.10), 1) if h.score_investment_gap else 0.0

    breakdown = ScoreBreakdown(
        citizen_demand=FactorComponent(
            name="Citizen Demand Volume",
            weight_percentage=35.0,
            raw_score=min(100.0, raw_demand),
            weighted_score=round(h.score_citizen_demand, 2),
            benchmark_data=f"{h.complaint_count} registered grievances in localized zone"
        ),
        infrastructure_gap=FactorComponent(
            name="Infrastructure Gap Deficit",
            weight_percentage=25.0,
            raw_score=min(100.0, raw_infra),
            weighted_score=round(h.score_infrastructure_gap, 2),
            benchmark_data=f"District Sector Deficit Index: {raw_infra}/100"
        ),
        population_impact=FactorComponent(
            name="Population & Vulnerability Exposure",
            weight_percentage=20.0,
            raw_score=min(100.0, raw_pop),
            weighted_score=round(h.score_population_impact, 2),
            benchmark_data="Census density and rural vulnerability weighting"
        ),
        severity=FactorComponent(
            name="Extracted Problem Severity",
            weight_percentage=10.0,
            raw_score=min(100.0, raw_sev),
            weighted_score=round(h.score_severity, 2),
            benchmark_data=f"Average severity {h.avg_severity} / 5.0 scale"
        ),
        investment_gap=FactorComponent(
            name="Historical Investment Deficit",
            weight_percentage=10.0,
            raw_score=min(100.0, raw_inv),
            weighted_score=round(h.score_investment_gap, 2),
            benchmark_data="Prior 3-5 fiscal years capex gap index"
        ),
        final_score=h.final_priority_score
    )

    citations = [EvidenceCitation(**c) for c in (h.evidence_citation_json or [])]
    actions = [ActionItem(**a) for a in (h.suggested_action_plan or [])]

    return HotspotDetail(
        id=str(h.id),
        category=h.category,
        state=h.state,
        district=h.district,
        taluka_or_ward=h.taluka_or_ward,
        center_lat=h.center_lat,
        center_lng=h.center_lng,
        radius_km=h.radius_km,
        complaint_count=h.complaint_count,
        dominant_urgency=h.dominant_urgency,
        avg_severity=h.avg_severity,
        final_priority_score=h.final_priority_score,
        detected_headline=h.detected_headline,
        last_updated=h.updated_at,
        affected_groups_summary=h.affected_groups_summary or [],
        score_breakdown=breakdown,
        evidence_citations=citations,
        gemini_narrative=h.gemini_narrative,
        suggested_action_plan=actions
    )
