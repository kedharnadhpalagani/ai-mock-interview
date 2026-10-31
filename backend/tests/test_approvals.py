import pytest
from app.services.approval_service import process_student_decision
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_approval_workflow(mock_mongo):
    student_id = "stud_001"
    await mock_mongo["students"].insert_one({
        "_id": student_id,
        "id": student_id,
        "full_name": "Priya Reddy",
        "registration_number": "211FA04002",
        "email": "priya.reddy@vignan.ac.in",
        "account_status": "pending_approval"
    })

    # 1. Approve student
    res = await process_student_decision(
        student_id=student_id,
        action="approve",
        reviewer_id="admin_1",
        reviewer_name="Dr. Admin",
        reviewer_role="admin"
    )
    assert res["new_status"] == "active"
    updated = await mock_mongo["students"].find_one({"_id": student_id})
    assert updated["account_status"] == "active"
    assert updated["reviewed_by"] == "Dr. Admin"

    # 2. Reject student requires reason
    with pytest.raises(HTTPException) as exc:
        await process_student_decision(
            student_id=student_id,
            action="reject",
            reviewer_id="admin_1",
            reviewer_name="Dr. Admin",
            reviewer_role="admin",
            rejection_reason=""
        )
    assert exc.value.status_code == 400
    assert "rejection reason is required" in exc.value.detail.lower()

    # 3. Reject with valid reason
    res = await process_student_decision(
        student_id=student_id,
        action="reject",
        reviewer_id="admin_1",
        reviewer_name="Dr. Admin",
        reviewer_role="admin",
        rejection_reason="Duplicate registration credentials detected."
    )
    assert res["new_status"] == "rejected"
    assert res["rejection_reason"] == "Duplicate registration credentials detected."

    # 4. Reconsider resets back to pending_approval
    res = await process_student_decision(
        student_id=student_id,
        action="reconsider",
        reviewer_id="admin_1",
        reviewer_name="Dr. Admin",
        reviewer_role="admin"
    )
    assert res["new_status"] == "pending_approval"

    # 5. Faculty cannot suspend account
    with pytest.raises(HTTPException) as exc:
        await process_student_decision(
            student_id=student_id,
            action="suspend",
            reviewer_id="faculty_1",
            reviewer_name="Prof. Sharma",
            reviewer_role="faculty"
        )
    assert exc.value.status_code == 403
    assert "only administrators possess permission to suspend" in exc.value.detail.lower()
