from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.deps import get_current_user
from app.schemas.faculty import StudentApprovalDecision
from app.services.approval_service import process_student_decision, get_student_approval_requests

router = APIRouter(prefix="/approvals", tags=["Student Approvals"])

def check_approval_permission(user: dict):
    role = user.get("role")
    if role == "admin":
        return True
    if role == "faculty":
        perms = user.get("permissions", [])
        if "student_approval" in perms:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty must be explicitly granted the 'student_approval' permission by an Administrator."
        )
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Only authorized faculty and administrators can review student applications."
    )

@router.get("/requests")
async def list_approval_requests(
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """List pending and reviewed student applications"""
    check_approval_permission(user)
    return await get_student_approval_requests(status_filter=status)

@router.post("/decision")
async def record_student_approval_decision(
    decision: StudentApprovalDecision,
    user: dict = Depends(get_current_user)
):
    """
    Process approval or rejection decision.
    - If rejecting, rejection_reason is mandatory.
    - Only Admins can suspend or reactivate.
    - Updates are visible only inside the portal (no emails).
    """
    check_approval_permission(user)

    reviewer_id = user.get("user_id")
    reviewer_name = user.get("full_name") or user.get("name") or "Authorized Reviewer"
    reviewer_role = user.get("role")

    return await process_student_decision(
        student_id=decision.student_id,
        action=decision.action,
        reviewer_id=reviewer_id,
        reviewer_name=reviewer_name,
        reviewer_role=reviewer_role,
        rejection_reason=decision.rejection_reason
    )
