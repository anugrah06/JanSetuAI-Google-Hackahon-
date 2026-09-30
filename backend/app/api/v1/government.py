from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.models.feedback import CitizenFeedback
from app.models.hotspot import Hotspot
from app.schemas.hotspot import HotspotSummary, HotspotDetail, GovernmentStats
from app.schemas.score_breakdown import ScoreBreakdown, FactorComponent, EvidenceCitation, ActionItem
from app.services.clustering_service import cluster_and_calculate_hotspots

router = APIRouter(prefix="/gov", tags=["Government Intelligence & Dashboard"])

@router.get("/stats", response_model=GovernmentStats)
async def get_government_stats(db: AsyncSession = Depends(get_db)):
    """
    Returns aggregated KPIs for the executive government dashboard.
    """
    # 1. Total complaints
    c_res = await db.execute(select(func.count(CitizenFeedback.id)))
    total_complaints = c_res.scalar() or 0

    # 2. Hotspots
    h_res = await db.execute(select(func.count(Hotspot.id)))
    active_hotspots = h_res.scalar() or 0

    # 3. Critical hotspots (score >= 70.0)
    crit_res = await db.execute(select(func.count(Hotspot.id)).where(Hotspot.final_priority_score >= 70.0))
    critical_hotspots = crit_res.scalar() or 0

    # 4. Top categories
    cat_res = await db.execute(
        select(CitizenFeedback.category, func.count(CitizenFeedback.id))
        .group_by(CitizenFeedback.category)
        .order_by(desc(func.count(CitizenFeedback.id)))
    )
    top_categories = [{"category": row[0], "count": row[1]} for row in cat_res.all()]

    # 5. Language breakdown
    lang_res = await db.execute(
        select(CitizenFeedback.language, func.count(CitizenFeedback.id))
        .group_by(CitizenFeedback.language)
    )
    lang_counts = {row[0]: row[1] for row in lang_res.all()}

    # 6. Districts covered
    dist_res = await db.execute(select(func.count(func.distinct(CitizenFeedback.district))))
    districts_count = dist_res.scalar() or 0

    return GovernmentStats(
        total_complaints=total_complaints,
        active_hotspots_count=active_hotspots,
        critical_priority_hotspots=critical_hotspots,
        top_categories=top_categories,
        language_breakdown=lang_counts,
        districts_covered=districts_count
    )


@router.get("/hotspots", response_model=List[HotspotSummary])
async def list_hotspots(
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    min_score: Optional[float] = Query(None, ge=0.0, le=100.0),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves filtered infrastructure hotspots sorted by transparent priority score.
    """
    query = select(Hotspot).order_by(desc(Hotspot.final_priority_score))

    if state:
        query = query.where(Hotspot.state.ilike(f"%{state}%"))
    if district:
        query = query.where(Hotspot.district.ilike(f"%{district}%"))
    if category:
        query = query.where(Hotspot.category == category)
    if min_score is not None:
        query = query.where(Hotspot.final_priority_score >= min_score)

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


@router.get("/hotspots/{hotspot_id}", response_model=HotspotDetail)
async def get_hotspot_detail(
    hotspot_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns deep-dive explainability details for a specific hotspot,
    including the transparent 5-factor mathematical score breakdown,
    ground citizen quotes, and Gemini executive recommendations.
    """
    result = await db.execute(select(Hotspot).where(Hotspot.id == hotspot_id))
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(status_code=404, detail="Hotspot not found.")

    # Reconstruct transparent score breakdown
    # Recover raw values using inverse weight for transparency display
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


@router.post("/recalculate")
async def trigger_recalculation(db: AsyncSession = Depends(get_db)):
    """
    Manually triggers re-clustering and deterministic score recalculation.
    """
    count = await cluster_and_calculate_hotspots(db)
    return {"status": "success", "hotspots_generated": count}
