from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status
from app.database import get_database
from app.services.audit_service import record_audit_log

async def process_student_decision(
    student_id: str,
    action: str,  # approve, reject, reconsider, suspend, reactivate
    reviewer_id: str,
    reviewer_name: str,
    reviewer_role: str,
    rejection_reason: Optional[str] = None
) -> Dict[str, Any]:
    db = await get_database()
    now = datetime.now(timezone.utc)

    student = await db["students"].find_one({
        "$or": [{"_id": student_id}, {"id": student_id}]
    })
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found."
        )

    # Permission check for faculty vs admin
    if reviewer_role == "faculty":
        if action in ["suspend", "reactivate"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators possess permission to suspend or reactivate student accounts."
            )

    update_fields: Dict[str, Any] = {
        "reviewed_at": now,
        "reviewed_by": reviewer_name,
        "reviewer_id": reviewer_id,
        "reviewer_role": reviewer_role,
        "updated_at": now
    }

    audit_action = ""
    target_status = ""

    if action == "approve":
        target_status = "active"
        update_fields["account_status"] = "active"
        update_fields["rejection_reason"] = None
        audit_action = "STUDENT_APPLICATION_APPROVED"

    elif action == "reject":
        if not rejection_reason or not rejection_reason.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid rejection reason is required when rejecting an application."
            )
        target_status = "rejected"
        update_fields["account_status"] = "rejected"
        update_fields["rejection_reason"] = rejection_reason.strip()
        audit_action = "STUDENT_APPLICATION_REJECTED"

    elif action == "reconsider":
        # Reset back to pending_approval for re-evaluation
        target_status = "pending_approval"
        update_fields["account_status"] = "pending_approval"
        update_fields["rejection_reason"] = None
        audit_action = "STUDENT_APPLICATION_RECONSIDERED"

    elif action == "suspend":
        target_status = "suspended"
        update_fields["account_status"] = "suspended"
        update_fields["rejection_reason"] = rejection_reason or "Administrative suspension"
        audit_action = "STUDENT_ACCOUNT_SUSPENDED"

    elif action == "reactivate":
        target_status = "active"
        update_fields["account_status"] = "active"
        update_fields["rejection_reason"] = None
        audit_action = "STUDENT_ACCOUNT_REACTIVATED"

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported approval action: '{action}'."
        )

    await db["students"].update_one(
        {"_id": student["_id"]},
        {"$set": update_fields}
    )

    # Record audit log (No emails sent as per non-negotiable Phase 6 restriction)
    await record_audit_log(
        actor_id=reviewer_id,
        actor_name=reviewer_name,
        actor_role=reviewer_role,
        action=audit_action,
        target_id=student_id,
        target_type="student",
        reason=rejection_reason,
        details={
            "student_name": student.get("full_name"),
            "registration_number": student.get("registration_number"),
            "previous_status": student.get("account_status"),
            "new_status": target_status
        }
    )

    return {
        "student_id": student_id,
        "new_status": target_status,
        "reviewed_by": reviewer_name,
        "reviewed_at": now.isoformat(),
        "rejection_reason": update_fields.get("rejection_reason")
    }

async def get_student_approval_requests(status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    db = await get_database()
    query = {}
    if status_filter:
        query["account_status"] = status_filter
    
    cursor = db["students"].find(query).sort("registered_at", -1)
    students = []
    async for s in cursor:
        students.append({
            "id": str(s.get("id", s.get("_id"))),
            "full_name": s.get("full_name"),
            "university_reg_number": s.get("registration_number"),
            "email": s.get("email"),
            "account_status": s.get("account_status"),
            "registered_at": s.get("registered_at"),
            "reviewed_at": s.get("reviewed_at"),
            "reviewed_by": s.get("reviewed_by"),
            "reviewer_role": s.get("reviewer_role"),
            "rejection_reason": s.get("rejection_reason"),
            "profile_status": s.get("profile_status", "incomplete"),
            "cgpa": s.get("cgpa"),
            "branch": s.get("branch"),
            "academic_year": s.get("academic_year"),
            "section": s.get("section")
        })
    return students
