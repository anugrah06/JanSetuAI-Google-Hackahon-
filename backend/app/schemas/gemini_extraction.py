from pydantic import BaseModel, Field
from typing import Literal, Optional

class CitizenFeedbackExtraction(BaseModel):
    category: Literal[
        "WATER_AND_SANITATION",
        "ROADS_AND_TRANSPORT",
        "ELECTRICITY_AND_ENERGY",
        "HEALTHCARE",
        "EDUCATION",
        "CIVIC_AMENITIES"
    ] = Field(description="Primary administrative category responsible for the issue")
    sub_issue: str = Field(description="Brief summary of the specific issue in 3-8 words")
    state: str = Field(default="Maharashtra", description="Indian state identified or inferred")
    district: str = Field(description="District identified from context (e.g., Beed, Pune, Ratnagiri, Chandrapur, Latur, Nashik)")
    taluka_or_ward: Optional[str] = Field(default=None, description="Taluka, Tehsil, Block, or Municipal Ward if mentioned")
    landmark: Optional[str] = Field(default=None, description="Key landmark, village name, school, hospital, or intersection")
    severity_score: int = Field(default=3, ge=1, le=5, description="1=Minor inconvenience, 3=Disrupts daily routine/services, 5=Life-threatening emergency or major hazard")
    urgency: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(default="MEDIUM", description="Urgency level based on time constraints and immediate hazard")
    affected_group: Optional[str] = Field(default="Local residents", description="Demographic group impacted (e.g. school children, farmers, hospital patients, daily commuters)")
    original_language: Literal["hi", "en", "mixed"] = Field(default="mixed", description="Detected language of input")
    latitude: Optional[float] = Field(default=None, description="Inferred or geocoded latitude if identifiable")
    longitude: Optional[float] = Field(default=None, description="Inferred or geocoded longitude if identifiable")
