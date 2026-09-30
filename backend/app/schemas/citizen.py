from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CitizenTextInput(BaseModel):
    text: str
    language: Optional[str] = "en" # 'hi', 'en'
    user_location_hint: Optional[str] = None # e.g. "Beed, Ashti"

class CitizenFeedbackResponse(BaseModel):
    ticket_id: str
    created_at: datetime
    input_mode: str
    detected_language: str
    raw_input: str
    
    # Extracted data
    category: str
    sub_issue: str
    state: str
    district: str
    taluka_or_ward: Optional[str] = None
    landmark: Optional[str] = None
    severity_score: int
    urgency: str
    affected_group: Optional[str] = None
    
    is_synthetic: bool = False
    assigned_hotspot_id: Optional[str] = None

class CitizenTicketStatus(BaseModel):
    ticket_id: str
    status: str # 'DETECTED_AND_LOGGED', 'CLUSTERED_IN_HOTSPOT', 'ACTION_RECOMMENDED'
    category: str
    sub_issue: str
    district: str
    created_at: datetime
    cluster_score: Optional[float] = None
    is_synthetic: bool = False
