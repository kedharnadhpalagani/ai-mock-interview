from fastapi import APIRouter, HTTPException, status, Depends
from app.deps import get_current_admin
from app.database import get_database
from app.schemas.admin import EvaluationWeightsConfig
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
async def get_admin_dashboard_metrics(admin: dict = Depends(get_current_admin)):
    """Summary overview for administrative control panel"""
    db = await get_database()

    total_students = await db["students"].count_documents({})
    pending_approvals = await db["students"].count_documents({"account_status": "pending_approval"})
    active_students = await db["students"].count_documents({"account_status": "active"})
    rejected_students = await db["students"].count_documents({"account_status": "rejected"})
    suspended_students = await db["students"].count_documents({"account_status": "suspended"})
    total_faculty = await db["faculty"].count_documents({})
    total_interviews = await db["interviews"].count_documents({})

    results_cursor = db["interview_results"].find()
    scores = []
    async for r in results_cursor:
        if r.get("overall_score") is not None:
            scores.append(r["overall_score"])
    
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    audit_count = await db["audit_logs"].count_documents({})

    return {
        "total_students": total_students,
        "pending_approvals": pending_approvals,
        "active_students": active_students,
        "rejected_students": rejected_students,
        "suspended_students": suspended_students,
        "total_faculty": total_faculty,
        "total_interviews": total_interviews,
        "average_interview_score": avg_score,
        "total_audit_events": audit_count
    }

@router.get("/audit-logs")
async def get_audit_trail(
    limit: int = 50,
    skip: int = 0,
    admin: dict = Depends(get_current_admin)
):
    """Retrieve full immutable audit logs (credentials never exposed)"""
    db = await get_database()
    cursor = db["audit_logs"].find().sort("timestamp", -1).skip(skip).limit(limit)
    logs = []
    async for entry in cursor:
        logs.append({
            "id": str(entry.get("id", entry.get("_id"))),
            "actor_id": entry.get("actor_id"),
            "actor_name": entry.get("actor_name"),
            "actor_role": entry.get("actor_role"),
            "action": entry.get("action"),
            "target_id": entry.get("target_id"),
            "target_type": entry.get("target_type"),
            "reason": entry.get("reason"),
            "details": entry.get("details"),
            "timestamp": entry.get("timestamp")
        })
    total = await db["audit_logs"].count_documents({})
    return {"total": total, "logs": logs}

@router.get("/evaluation-weights")
async def get_evaluation_weights(admin: dict = Depends(get_current_admin)):
    """Retrieve active interview score weights"""
    db = await get_database()
    config = await db["system_settings"].find_one({"key": "evaluation_weights"})
    if config and "weights" in config:
        return config["weights"]
    return {
        "technical_knowledge": 40.0,
        "project_understanding": 25.0,
        "communication": 15.0,
        "problem_solving": 10.0,
        "behavioral_and_soft_skills": 10.0
    }

@router.put("/evaluation-weights")
async def update_evaluation_weights(
    weights: EvaluationWeightsConfig,
    admin: dict = Depends(get_current_admin)
):
    """
    Configure weights for the 5 evaluation categories.
    Strict validation enforces that weights sum to exactly 100%.
    """
    db = await get_database()
    weight_dict = weights.model_dump()

    await db["system_settings"].update_one(
        {"key": "evaluation_weights"},
        {"$set": {"weights": weight_dict, "total": 100.0}},
        upsert=True
    )

    await record_audit_log(
        actor_id=admin.get("user_id"),
        actor_name=admin.get("name", "Admin"),
        actor_role="admin",
        action="EVALUATION_WEIGHTS_UPDATED",
        target_type="system_settings",
        details=weight_dict
    )

    return {"success": True, "weights": weight_dict, "message": "Evaluation weights updated successfully."}

@router.get("/flagged-incidents")
async def get_flagged_proctoring_incidents(admin: dict = Depends(get_current_admin)):
    """Review sessions with repeated warnings or integrity termination"""
    db = await get_database()
    cursor = db["interviews"].find({
        "$or": [
            {"warnings_count": {"$gt": 0}},
            {"status": "terminated_violation"}
        ]
    }).sort("created_at", -1)

    incidents = []
    async for item in cursor:
        incidents.append({
            "interview_id": item.get("interview_id"),
            "student_name": item.get("student_name"),
            "registration_number": item.get("registration_number"),
            "warnings_count": item.get("warnings_count", 0),
            "status": item.get("status"),
            "incidents": item.get("proctoring_incidents", []),
            "date": item.get("started_at") or item.get("created_at")
        })
    return incidents
