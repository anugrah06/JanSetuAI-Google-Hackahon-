from pydantic import BaseModel, Field
from typing import List, Optional

class FactorComponent(BaseModel):
    name: str
    weight_percentage: float
    raw_score: float # 0 - 100
    weighted_score: float # weight * raw_score
    benchmark_data: str # human readable explanation of underlying data

class ScoreBreakdown(BaseModel):
    citizen_demand: FactorComponent
    infrastructure_gap: FactorComponent
    population_impact: FactorComponent
    severity: FactorComponent
    investment_gap: FactorComponent
    final_score: float

class EvidenceCitation(BaseModel):
    source_type: str # 'citizen_voice', 'citizen_text', 'district_baseline'
    language: Optional[str] = None
    quote: str
    location_marker: Optional[str] = None
    timestamp: Optional[str] = None
    is_synthetic: bool = True

class ActionItem(BaseModel):
    step_number: int
    title: str
    action_type: str # 'IMMEDIATE', 'MEDIUM_TERM', 'POLICY_BUDGET'
    responsible_agency: str
    estimated_timeline: str
    description: str
