import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status, Depends, WebSocket, WebSocketDisconnect
from app.deps import get_current_user, get_current_active_student
from app.database import get_database
from app.schemas.interview import (
    InterviewSetupRequest,
    EndInterviewRequest,
    VALID_TECHNICAL_SKILLS
)
from app.services.interview_service import create_interview_session
from app.services.evaluation_service import evaluate_interview_session
from app.services.ai_voice_service import ai_voice_interviewer
from app.services.audit_service import record_audit_log

logger = logging.getLogger("uvicorn.error")
router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.get("/skills-list")
async def get_authorized_skills():
    """List 10 authorized technical interview skills"""
    return {"skills": VALID_TECHNICAL_SKILLS}

@router.post("/setup")
async def setup_interview_session(
    req: InterviewSetupRequest,
    student: dict = Depends(get_current_active_student)
):
    """
    Configure and create a new mock interview session.
    Validates selected skills and requires at least 1 project.
    """
    student_id = student.get("user_id")
    student_name = student.get("full_name") or student.get("name", "Student")
    reg_number = student.get("registration_number", "")

    # Validate skills
    invalid_skills = [s for s in req.selected_skills if s not in VALID_TECHNICAL_SKILLS]
    if invalid_skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid skills selected: {invalid_skills}. Must be from authorized university list."
        )

    # Validate project
    if not req.projects or len(req.projects) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one technical project is required to initiate an interview."
        )

    session = await create_interview_session(
        student_id=student_id,
        student_name=student_name,
        registration_number=reg_number,
        selected_skills=req.selected_skills,
        projects=req.projects,
        duration_minutes=req.duration_minutes or 20
    )

    return session

@router.get("/{interview_id}")
async def get_interview_details(
    interview_id: str,
    user: dict = Depends(get_current_user)
):
    """Retrieve details for interview session"""
    db = await get_database()
    interview = await db["interviews"].find_one({
        "$or": [{"_id": interview_id}, {"interview_id": interview_id}]
    })
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    # Access control: Student can only view their own; Faculty/Admin can view any
    if user.get("role") == "student" and interview.get("student_id") != user.get("user_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    interview["id"] = str(interview.get("id", interview.get("_id")))
    return interview

@router.post("/{interview_id}/end")
async def end_interview_session(
    interview_id: str,
    req: EndInterviewRequest,
    user: dict = Depends(get_current_user)
):
    """
    End interview session and automatically trigger evidence-based evaluation.
    Prevents duplicate evaluation generation.
    """
    db = await get_database()
    interview = await db["interviews"].find_one({
        "$or": [{"_id": interview_id}, {"interview_id": interview_id}]
    })
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    if user.get("role") == "student" and interview.get("student_id") != user.get("user_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    now = datetime.now(timezone.utc)
    target_status = "terminated_violation" if req.end_reason == "violation_terminated" else "completed"

    # Save final transcript and proctoring incidents
    await db["interviews"].update_one(
        {"_id": interview["_id"]},
        {
            "$set": {
                "status": target_status,
                "transcript": req.final_transcript or interview.get("transcript", []),
                "proctoring_incidents": [inc.model_dump() for inc in req.proctoring_incidents],
                "warnings_count": len(req.proctoring_incidents),
                "ended_at": now
            }
        }
    )

    # Evaluate interview
    evaluation_result = await evaluate_interview_session(interview_id)
    return {
        "success": True,
        "interview_id": interview_id,
        "status": target_status,
        "evaluation": evaluation_result
    }

@router.get("/{interview_id}/result")
async def get_interview_evaluation_result(
    interview_id: str,
    user: dict = Depends(get_current_user)
):
    """Fetch structured interview results and scorecard"""
    db = await get_database()
    result = await db["interview_results"].find_one({
        "$or": [{"_id": interview_id}, {"interview_id": interview_id}]
    })
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Results not found. The interview may still be in progress or pending evaluation."
        )

    # Security check: Students may only view their own results
    if user.get("role") == "student" and result.get("student_id") != user.get("user_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to other candidates' results is restricted.")

    result["id"] = str(result.get("_id"))
    return result

# Real-Time Voice Interview WebSocket
@router.websocket("/ws/{interview_id}")
async def interview_voice_websocket(websocket: WebSocket, interview_id: str):
    """
    Bidirectional WebSocket connection for live conversational interview turns,
    Gemini Live integration, spoken response synthesis, and proctoring integrity monitoring.
    """
    await websocket.accept()
    db = await get_database()
    
    interview = await db["interviews"].find_one({
        "$or": [{"_id": interview_id}, {"interview_id": interview_id}]
    })
    if not interview:
        await websocket.send_json({"type": "error", "message": "Interview session not found."})
        await websocket.close()
        return

    student_name = interview.get("student_name", "Student")
    questions = interview.get("questions", [])
    current_idx = interview.get("current_question_index", 0)
    transcript = interview.get("transcript", [])
    warnings = interview.get("warnings_count", 0)

    # Mark interview started
    await db["interviews"].update_one(
        {"_id": interview["_id"]},
        {"$set": {"status": "in_progress", "started_at": datetime.now(timezone.utc)}}
    )

    # Send initial welcome greeting and first question
    welcome_msg = (
        f"Hello {student_name}! Welcome to your Vignan AI Technical Mock Interview. "
        "I will be evaluating your technical depth, project experience, and problem-solving skills today. "
        "Take your time, speak clearly, and let's begin!"
    )
    
    first_q = questions[0] if questions else {"question_text": "Please introduce yourself and your technical interests."}
    
    await websocket.send_json({
        "type": "ai_greeting",
        "greeting": welcome_msg,
        "first_question": first_q.get("question_text"),
        "question_index": 0,
        "total_questions": len(questions)
    })

    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            msg_type = data.get("type")

            # 1. Candidate spoken answer submission
            if msg_type == "candidate_answer":
                candidate_text = data.get("text", "").strip()
                current_question_text = data.get("question_text", "")

                # Record turn in transcript
                transcript.append({
                    "sender": "candidate",
                    "text": candidate_text,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })

                # Call AI Voice Interviewer service (Gemini Live API)
                ai_turn = await ai_voice_interviewer.generate_conversational_response(
                    candidate_name=student_name,
                    current_question=current_question_text,
                    candidate_answer=candidate_text,
                    conversation_history=transcript
                )

                # Advance question if intent is move_next
                if ai_turn.get("intent") == "move_next":
                    current_idx += 1

                next_question = None
                if current_idx < len(questions):
                    next_question = questions[current_idx]

                ai_response_text = ai_turn.get("text")
                if next_question and not ai_turn.get("follow_up"):
                    ai_response_text += f" Next question: {next_question.get('question_text')}"

                # Append interviewer speech to transcript
                transcript.append({
                    "sender": "interviewer",
                    "text": ai_response_text,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })

                # Persist updated transcript and index
                await db["interviews"].update_one(
                    {"_id": interview["_id"]},
                    {"$set": {"transcript": transcript, "current_question_index": current_idx}}
                )

                # Send AI response to client (client Web Audio / TTS triggers spoken voice)
                await websocket.send_json({
                    "type": "ai_response",
                    "spoken_text": ai_response_text,
                    "follow_up": ai_turn.get("follow_up"),
                    "question_index": current_idx,
                    "total_questions": len(questions),
                    "next_question": next_question.get("question_text") if next_question else None,
                    "is_finished": (current_idx >= len(questions) and not ai_turn.get("follow_up"))
                })

            # 2. Proctoring integrity event
            elif msg_type == "proctoring_event":
                event_type = data.get("event_type")
                details = data.get("details", "")
                warnings += 1

                incident_record = {
                    "type": event_type,
                    "warning_level": warnings,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "details": details
                }

                await db["interviews"].update_one(
                    {"_id": interview["_id"]},
                    {
                        "$push": {"proctoring_incidents": incident_record},
                        "$set": {"warnings_count": warnings}
                    }
                )

                if warnings >= 4:
                    # 4th violation: Terminate interview
                    await websocket.send_json({
                        "type": "session_terminated",
                        "warning_level": 4,
                        "reason": f"Maximum integrity violations reached (4 warnings). Event: {event_type}."
                    })
                    await db["interviews"].update_one(
                        {"_id": interview["_id"]},
                        {"$set": {"status": "terminated_violation", "ended_at": datetime.now(timezone.utc)}}
                    )
                    break
                else:
                    await websocket.send_json({
                        "type": "proctoring_warning",
                        "warning_level": warnings,
                        "event_type": event_type,
                        "message": f"Integrity warning {warnings}/3: Please ensure your face is clearly visible in the camera frame."
                    })

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from interview session {interview_id}")
    except Exception as e:
        logger.error(f"WebSocket error in interview {interview_id}: {str(e)}")
