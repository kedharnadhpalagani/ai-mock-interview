from fastapi import APIRouter, HTTPException, status, Depends
from app.deps import get_current_user, get_current_active_student
from app.database import get_database
from app.schemas.student import StudentProfileUpdate, StudentStatusResponse
from app.services.audit_service import record_audit_log
from datetime import datetime, timezone

router = APIRouter(prefix="/student", tags=["Student"])

@router.get("/status", response_model=StudentStatusResponse)
async def get_student_account_status(user: dict = Depends(get_current_user)):
    """Check student application and approval status"""
    if user.get("role") != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students have an application status.")

    db = await get_database()
    student = await db["students"].find_one({
        "$or": [{"_id": user.get("user_id")}, {"id": user.get("user_id")}]
    })

    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    acc_status = student.get("account_status", "pending_approval")
    reg_no = student.get("registration_number", "")
    email_ver = student.get("email_verified", False)
    prof_status = student.get("profile_status", "incomplete")
    rejection = student.get("rejection_reason")

    msg = ""
    can_interview = False
    if acc_status == "pending_approval":
        msg = "Your application is currently under review by Vignan University faculty/administration. Please check back shortly."
    elif acc_status == "rejected":
        msg = f"Your application was not approved. Reason: {rejection or 'Incomplete credentials'}."
    elif acc_status == "suspended":
        msg = "Your account is temporarily suspended. Please contact the department coordinator."
    elif acc_status == "active":
        msg = "Your account is active. You may complete your profile and begin mock interviews."
        can_interview = (prof_status == "completed")

    return {
        "account_status": acc_status,
        "registration_number": reg_no,
        "email_verified": email_ver,
        "profile_status": prof_status,
        "rejection_reason": rejection,
        "message": msg,
        "can_access_interview": can_interview
    }

@router.get("/profile")
async def get_student_profile(user: dict = Depends(get_current_user)):
    """Retrieve student profile data"""
    db = await get_database()
    student = await db["students"].find_one({
        "$or": [{"_id": user.get("user_id")}, {"id": user.get("user_id")}]
    })
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    return {
        "id": str(student.get("id", student.get("_id"))),
        "name": student.get("full_name"),
        "registration_number": student.get("registration_number"),
        "email": student.get("email"),
        "date_of_birth": student.get("date_of_birth"),
        "place": student.get("place"),
        "university": student.get("university", "Vignan's University"),
        "academic_year": student.get("academic_year"),
        "branch": student.get("branch"),
        "section": student.get("section"),
        "cgpa": student.get("cgpa"),
        "profile_image": student.get("profile_image"),
        "profile_status": student.get("profile_status", "incomplete"),
        "account_status": student.get("account_status")
    }

@router.put("/profile")
async def update_student_profile(
    profile_data: StudentProfileUpdate,
    user: dict = Depends(get_current_active_student)
):
    """
    Update approved student profile details.
    Guarantees registration number and roles cannot be modified by the student.
    """
    db = await get_database()
    student_id = user.get("user_id")
    now = datetime.now(timezone.utc)

    # Validations
    if profile_data.cgpa < 6.0 or profile_data.cgpa > 10.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CGPA must be between 6.0 and 10.0 inclusive."
        )

    update_payload = {
        "full_name": profile_data.name.strip(),
        "date_of_birth": profile_data.date_of_birth,
        "place": profile_data.place.strip(),
        "university": profile_data.university.strip(),
        "academic_year": profile_data.academic_year,
        "branch": profile_data.branch,
        "section": profile_data.section.strip().upper(),
        "cgpa": profile_data.cgpa,
        "profile_image": profile_data.profile_image,
        "profile_status": "completed",
        "updated_at": now
    }

    res = await db["students"].update_one(
        {"$or": [{"_id": student_id}, {"id": student_id}]},
        {"$set": update_payload}
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student record not found.")

    await record_audit_log(
        actor_id=student_id,
        actor_name=profile_data.name.strip(),
        actor_role="student",
        action="STUDENT_PROFILE_COMPLETED",
        target_id=student_id,
        target_type="student",
        details={"branch": profile_data.branch, "cgpa": profile_data.cgpa}
    )

    return {"success": True, "message": "Profile updated successfully.", "profile_status": "completed"}

@router.get("/dashboard")
async def get_student_dashboard(user: dict = Depends(get_current_active_student)):
    """Retrieve real dashboard statistics and interview history for active student"""
    db = await get_database()
    student_id = user.get("user_id")

    # Fetch past interviews
    cursor = db["interview_results"].find({"student_id": student_id}).sort("created_at", -1)
    interviews = []
    scores = []
    all_strengths = []
    all_weaknesses = []
    all_practice = []

    async for item in cursor:
        sc = item.get("overall_score", 0.0)
        scores.append(sc)
        all_strengths.extend(item.get("strong_answers", []))
        all_weaknesses.extend(item.get("weak_answers", []))
        all_practice.extend(item.get("recommended_practice_questions", []))
        interviews.append({
            "interview_id": item.get("interview_id"),
            "date": item.get("interview_date"),
            "duration": item.get("duration_minutes"),
            "overall_score": sc,
            "skills": item.get("skills_assessed", []),
            "verdict": item.get("final_verdict")
        })

    latest_score = scores[0] if scores else None
    avg_score = round(sum(scores) / len(scores), 1) if scores else None

    # Performance trend data
    trend = []
    for idx, item in enumerate(reversed(interviews[-6:])):
        trend.append({
            "session": f"Mock #{idx + 1}",
            "score": item["overall_score"]
        })

    return {
        "student_name": user.get("full_name") or user.get("name"),
        "registration_number": user.get("registration_number"),
        "profile_status": user.get("profile_status", "incomplete"),
        "total_interviews": len(interviews),
        "latest_score": latest_score,
        "average_score": avg_score,
        "performance_trend": trend,
        "recent_interviews": interviews[:5],
        "top_strengths": all_strengths[:4],
        "key_weaknesses": all_weaknesses[:4],
        "recommended_practice": all_practice[:4]
    }
