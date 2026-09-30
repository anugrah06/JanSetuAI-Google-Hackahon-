from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    category = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False, default="Maharashtra")
    district = Column(String(50), nullable=False)
    taluka_or_ward = Column(String(100), nullable=True)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius_km = Column(Float, default=5.0)

    # Aggregated metrics
    complaint_count = Column(Integer, nullable=False, default=1)
    avg_severity = Column(Float, nullable=False, default=3.0)
    dominant_urgency = Column(String(20), nullable=False, default="MEDIUM")
    affected_groups_summary = Column(JSON, nullable=True) # list of strings

    # 5-Factor Deterministic Priority Components (0.0 to 100.0)
    score_citizen_demand = Column(Float, nullable=False)     # 35% weight
    score_infrastructure_gap = Column(Float, nullable=False) # 25% weight
    score_population_impact = Column(Float, nullable=False)  # 20% weight
    score_severity = Column(Float, nullable=False)           # 10% weight
    score_investment_gap = Column(Float, nullable=False)     # 10% weight

    # Final Computed Score (0.0 to 100.0)
    final_priority_score = Column(Float, nullable=False)

    # Gemini Explainability & Recommendations
    detected_headline = Column(String(255), nullable=False)
    evidence_citation_json = Column(JSON, nullable=False) # Sample citizen quotes, counts, infra stats
    gemini_narrative = Column(Text, nullable=False)
    suggested_action_plan = Column(JSON, nullable=False) # List of operational recommendations
