from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class FacultyCreateRequest(BaseModel):
    faculty_id: str = Field(..., min_length=3, max_length=30)
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=2, max_length=50)
    designation: str = Field(default="Assistant Professor", max_length=50)
    initial_password: str = Field(..., min_length=8, max_length=128)
    permissions: List[str] = Field(default=[], description="e.g. ['student_approval', 'export_data']")

class FacultyUpdateRequest(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    permissions: Optional[List[str]] = None
    account_status: Optional[str] = None  # active, inactive

class FacultyResponse(BaseModel):
    id: str
    faculty_id: str
    name: str
    email: str
    department: str
    designation: str
    permissions: List[str]
    account_status: str
    created_at: datetime
    last_login: Optional[datetime] = None

class StudentApprovalDecision(BaseModel):
    student_id: str
    action: str = Field(..., description="approve, reject, suspend, reactivate, reconsider")
    rejection_reason: Optional[str] = Field(default=None, description="Mandatory when action is 'reject'")

class FacultyAnalyticsOverview(BaseModel):
    total_approved_students: int
    completed_interviews: int
    average_score: float
    highest_score: float
    students_needing_improvement: int
    branch_distribution: dict
    score_bands: dict
