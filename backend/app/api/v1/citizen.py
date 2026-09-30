from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.models.feedback import CitizenFeedback
from app.schemas.citizen import CitizenTextInput, CitizenFeedbackResponse, CitizenTicketStatus
from app.services.gemini_service import extract_feedback_entities
from app.services.speech_service import transcribe_audio_file
from app.services.clustering_service import cluster_and_calculate_hotspots
import logging

router = APIRouter(prefix="/citizen", tags=["Citizen Feedback"])
logger = logging.getLogger(__name__)

@router.post("/submit-text", response_model=CitizenFeedbackResponse)
async def submit_text_feedback(
    payload: CitizenTextInput,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits citizen text feedback in Hindi or English.
    Google Gemini extracts structured civic categories, location, severity, and urgency.
    """
    if not payload.text or len(payload.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Feedback text must be at least 5 characters long.")

    # Extract structured metadata with Gemini
    extraction = await extract_feedback_entities(payload.text, payload.language)
    
    feedback = CitizenFeedback(
        language=extraction.original_language or payload.language or "en",
        input_mode="text",
        raw_input=payload.text.strip(),
        category=extraction.category,
        sub_issue=extraction.sub_issue,
        state=extraction.state or "Maharashtra",
        district=extraction.district or "Beed",
        taluka_or_ward=extraction.taluka_or_ward,
        landmark=extraction.landmark,
        latitude=extraction.latitude,
        longitude=extraction.longitude,
        severity_score=extraction.severity_score,
        urgency=extraction.urgency,
        affected_group=extraction.affected_group,
        is_synthetic=False,
        demo_scenario_id=None
    )
    
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)

    # Trigger re-clustering so dashboard immediately updates
    try:
        await cluster_and_calculate_hotspots(db)
    except Exception as e:
        logger.warning(f"Background cluster update error: {e}")

    return CitizenFeedbackResponse(
        ticket_id=str(feedback.id),
        created_at=feedback.created_at,
        input_mode=feedback.input_mode,
        detected_language=feedback.language,
        raw_input=feedback.raw_input,
        category=feedback.category,
        sub_issue=feedback.sub_issue,
        state=feedback.state,
        district=feedback.district,
        taluka_or_ward=feedback.taluka_or_ward,
        landmark=feedback.landmark,
        severity_score=feedback.severity_score,
        urgency=feedback.urgency,
        affected_group=feedback.affected_group,
        is_synthetic=feedback.is_synthetic
    )


@router.post("/submit-voice", response_model=CitizenFeedbackResponse)
async def submit_voice_feedback(
    audio: UploadFile = File(...),
    language_hint: Optional[str] = Form("en"),
    db: AsyncSession = Depends(get_db)
):
    """
    Accepts recorded voice audio (WebM, WAV, MP3) in Hindi or English.
    Transcribes voice and uses Gemini to extract structured civic priorities.
    """
    audio_bytes = await audio.read()
    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty or corrupted.")

    mime = audio.content_type or "audio/webm"
    transcription, detected_lang = await transcribe_audio_file(audio_bytes, mime, language_hint)
    
    # Extract structured metadata with Gemini
    extraction = await extract_feedback_entities(transcription, detected_lang)
    
    feedback = CitizenFeedback(
        language=detected_lang,
        input_mode="voice",
        raw_input=transcription,
        category=extraction.category,
        sub_issue=extraction.sub_issue,
        state=extraction.state or "Maharashtra",
        district=extraction.district or "Beed",
        taluka_or_ward=extraction.taluka_or_ward,
        landmark=extraction.landmark,
        latitude=extraction.latitude,
        longitude=extraction.longitude,
        severity_score=extraction.severity_score,
        urgency=extraction.urgency,
        affected_group=extraction.affected_group,
        is_synthetic=False,
        demo_scenario_id=None
    )
    
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)

    try:
        await cluster_and_calculate_hotspots(db)
    except Exception as e:
        logger.warning(f"Background cluster update error: {e}")

    return CitizenFeedbackResponse(
        ticket_id=str(feedback.id),
        created_at=feedback.created_at,
        input_mode="voice",
        detected_language=detected_lang,
        raw_input=transcription,
        category=feedback.category,
        sub_issue=feedback.sub_issue,
        state=feedback.state,
        district=feedback.district,
        taluka_or_ward=feedback.taluka_or_ward,
        landmark=feedback.landmark,
        severity_score=feedback.severity_score,
        urgency=feedback.urgency,
        affected_group=feedback.affected_group,
        is_synthetic=feedback.is_synthetic
    )


@router.get("/ticket/{ticket_id}", response_model=CitizenTicketStatus)
async def get_ticket_status(
    ticket_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CitizenFeedback).where(CitizenFeedback.id == ticket_id))
    feedback = result.scalar_one_or_none()
    if not feedback:
        raise HTTPException(status_code=404, detail="Ticket not found.")
        
    return CitizenTicketStatus(
        ticket_id=str(feedback.id),
        status="CLUSTERED_IN_HOTSPOT",
        category=feedback.category,
        sub_issue=feedback.sub_issue,
        district=feedback.district,
        created_at=feedback.created_at,
        is_synthetic=feedback.is_synthetic
    )
