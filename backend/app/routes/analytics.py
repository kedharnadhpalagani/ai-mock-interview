import csv
import io
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Response
from app.deps import get_current_faculty
from app.database import get_database
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/students")
async def search_and_filter_students(
    search: Optional[str] = None,
    branch: Optional[str] = None,
    academic_year: Optional[str] = None,
    section: Optional[str] = None,
    account_status: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    page: int = 1,
    limit: int = 20,
    faculty: dict = Depends(get_current_faculty)
):
    """
    Search and filter students for Faculty/Admin table with pagination.
    Supports filtering by name, reg number, branch, year, section, score.
    """
    db = await get_database()
    query = {}

    if account_status:
        query["account_status"] = account_status

    if branch:
        query["branch"] = branch

    if academic_year:
        query["academic_year"] = academic_year

    if section:
        query["section"] = section.upper()

    if search:
        search_rgx = {"$regex": search.strip(), "$options": "i"}
        query["$or"] = [
            {"full_name": search_rgx},
            {"registration_number": search_rgx},
            {"email": search_rgx}
        ]

    total_count = await db["students"].count_documents(query)
    cursor = db["students"].find(query).sort("registered_at", -1).skip((page - 1) * limit).limit(limit)

    students_list = []
    async for s in cursor:
        student_id = str(s.get("id", s.get("_id")))
        # Lookup latest interview result
        latest_res = await db["interview_results"].find_one(
            {"student_id": student_id},
            sort=[("created_at", -1)]
        )
        latest_score = latest_res.get("overall_score") if latest_res else None
        interview_id = latest_res.get("interview_id") if latest_res else None
        interview_date = latest_res.get("interview_date") if latest_res else None

        # Filter by score if requested
        if min_score is not None and (latest_score is None or latest_score < min_score):
            continue
        if max_score is not None and (latest_score is None or latest_score > max_score):
            continue

        students_list.append({
            "id": student_id,
            "name": s.get("full_name"),
            "registration_number": s.get("registration_number"),
            "email": s.get("email"),
            "branch": s.get("branch") or "Not Specified",
            "academic_year": s.get("academic_year") or "Not Specified",
            "section": s.get("section") or "N/A",
            "cgpa": s.get("cgpa"),
            "account_status": s.get("account_status"),
            "profile_status": s.get("profile_status", "incomplete"),
            "profile_image": s.get("profile_image"),
            "latest_score": latest_score,
            "latest_interview_id": interview_id,
            "latest_interview_date": interview_date
        })

    return {
        "page": page,
        "limit": limit,
        "total": total_count,
        "students": students_list
    }

@router.get("/branch-performance")
async def get_branch_performance_analytics(faculty: dict = Depends(get_current_faculty)):
    """Aggregate score averages and participation counts grouped by Branch"""
    db = await get_database()
    branches = ["CSE", "ECE", "IT", "Mechanical", "Civil", "EEE", "Other"]
    stats = []

    for b in branches:
        student_ids = []
        cursor = db["students"].find({"branch": b})
        async for s in cursor:
            student_ids.append(str(s.get("id", s.get("_id"))))

        if not student_ids:
            stats.append({"branch": b, "total_students": 0, "completed_interviews": 0, "average_score": 0.0})
            continue

        res_cursor = db["interview_results"].find({"student_id": {"$in": student_ids}})
        scores = []
        async for r in res_cursor:
            if r.get("overall_score") is not None:
                scores.append(r["overall_score"])

        avg = round(sum(scores) / len(scores), 1) if scores else 0.0
        stats.append({
            "branch": b,
            "total_students": len(student_ids),
            "completed_interviews": len(scores),
            "average_score": avg
        })

    return {"branch_analytics": stats}

@router.get("/score-distribution")
async def get_score_distribution(faculty: dict = Depends(get_current_faculty)):
    """Score distribution across defined proficiency tiers"""
    db = await get_database()
    bands = {
        "Needs Improvement (<60)": 0,
        "Competent (60-74)": 0,
        "Proficient (75-89)": 0,
        "Exemplary (90-100)": 0
    }

    cursor = db["interview_results"].find()
    async for r in cursor:
        sc = r.get("overall_score", 0.0)
        if sc < 60:
            bands["Needs Improvement (<60)"] += 1
        elif sc < 75:
            bands["Competent (60-74)"] += 1
        elif sc < 90:
            bands["Proficient (75-89)"] += 1
        else:
            bands["Exemplary (90-100)"] += 1

    chart_data = [{"band": k, "count": v} for k, v in bands.items()]
    return {"distribution": chart_data}

@router.get("/export-csv")
async def export_students_csv(faculty: dict = Depends(get_current_faculty)):
    """Export authorized student performance data as CSV with audit record"""
    # Check export permission if role is faculty
    if faculty.get("role") == "faculty":
        perms = faculty.get("permissions", [])
        if "export_data" not in perms and "student_approval" not in perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not possess permission to export university student data."
            )

    db = await get_database()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Registration Number", "Student Name", "Email", "Branch",
        "Academic Year", "Section", "CGPA", "Account Status", "Latest Mock Score"
    ])

    cursor = db["students"].find({"account_status": "active"}).sort("registration_number", 1)
    async for s in cursor:
        student_id = str(s.get("id", s.get("_id")))
        latest_res = await db["interview_results"].find_one(
            {"student_id": student_id},
            sort=[("created_at", -1)]
        )
        sc = latest_res.get("overall_score", "N/A") if latest_res else "N/A"
        writer.writerow([
            s.get("registration_number"),
            s.get("full_name"),
            s.get("email"),
            s.get("branch", ""),
            s.get("academic_year", ""),
            s.get("section", ""),
            s.get("cgpa", ""),
            s.get("account_status"),
            sc
        ])

    # Audit logging for export
    await record_audit_log(
        actor_id=faculty.get("user_id"),
        actor_name=faculty.get("name", "User"),
        actor_role=faculty.get("role"),
        action="STUDENT_DATA_EXPORTED",
        target_type="csv_export",
        details={"format": "csv"}
    )

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vignan_student_mock_interview_data.csv"}
    )
