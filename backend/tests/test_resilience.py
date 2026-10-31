import pytest
from app.services.otp_service import send_email_via_resend
from app.services.ai_voice_service import GeminiVoiceInterviewer
from app.config import settings

@pytest.mark.asyncio
async def test_resend_missing_credentials_resilience():
    # When RESEND_API_KEY is not set
    saved_key = settings.RESEND_API_KEY
    settings.RESEND_API_KEY = ""
    
    success, message = await send_email_via_resend("student@vignan.ac.in", "Test", "<p>Test</p>")
    assert success is False
    assert "RESEND_API_KEY is not configured" in message
    
    settings.RESEND_API_KEY = saved_key

@pytest.mark.asyncio
async def test_gemini_missing_credentials_resilience():
    # When Gemini API key is missing, interviewer should return diagnostic feedback without crashing
    interviewer = GeminiVoiceInterviewer(api_key="", model="gemini-2.0-flash")
    assert interviewer.is_configured() is False
    
    result = await interviewer.generate_conversational_response(
        candidate_name="Rohit",
        current_question="Explain polymorphism in Java.",
        candidate_answer="Polymorphism allows objects to take multiple forms.",
        conversation_history=[]
    )
    
    assert "text" in result
    assert result.get("is_mock") is True
    assert "AI_PROVIDER_API_KEY is not configured" in result.get("warning", "")
