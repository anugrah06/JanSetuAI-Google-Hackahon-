from typing import Dict, Any, Tuple
from app.schemas.score_breakdown import ScoreBreakdown, FactorComponent

DEMAND_BENCHMARK_THRESHOLD = 5.0 # In a prototype/demo context, 5 complaints in a localized cluster represents high civic demand

def calculate_priority_score(
    complaint_count: int,
    avg_severity: float, # 1.0 to 5.0
    infra_gap_score: float, # 0.0 to 100.0 from district baseline
    investment_gap_score: float, # 0.0 to 100.0 from district baseline
    district_population: int,
    vulnerability_index: float, # 0.0 to 1.0
) -> Tuple[float, ScoreBreakdown]:
    """
    Computes 100% deterministic priority score according to JanSetu AI's transparent governance rubric:
    - Citizen Demand: 35%
    - Infrastructure Gap: 25%
    - Population Impact: 20%
    - Severity: 10%
    - Investment Gap: 10%
    
    Zero LLM interference or black-box weighting.
    """
    # 1. Citizen Demand (35% weight)
    # Normalized against threshold, capped at 100.0
    raw_demand = min(100.0, (complaint_count / DEMAND_BENCHMARK_THRESHOLD) * 100.0)
    weighted_demand = raw_demand * 0.35
    
    # 2. Infrastructure Gap (25% weight)
    raw_infra_gap = max(0.0, min(100.0, infra_gap_score))
    weighted_infra_gap = raw_infra_gap * 0.25
    
    # 3. Population Impact (20% weight)
    # Combines normalized population scale (0-70) with rural vulnerability factor (0-30)
    norm_pop = min(70.0, (district_population / 10_000_000.0) * 70.0)
    norm_vuln = min(30.0, vulnerability_index * 30.0)
    raw_pop_impact = min(100.0, norm_pop + norm_vuln)
    weighted_pop_impact = raw_pop_impact * 0.20
    
    # 4. Severity (10% weight)
    # Average severity extracted from complaints (scale 1-5) converted to 0-100
    raw_severity = max(0.0, min(100.0, (avg_severity / 5.0) * 100.0))
    weighted_severity = raw_severity * 0.10
    
    # 5. Investment Gap (10% weight)
    raw_investment_gap = max(0.0, min(100.0, investment_gap_score))
    weighted_investment_gap = raw_investment_gap * 0.10
    
    # Final 5-Factor Composite Score (0.0 to 100.0)
    final_score = round(
        weighted_demand + 
        weighted_infra_gap + 
        weighted_pop_impact + 
        weighted_severity + 
        weighted_investment_gap,
        1
    )
    
    breakdown = ScoreBreakdown(
        citizen_demand=FactorComponent(
            name="Citizen Demand Volume",
            weight_percentage=35.0,
            raw_score=round(raw_demand, 1),
            weighted_score=round(weighted_demand, 2),
            benchmark_data=f"{complaint_count} active complaints logged in spatial cluster (Benchmark saturation: {int(DEMAND_BENCHMARK_THRESHOLD)})"
        ),
        infrastructure_gap=FactorComponent(
            name="Sector Infrastructure Deficit",
            weight_percentage=25.0,
            raw_score=round(raw_infra_gap, 1),
            weighted_score=round(weighted_infra_gap, 2),
            benchmark_data=f"Official District Public Works Deficit Rating: {round(raw_infra_gap, 1)}/100"
        ),
        population_impact=FactorComponent(
            name="Demographic Exposure & Vulnerability",
            weight_percentage=20.0,
            raw_score=round(raw_pop_impact, 1),
            weighted_score=round(weighted_pop_impact, 2),
            benchmark_data=f"District Pop: {district_population:,} with Vulnerability Index {vulnerability_index:.2f}"
        ),
        severity=FactorComponent(
            name="Extracted Problem Severity",
            weight_percentage=10.0,
            raw_score=round(raw_severity, 1),
            weighted_score=round(weighted_severity, 2),
            benchmark_data=f"Average citizen distress rating: {round(avg_severity, 2)} / 5.0"
        ),
        investment_gap=FactorComponent(
            name="Historical Capex Deficit",
            weight_percentage=10.0,
            raw_score=round(raw_investment_gap, 1),
            weighted_score=round(weighted_investment_gap, 2),
            benchmark_data=f"Sector historical under-investment index: {round(raw_investment_gap, 1)}/100"
        ),
        final_score=final_score
    )
    
    return final_score, breakdown
