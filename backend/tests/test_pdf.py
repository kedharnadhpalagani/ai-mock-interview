import pytest
from app.services.pdf_service import generate_interview_pdf_report

def test_pdf_report_generation():
    mock_result_data = {
        "student_name": "Siddharth Varma",
        "registration_number": "211FA04005",
        "interview_date": "2026-10-31T08:00:00Z",
        "duration_minutes": 20,
        "skills_assessed": ["Python", "Data Structures and Algorithms", "SQL and Databases"],
        "overall_score": 86.5,
        "category_breakdown": [
            {"category_name": "Technical Knowledge", "weight": 40, "score": 88, "weighted_score": 35.2, "feedback": "Solid fundamentals."},
            {"category_name": "Project Understanding", "weight": 25, "score": 85, "weighted_score": 21.2, "feedback": "Good ownership."},
            {"category_name": "Communication", "weight": 15, "score": 84, "weighted_score": 12.6, "feedback": "Clear delivery."},
            {"category_name": "Problem-Solving", "weight": 10, "score": 90, "weighted_score": 9.0, "feedback": "Logical reasoning."},
            {"category_name": "Behavioral & Soft Skills", "weight": 10, "score": 85, "weighted_score": 8.5, "feedback": "Positive attitude."}
        ],
        "strong_answers": ["Excellent explanation of hash collisions and B-Tree indexing."],
        "weak_answers": ["Could elaborate more on distributed cache invalidation."],
        "recommended_practice_questions": ["Explain how you debug production deadlocks in async code."],
        "suggested_career_roles": ["Backend Developer", "Software Development Engineer"]
    }

    pdf_buffer = generate_interview_pdf_report(mock_result_data)
    pdf_bytes = pdf_buffer.getvalue()

    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")
