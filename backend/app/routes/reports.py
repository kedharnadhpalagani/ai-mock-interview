from fastapi import APIRouter, HTTPException, status, Depends, Response
from app.deps import get_current_user
from app.database import get_database
from app.services.pdf_service import generate_interview_pdf_report
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{interview_id}/pdf")
async def download_interview_pdf(
    interview_id: str,
    user: dict = Depends(get_current_user)
):
    """Generate and download official PDF interview assessment report"""
    db = await get_database()
    result = await db["interview_results"].find_one({
        "$or": [{"_id": interview_id}, {"interview_id": interview_id}]
    })

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation report not found for this session."
        )

    # Access control: Student can only view their own
    if user.get("role") == "student" and result.get("student_id") != user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are only authorized to download your own assessment reports."
        )

    pdf_buffer = generate_interview_pdf_report(result)

    await record_audit_log(
        actor_id=user.get("user_id"),
        actor_name=user.get("full_name") or user.get("name", "User"),
        actor_role=user.get("role"),
        action="PDF_REPORT_DOWNLOADED",
        target_id=interview_id,
        target_type="interview_report"
    )

    filename = f"Vignan_Mock_Interview_{result.get('registration_number', 'Report')}_{interview_id[:8]}.pdf"

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "application/pdf"
        }
    )
