import pytest
from app.schemas.interview import ProjectDetail
from app.services.interview_service import create_interview_session
from app.services.evaluation_service import evaluate_interview_session
from app.schemas.admin import EvaluationWeightsConfig
from pydantic import ValidationError

@pytest.mark.asyncio
async def test_interview_setup_and_question_generation(mock_mongo):
    student_id = "stud_003"
    project = ProjectDetail(
        title="Automated Medical Imaging Diagnostic",
        description="Convolutional Neural Network classifying X-ray anomalies with attention maps.",
        technologies="Python, PyTorch, FastAPI, OpenCV",
        student_contribution="Architected feature extraction backbone and API inference engine.",
        challenges="Data imbalance and GPU memory fragmentation.",
        outcomes="92.4% validation accuracy with 40ms inference latency."
    )

    session = await create_interview_session(
        student_id=student_id,
        student_name="Ananya Rao",
        registration_number="211FA04003",
        selected_skills=["Python", "Machine Learning and Artificial Intelligence"],
        projects=[project],
        duration_minutes=20
    )

    assert session["interview_id"] is not None
    assert session["questions_count"] >= 8

    # Verify interview session stored in DB
    doc = await mock_mongo["interviews"].find_one({"_id": session["interview_id"]})
    assert doc is not None
    assert doc["status"] == "ready"
    assert len(doc["questions"]) == session["questions_count"]

    # Verify project-specific question was generated
    project_questions = [q for q in doc["questions"] if q["category"] == "project"]
    assert len(project_questions) >= 2
    assert "Automated Medical Imaging Diagnostic" in project_questions[0]["question_text"]

@pytest.mark.asyncio
async def test_evidence_based_evaluation_and_weights(mock_mongo):
    interview_id = "mock_session_101"
    student_id = "stud_004"

    # Seed interview in DB with realistic transcript
    await mock_mongo["interviews"].insert_one({
        "_id": interview_id,
        "interview_id": interview_id,
        "student_id": student_id,
        "student_name": "Karthik Verma",
        "registration_number": "211FA04004",
        "selected_skills": ["Python", "Data Structures and Algorithms"],
        "projects": [{
            "title": "Cloud Storage Engine",
            "technologies": "Python, MongoDB, Docker",
            "student_contribution": "Designed chunking and hashing layer"
        }],
        "transcript": [
            {"sender": "candidate", "text": "I used Python's asyncio event loop to handle concurrent stream chunking, avoiding thread contention."},
            {"sender": "interviewer", "text": "Great! How did you ensure data integrity during packet transfer?"},
            {"sender": "candidate", "text": "We computed SHA-256 hashes for each chunk and validated against the manifest before assembly in MongoDB."}
        ],
        "status": "in_progress"
    })

    # Run evaluation
    result = await evaluate_interview_session(interview_id)
    assert result["interview_id"] == interview_id
    assert 0 <= result["overall_score"] <= 100
    assert len(result["category_breakdown"]) == 5
    assert len(result["suggested_career_roles"]) > 0

    # Verify duplicate prevention: running evaluate again returns existing result
    second_result = await evaluate_interview_session(interview_id)
    assert second_result["interview_id"] == result["interview_id"]
    assert second_result["overall_score"] == result["overall_score"]

def test_evaluation_weights_validation_must_sum_to_100():
    # Valid weights totaling 100%
    valid = EvaluationWeightsConfig(
        technical_knowledge=40,
        project_understanding=25,
        communication=15,
        problem_solving=10,
        behavioral_and_soft_skills=10
    )
    assert valid is not None

    # Invalid weights totaling 90% should raise ValidationError
    with pytest.raises(ValidationError):
        EvaluationWeightsConfig(
            technical_knowledge=30,
            project_understanding=25,
            communication=15,
            problem_solving=10,
            behavioral_and_soft_skills=10
        )
