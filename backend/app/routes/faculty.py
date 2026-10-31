import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.deps import get_current_admin, get_current_faculty
from app.database import get_database
from app.schemas.faculty import (
    FacultyCreateRequest,
    FacultyUpdateRequest,
    FacultyResponse,
    FacultyAnalyticsOverview
)
from app.security import hash_password
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/faculty", tags=["Faculty"])

@router.post("", response_model=FacultyResponse)
async def create_faculty_member(
    req: FacultyCreateRequest,
    admin: dict = Depends(get_current_admin)
):
    """Admin creates a new faculty member with specific permissions"""
    db = await get_database()
    fac_id_clean = req.faculty_id.strip().upper()
    email_clean = req.email.strip().lower()

    # Check unique faculty_id and email
    existing = await db["faculty"].find_one({
        "$or": [
            {"faculty_id": fac_id_clean},
            {"email": email_clean}
        ]
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A faculty member with this ID or Email already exists."
        )

    now = datetime.now(timezone.utc)
    record_id = str(uuid.uuid4())
    doc = {
        "_id": record_id,
        "id": record_id,
        "faculty_id": fac_id_clean,
        "name": req.name.strip(),
        "email": email_clean,
        "department": req.department.strip(),
        "designation": req.designation.strip(),
        "password_hash": hash_password(req.initial_password),
        "permissions": req.permissions,
        "account_status": "active",
        "created_at": now,
        "updated_at": now,
        "last_login": None
    }

    await db["faculty"].insert_one(doc)

    await record_audit_log(
        actor_id=admin.get("user_id"),
        actor_name=admin.get("name", "Admin"),
        actor_role="admin",
        action="FACULTY_ACCOUNT_CREATED",
        target_id=record_id,
        target_type="faculty",
        details={"faculty_id": fac_id_clean, "permissions": req.permissions}
    )

    return {
        "id": record_id,
        "faculty_id": fac_id_clean,
        "name": req.name.strip(),
        "email": email_clean,
        "department": req.department.strip(),
        "designation": req.designation.strip(),
        "permissions": req.permissions,
        "account_status": "active",
        "created_at": now
    }

@router.get("", response_model=List[FacultyResponse])
async def list_all_faculty(admin: dict = Depends(get_current_admin)):
    """Admin lists all faculty members"""
    db = await get_database()
    cursor = db["faculty"].find().sort("created_at", -1)
    faculty_list = []
    async for f in cursor:
        faculty_list.append({
            "id": str(f.get("id", f.get("_id"))),
            "faculty_id": f.get("faculty_id"),
            "name": f.get("name"),
            "email": f.get("email"),
            "department": f.get("department"),
            "designation": f.get("designation"),
            "permissions": f.get("permissions", []),
            "account_status": f.get("account_status", "active"),
            "created_at": f.get("created_at"),
            "last_login": f.get("last_login")
        })
    return faculty_list

@router.put("/{faculty_id}")
async def update_faculty_member(
    faculty_id: str,
    req: FacultyUpdateRequest,
    admin: dict = Depends(get_current_admin)
):
    """Admin updates faculty information, permissions, or active status"""
    db = await get_database()
    now = datetime.now(timezone.utc)

    update_fields = {"updated_at": now}
    if req.name is not None:
        update_fields["name"] = req.name.strip()
    if req.department is not None:
        update_fields["department"] = req.department.strip()
    if req.designation is not None:
        update_fields["designation"] = req.designation.strip()
    if req.permissions is not None:
        update_fields["permissions"] = req.permissions
    if req.account_status is not None:
        update_fields["account_status"] = req.account_status

    res = await db["faculty"].update_one(
        {"$or": [{"_id": faculty_id}, {"id": faculty_id}, {"faculty_id": faculty_id.upper()}]},
        {"$set": update_fields}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found.")

    await record_audit_log(
        actor_id=admin.get("user_id"),
        actor_name=admin.get("name", "Admin"),
        actor_role="admin",
        action="FACULTY_ACCOUNT_UPDATED",
        target_id=faculty_id,
        target_type="faculty",
        details=update_fields
    )

    return {"success": True, "message": "Faculty details updated."}

@router.get("/dashboard-stats")
async def get_faculty_dashboard_stats(faculty: dict = Depends(get_current_faculty)):
    """Retrieve aggregate statistics for faculty overview"""
    db = await get_database()

    total_approved = await db["students"].count_documents({"account_status": "active"})
    
    # Interview stats
    cursor = db["interview_results"].find()
    scores = []
    branch_counts = {}
    async for r in cursor:
        s = r.get("overall_score")
        if s is not None:
            scores.append(s)

    comp_count = len(scores)
    avg_score = round(sum(scores) / comp_count, 1) if comp_count > 0 else 0.0
    highest_score = max(scores) if comp_count > 0 else 0.0
    needing_improvement = len([s for s in scores if s < 60.0])

    # Recent completed interviews
    recent_cursor = db["interview_results"].find().sort("created_at", -1).limit(5)
    recent_activity = []
    async for rec in recent_cursor:
        recent_activity.append({
            "interview_id": rec.get("interview_id"),
            "student_name": rec.get("student_name"),
            "reg_no": rec.get("registration_number"),
            "overall_score": rec.get("overall_score"),
            "date": rec.get("interview_date")
        })

    return {
        "total_approved_students": total_approved,
        "completed_interviews": comp_count,
        "average_score": avg_score,
        "highest_score": highest_score,
        "students_needing_improvement": needing_improvement,
        "recent_activity": recent_activity
    }
