import json
import logging
from typing import Optional, Dict, Any, List, Tuple
from app.core.config import settings
from app.schemas.gemini_extraction import CitizenFeedbackExtraction
from app.schemas.score_breakdown import ActionItem
from app.services.geocoding_service import resolve_coordinates

logger = logging.getLogger(__name__)

EXTRACTION_SYSTEM_PROMPT = """
You are an expert civic intelligence officer for the Government of India and State of Maharashtra.
Your task is to analyze multilingual citizen voice and text feedback (submitted in Hindi, Marathi, Indian English, or mixed dialects) and extract structured civic needs.

CRITICAL INSTRUCTIONS:
1. Extract the primary department category from:
   - WATER_AND_SANITATION
   - ROADS_AND_TRANSPORT
   - ELECTRICITY_AND_ENERGY
   - HEALTHCARE
   - EDUCATION
   - CIVIC_AMENITIES
2. Extract the specific issue in 3-8 clear words in English (e.g. 'Broken culvert bridge causing road cut-off', 'Contaminated drinking water in village well').
3. Identify the Indian State (default Maharashtra), District (e.g., Beed, Latur, Ratnagiri, Chandrapur, Pune, Nashik), Taluka/Tehsil/Ward, and Landmark.
4. Assess severity on a strict 1 to 5 scale:
   - 1: Minor cosmetic/inconvenience
   - 2: Recurring mild issue
   - 3: Disrupts daily routines or local economy
   - 4: Acute disruption, health risks or road blockage
   - 5: Imminent disaster, fatal risk, hospital power loss, sewage contaminating drinking supply
5. Assess urgency: LOW, MEDIUM, HIGH, CRITICAL.
6. Identify the primary affected demographic group (e.g., 'School children and mothers', 'Smallholder farmers', 'Daily bus commuters', 'Hospital patients').
7. DO NOT ATTEMPT TO ASSIGN A FINAL NUMERICAL PRIORITY SCORE. Numerical priority is computed strictly by the government's deterministic scoring engine, not by AI.

Return ONLY a valid JSON object matching the requested schema.
"""

EXPLAINABILITY_SYSTEM_PROMPT = """
You are a senior administrative policy advisor preparing an executive briefing for the District Collector and State Infrastructure Committee.
You will receive:
- The Hotspot Location and Infrastructure Category
- The EXACT mathematically computed priority score and its 5-factor breakdown
- A summary of citizen complaints and evidence quotes from the ground
- Official baseline deficit figures for the district

Your duty is to produce:
1. A concise administrative detected headline (e.g. "Acute Potable Water Shortage & Contamination Crisis in Ashti Taluka")
2. An explainable administrative narrative (2 concise paragraphs) synthesizing what the system detected, why this hotspot ranked at this score, and the ground reality.
3. 3-4 structured, actionable administrative steps (immediate relief, structural repair, budgetary allocation) with designated responsible agencies.

Maintain an objective, grounded, transparent tone. Always emphasize that this analysis assists human decision-makers.
"""

async def extract_feedback_entities(text: str, language_hint: Optional[str] = None) -> CitizenFeedbackExtraction:
    """
    Extracts structured civic problem data from citizen feedback using Google Gemini.
    Gracefully falls back to heuristic extraction if Gemini API key is not configured.
    """
    if settings.GEMINI_API_KEY:
        try:
            # Attempt to use google-genai or google-generativeai
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=EXTRACTION_SYSTEM_PROMPT,
                generation_config={"response_mime_type": "application/json"}
            )
            
            prompt = f"Analyze this citizen feedback:\nLanguage Hint: {language_hint or 'Auto-detect'}\nComplaint Text: \"{text}\""
            response = await model.generate_content_async(prompt)
            data = json.loads(response.text)
            
            # Resolve coordinates if not provided
            if not data.get("latitude") or not data.get("longitude"):
                lat, lng = resolve_coordinates(data.get("district", "Beed"), data.get("taluka_or_ward"))
                data["latitude"] = lat
                data["longitude"] = lng
                
            return CitizenFeedbackExtraction(**data)
        except Exception as e:
            logger.warning(f"Gemini API extraction failed, using heuristic fallback: {e}")

    # Robust heuristic / rule-based fallback for demo reliability
    return _heuristic_extract(text, language_hint)


def _heuristic_extract(text: str, language_hint: Optional[str]) -> CitizenFeedbackExtraction:
    """Rule-based extractor for Hindi/Marathi/English keywords when offline/no API key."""
    t_lower = text.lower()
    
    # 1. Category Detection
    category = "CIVIC_AMENITIES"
    sub_issue = "Civic amenities and public infrastructure issue"
    
    if any(k in t_lower for k in ["पाणी", "पाण्याचा", "विहीर", "टँकर", "नळ", "जल", "पानी", "पाइप", "water", "tanker", "borewell", "leakage", "pipeline"]):
        category = "WATER_AND_SANITATION"
        sub_issue = "Potable water supply outage and pipeline disruption"
    elif any(k in t_lower for k in ["रस्ता", "खड्डे", "घाटा", "पूल", "बस", "सड़क", "रास्ता", "पुल", "गड्ढे", "road", "pothole", "bridge", "highway", "traffic"]):
        category = "ROADS_AND_TRANSPORT"
        sub_issue = "Road surface deterioration and transit blockage"
    elif any(k in t_lower for k in ["वीज", "लाईट", "ट्रान्सफॉर्मर", "बिजली", "करंट", "electricity", "power", "transformer", "feeder", "voltage"]):
        category = "ELECTRICITY_AND_ENERGY"
        sub_issue = "Power supply disruption and transformer failure"
    elif any(k in t_lower for k in ["आरोग्य", "दवाखाना", "रुग्णवाहिका", "लस", "अस्पताल", "डॉक्टर", "दवा", "health", "hospital", "ambulance", "clinic"]):
        category = "HEALTHCARE"
        sub_issue = "Primary healthcare facility access and medical emergency"
    elif any(k in t_lower for k in ["शाळा", "शिक्षण", "छत", "वर्ग", "स्कूल", "पढ़ाई", "school", "education", "classroom", "teacher"]):
        category = "EDUCATION"
        sub_issue = "Educational facility infrastructure repair"
    elif any(k in t_lower for k in ["कचरा", "गटार", "ड्रेनेज", "घाण", "कूड़ा", "नाली", "garbage", "drainage", "sewage", "waste"]):
        category = "CIVIC_AMENITIES"
        sub_issue = "Drainage overflow and uncollected waste accumulation"

    # 2. Location Detection
    district = "Beed"
    taluka = None
    landmark = None
    
    district_map = {
        "beed": "Beed", "बीड": "Beed",
        "latur": "Latur", "लातूर": "Latur",
        "ratnagiri": "Ratnagiri", "रत्नागिरी": "Ratnagiri",
        "chandrapur": "Chandrapur", "चंद्रपूर": "Chandrapur",
        "pune": "Pune", "पुणे": "Pune",
        "nashik": "Nashik", "नाशिक": "Nashik",
        "solapur": "Solapur", "सोलापूर": "Solapur",
        "nagpur": "Nagpur", "नागपूर": "Nagpur"
    }
    for key, dist_name in district_map.items():
        if key in t_lower:
            district = dist_name
            break

    taluka_map = {
        "ashti": "Ashti", "आष्टी": "Ashti",
        "gevrai": "Gevrai", "गेवराई": "Gevrai",
        "chiplun": "Chiplun", "चिपळूण": "Chiplun",
        "bhadravati": "Bhadravati", "भद्रावती": "Bhadravati",
        "haveli": "Haveli", "वाघोली": "Haveli", "wagholi": "Haveli",
        "ausa": "Ausa", "औसा": "Ausa"
    }
    for key, taluka_name in taluka_map.items():
        if key in t_lower:
            taluka = taluka_name
            break

    # 3. Severity & Urgency
    severity = 3
    urgency = "MEDIUM"
    if any(k in t_lower for k in ["जीवघेणा", "तातकाळ", "मदत", "खतरा", "आपातकाल", "emergency", "danger", "critical", "dying", "urgent"]):
        severity = 5
        urgency = "CRITICAL"
    elif any(k in t_lower for k in ["आजारी", "खराब", "लवकर", "बंद", "severe", "serious", "disrupted", "accident"]):
        severity = 4
        urgency = "HIGH"

    # Affected group
    affected = "Local residents and community members"
    if any(k in t_lower for k in ["लहान मुले", "शाळकरी", "बच्चे", "school", "children", "students"]):
        affected = "School children and students"
    elif any(k in t_lower for k in ["शेतकरी", "पिक", "किसान", "खेती", "farmers", "crop"]):
        affected = "Smallholder agricultural farmers"
    elif any(k in t_lower for k in ["महिला", "गरोदर", "women", "mothers"]):
        affected = "Women and mothers fetching essential supplies"
    elif any(k in t_lower for k in ["रुग्ण", "मरीज", "patient", "ambulance"]):
        affected = "Emergency patients and healthcare seekers"

    # Language
    detected_lang = language_hint or "mr"
    if any(c in text for c in "अआईईउऊएऐओऔकखगघचछजझ"):
        detected_lang = "mr" if ("आहे" in text or "नाही" in text or "झाले" in text) else "hi"
    elif all(ord(c) < 128 for c in text):
        detected_lang = "en"

    lat, lng = resolve_coordinates(district, taluka)

    return CitizenFeedbackExtraction(
        category=category,
        sub_issue=sub_issue,
        state="Maharashtra",
        district=district,
        taluka_or_ward=taluka,
        landmark=landmark,
        severity_score=severity,
        urgency=urgency,
        affected_group=affected,
        original_language=detected_lang,
        latitude=lat,
        longitude=lng
    )


async def generate_hotspot_explanation(
    category: str,
    district: str,
    taluka: Optional[str],
    final_score: float,
    score_breakdown: Dict[str, Any],
    complaint_count: int,
    evidence_samples: List[str]
) -> Tuple[str, str, List[ActionItem]]:
    """
    Generates an executive briefing and actionable steps for a prioritized hotspot.
    """
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=EXPLAINABILITY_SYSTEM_PROMPT,
                generation_config={"response_mime_type": "application/json"}
            )
            
            prompt = f"""
            Analyze and explain this high-priority infrastructure hotspot:
            - Location: {taluka or 'District-wide'}, {district}, Maharashtra
            - Category: {category}
            - Mathematically Verified Priority Score: {final_score}/100
            - 5-Factor Score Breakdown: {json.dumps(score_breakdown)}
            - Citizen Complaint Volume: {complaint_count}
            - Representative Citizen Quotes: {json.dumps(evidence_samples)}

            Return JSON with keys:
            - "detected_headline": string
            - "gemini_narrative": string
            - "suggested_action_plan": array of objects with step_number, title, action_type, responsible_agency, estimated_timeline, description
            """
            response = await model.generate_content_async(prompt)
            data = json.loads(response.text)
            
            action_items = [ActionItem(**item) for item in data.get("suggested_action_plan", [])]
            return data.get("detected_headline", f"Priority Infrastructure Need: {category} in {district}"), data.get("gemini_narrative", ""), action_items
        except Exception as e:
            logger.warning(f"Gemini explanation generation failed, using heuristic template: {e}")

    # Template fallback
    location_label = f"{taluka}, {district}" if taluka else district
    headline = f"High Priority {category.replace('_', ' ').title()} Deficit Detected in {location_label}"
    
    narrative = (
        f"JanSetu AI has identified an acute infrastructure priority in {location_label} "
        f"with a transparent composite score of {final_score}/100. "
        f"This hotspot is driven by {complaint_count} verified citizen feedback signals converging with "
        f"a baseline district infrastructure deficit rating of {score_breakdown.get('infrastructure_gap', {}).get('raw_score', 65)}/100. "
        f"Citizen reports reflect severe disruptions particularly impacting {evidence_samples[0] if evidence_samples else 'vulnerable local populations'}. "
        f"The 5-factor mathematical weighting assigns 35% weight to ground citizen demand and 25% to structural deficits, "
        f"verifying this as an urgent candidate for administrative intervention."
    )
    
    actions = [
        ActionItem(
            step_number=1,
            title="Immediate Crisis Mitigation & Inspection",
            action_type="IMMEDIATE",
            responsible_agency=f"District {category.split('_')[0].capitalize()} Department / Zilla Parishad",
            estimated_timeline="24 - 48 Hours",
            description=f"Deploy an emergency taskforce to {location_label} to inspect root causes and provide temporary relief services."
        ),
        ActionItem(
            step_number=2,
            title="Rapid Public Works Tender & Repair",
            action_type="MEDIUM_TERM",
            responsible_agency="State Public Works / Rural Development Agency",
            estimated_timeline="1 - 2 Weeks",
            description="Sanction fast-track repair order under District Disaster Mitigation or Rural Infrastructure contingency funds."
        ),
        ActionItem(
            step_number=3,
            title="Citizen Redressal Verification & Telemetry",
            action_type="POLICY_BUDGET",
            responsible_agency="District Collectorate Monitoring Cell",
            estimated_timeline="30 Days",
            description="Send SMS/IVR confirmation to complainants in the cluster once repairs conclude and log into public grievance audit portal."
        )
    ]
    
    return headline, narrative, actions
