from typing import List, Optional, Literal, Dict
from datetime import datetime
from pydantic import BaseModel, Field

VALID_TECHNICAL_SKILLS = [
    "C",
    "C++",
    "Java",
    "Python",
    "JavaScript",
    "Data Structures and Algorithms",
    "SQL and Databases",
    "HTML, CSS and Web Development",
    "Machine Learning and Artificial Intelligence",
    "Operating Systems and Computer Networks"
]

class ProjectDetail(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=10, max_length=1000)
    technologies: str = Field(..., min_length=2, max_length=200, description="e.g. Python, FastAPI, MongoDB, React")
    student_contribution: str = Field(..., min_length=10, max_length=1000)
    challenges: str = Field(..., min_length=5, max_length=1000)
    outcomes: str = Field(..., min_length=5, max_length=1000)

class InterviewSetupRequest(BaseModel):
    selected_skills: List[str] = Field(..., min_length=1, max_length=10)
    projects: List[ProjectDetail] = Field(..., min_length=1, description="At least one project is required")
    target_role: Optional[str] = Field(default="Software Engineer", max_length=100)
    duration_minutes: Optional[int] = Field(default=20, ge=10, le=45)

class InterviewQuestion(BaseModel):
    id: str
    category: str  # technical, project, behavioral
    skill_topic: str
    difficulty: Literal["beginner", "intermediate", "advanced"]
    question_text: str
    expected_key_points: List[str] = []

class EvaluationCategoryScore(BaseModel):
    category_name: str
    score: float = Field(..., ge=0, le=100)
    weight: float = Field(..., ge=0, le=100)
    weighted_score: float
    feedback: str
    key_observations: List[str] = []

class EvidenceItem(BaseModel):
    question: str
    student_response_summary: str
    assessment: Literal["strong", "satisfactory", "weak"]
    explanation: str
    recommendation: Optional[str] = None

class InterviewEvaluationResult(BaseModel):
    interview_id: str
    student_id: str
    student_name: str
    registration_number: str
    interview_date: datetime
    duration_minutes: int
    skills_assessed: List[str]
    project_topics: List[str]
    
    # Overall and category scores
    overall_score: float = Field(..., ge=0, le=100)
    technical_knowledge_score: float = Field(..., ge=0, le=100)
    project_understanding_score: float = Field(..., ge=0, le=100)
    communication_score: float = Field(..., ge=0, le=100)
    problem_solving_score: float = Field(..., ge=0, le=100)
    behavioral_and_soft_skills_score: float = Field(..., ge=0, le=100)

    category_breakdown: List[EvaluationCategoryScore]
    evidence_items: List[EvidenceItem]

    strong_answers: List[str]
    weak_answers: List[str]
    explanations: List[str]
    knowledge_gaps: List[str]
    skills_to_improve: List[str]
    recommended_practice_questions: List[str]
    suggested_career_roles: List[str]
    final_verdict: str

class ProctoringWarningEvent(BaseModel):
    type: Literal["face_absent", "multiple_faces", "camera_disconnected", "microphone_disconnected", "repeated_interruptions"]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    warning_level: int = Field(..., ge=1, le=4)
    details: Optional[str] = None

class EndInterviewRequest(BaseModel):
    final_transcript: List[Dict[str, str]] = []
    proctoring_incidents: List[ProctoringWarningEvent] = []
    end_reason: Literal["completed", "violation_terminated", "user_cancelled"] = "completed"
