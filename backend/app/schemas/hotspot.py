from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.score_breakdown import ScoreBreakdown, EvidenceCitation, ActionItem

class HotspotSummary(BaseModel):
    id: str
    category: str
    state: str
    district: str
    taluka_or_ward: Optional[str] = None
    center_lat: float
    center_lng: float
    radius_km: float
    
    complaint_count: int
    dominant_urgency: str
    avg_severity: float
    
    final_priority_score: float
    detected_headline: str
    last_updated: datetime

class HotspotDetail(HotspotSummary):
    affected_groups_summary: List[str]
    score_breakdown: ScoreBreakdown
    evidence_citations: List[EvidenceCitation]
    gemini_narrative: str
    suggested_action_plan: List[ActionItem]

class GovernmentStats(BaseModel):
    total_complaints: int
    active_hotspots_count: int
    critical_priority_hotspots: int
    top_categories: List[Dict[str, Any]]
    language_breakdown: Dict[str, int]
    districts_covered: int
    synthetic_notice: str = "PROTOTYPE DEMONSTRATION: All citizen requests are synthetic and generated for demonstration purposes."
