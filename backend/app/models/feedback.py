from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class CitizenFeedback(Base):
    __tablename__ = "citizen_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    language = Column(String(10), nullable=False) # 'hi', 'mr', 'en'
    input_mode = Column(String(10), nullable=False) # 'voice', 'text'
    raw_input = Column(Text, nullable=False)
    audio_file_path = Column(String(255), nullable=True)

    # Gemini Extracted Structured Metadata
    category = Column(String(50), nullable=False) # WATER_AND_SANITATION, ROADS_AND_TRANSPORT, etc.
    sub_issue = Column(String(150), nullable=False)
    state = Column(String(50), nullable=False, default="Maharashtra")
    district = Column(String(50), nullable=False)
    taluka_or_ward = Column(String(100), nullable=True)
    landmark = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    severity_score = Column(Integer, nullable=False, default=3) # 1-5
    urgency = Column(String(20), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    affected_group = Column(String(150), nullable=True)

    # Synthetic demo guardrail
    is_synthetic = Column(Boolean, default=True, nullable=False)
    demo_scenario_id = Column(String(50), nullable=True)
