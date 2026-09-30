import math
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.feedback import CitizenFeedback
from app.models.infrastructure import DistrictInfrastructureBaseline
from app.models.hotspot import Hotspot
from app.services.priority_engine import calculate_priority_score
from app.services.gemini_service import generate_hotspot_explanation
import logging

logger = logging.getLogger(__name__)

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

async def cluster_and_calculate_hotspots(db: AsyncSession) -> int:
    """
    Groups feedback into geographic & categorical clusters,
    computes deterministic 5-factor priority scores,
    generates explainability reports, and saves them to the database.
    """
    # 1. Fetch all citizen feedback in deterministic order
    result = await db.execute(select(CitizenFeedback).order_by(CitizenFeedback.id))
    feedbacks = result.scalars().all()
    if not feedbacks:
        return 0

    # 2. Fetch baseline data for districts
    base_result = await db.execute(select(DistrictInfrastructureBaseline))
    baselines = {b.district.lower(): b for b in base_result.scalars().all()}

    # 3. Group by (district, taluka or ward, category)
    clusters: Dict[Tuple[str, str, str], List[CitizenFeedback]] = {}
    for f in feedbacks:
        key = (
            f.district.strip().title(),
            (f.taluka_or_ward or "Central").strip().title(),
            f.category.strip()
        )
        if key not in clusters:
            clusters[key] = []
        clusters[key].append(f)

    # Clear existing hotspots to refresh with clean clusters
    await db.execute(delete(Hotspot))

    created_count = 0
    import uuid
    # Sort clusters deterministically by (district, taluka, category)
    sorted_clusters = sorted(clusters.items(), key=lambda x: (x[0][0], x[0][1], x[0][2]))
    for (dist, taluka, cat), items in sorted_clusters:
        count = len(items)
        avg_sev = sum(item.severity_score for item in items) / count
        
        # Calculate cluster center coordinate
        lats = [item.latitude for item in items if item.latitude]
        lngs = [item.longitude for item in items if item.longitude]
        c_lat = sum(lats) / len(lats) if lats else 18.9891
        c_lng = sum(lngs) / len(lngs) if lngs else 75.7601
        
        # Fetch district baseline
        dist_key = dist.lower()
        baseline = baselines.get(dist_key)
        
        if baseline:
            pop = baseline.population_total
            vuln = baseline.vulnerability_index
            
            # Map category to infra and capex deficits
            if cat == "WATER_AND_SANITATION":
                infra_gap = baseline.infra_gap_water
                invest_gap = baseline.investment_gap_water
            elif cat == "ROADS_AND_TRANSPORT":
                infra_gap = baseline.infra_gap_roads
                invest_gap = baseline.investment_gap_roads
            elif cat == "ELECTRICITY_AND_ENERGY":
                infra_gap = baseline.infra_gap_electricity
                invest_gap = baseline.investment_gap_electricity
            elif cat == "HEALTHCARE":
                infra_gap = baseline.infra_gap_health
                invest_gap = baseline.investment_gap_health
            elif cat == "EDUCATION":
                infra_gap = baseline.infra_gap_education
                invest_gap = baseline.investment_gap_education
            else: # CIVIC_AMENITIES
                infra_gap = (baseline.infra_gap_water + baseline.infra_gap_roads) / 2.0
                invest_gap = (baseline.investment_gap_water + baseline.investment_gap_roads) / 2.0
        else:
            pop = 2_000_000
            vuln = 0.5
            infra_gap = 50.0
            invest_gap = 50.0

        # Run 100% deterministic mathematical priority scoring
        final_score, breakdown = calculate_priority_score(
            complaint_count=count,
            avg_severity=avg_sev,
            infra_gap_score=infra_gap,
            investment_gap_score=invest_gap,
            district_population=pop,
            vulnerability_index=vuln
        )

        # Dominant urgency
        urgency_counts = {}
        for it in items:
            urgency_counts[it.urgency] = urgency_counts.get(it.urgency, 0) + 1
        dom_urgency = max(urgency_counts, key=urgency_counts.get) if urgency_counts else "HIGH"

        # Unique affected groups
        groups = list(set([it.affected_group for it in items if it.affected_group]))

        # Evidence samples
        evidence_samples = [it.raw_input for it in items[:3]]
        
        # Evidence citation objects
        evidence_citations = [
            {
                "source_type": f"citizen_{it.input_mode}",
                "language": it.language,
                "quote": it.raw_input,
                "location_marker": f"{it.landmark or it.taluka_or_ward}, {it.district}",
                "is_synthetic": it.is_synthetic
            }
            for it in items[:4]
        ]
        # Append baseline fact citation
        evidence_citations.append({
            "source_type": "district_baseline",
            "language": "en",
            "quote": f"Official {dist} baseline infrastructure gap in {cat}: {infra_gap:.1f}/100. Historical Capex gap: {invest_gap:.1f}/100.",
            "location_marker": dist,
            "is_synthetic": True
        })

        # Generate Gemini explainability narrative & action plan
        headline, narrative, actions = await generate_hotspot_explanation(
            category=cat,
            district=dist,
            taluka=taluka,
            final_score=final_score,
            score_breakdown=breakdown.model_dump(),
            complaint_count=count,
            evidence_samples=evidence_samples
        )

        hotspot_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{dist}_{taluka}_{cat}"))

        hotspot = Hotspot(
            id=hotspot_id,
            category=cat,
            state="Maharashtra",
            district=dist,
            taluka_or_ward=taluka,
            center_lat=round(c_lat, 4),
            center_lng=round(c_lng, 4),
            radius_km=5.0,
            complaint_count=count,
            avg_severity=round(avg_sev, 2),
            dominant_urgency=dom_urgency,
            affected_groups_summary=groups,
            score_citizen_demand=breakdown.citizen_demand.weighted_score,
            score_infrastructure_gap=breakdown.infrastructure_gap.weighted_score,
            score_population_impact=breakdown.population_impact.weighted_score,
            score_severity=breakdown.severity.weighted_score,
            score_investment_gap=breakdown.investment_gap.weighted_score,
            final_priority_score=final_score,
            detected_headline=headline,
            evidence_citation_json=evidence_citations,
            gemini_narrative=narrative,
            suggested_action_plan=[a.model_dump() for a in actions]
        )
        db.add(hotspot)
        created_count += 1

    await db.commit()
    return created_count
