from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

AcademicYearType = Literal["Second Year", "Third Year", "Fourth Year"]
BranchType = Literal["CSE", "ECE", "IT", "Mechanical", "Civil", "EEE", "Other"]
AccountStatusType = Literal["pending_approval", "active", "rejected", "suspended"]

class StudentProfileUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    date_of_birth: str = Field(..., description="YYYY-MM-DD format")
    place: str = Field(..., min_length=2, max_length=100)
    university: str = Field(default="Vignan's University", min_length=2, max_length=150)
    academic_year: AcademicYearType
    branch: BranchType
    section: str = Field(..., min_length=1, max_length=20)
    cgpa: float = Field(..., ge=6.0, le=10.0, description="CGPA must be between 6.0 and 10.0 inclusive")
    profile_image: Optional[str] = Field(default=None, description="Base64 or Cloudinary URL")

    @field_validator("cgpa")
    @classmethod
    def validate_cgpa(cls, v: float) -> float:
        if v < 6.0 or v > 10.0:
            raise ValueError("CGPA must be between 6.0 and 10.0 inclusive")
        return round(v, 2)

class StudentResponse(BaseModel):
    id: str
    full_name: str
    university_reg_number: str
    email: str
    account_status: AccountStatusType
    email_verified: bool
    registered_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    reviewer_role: Optional[str] = None
    rejection_reason: Optional[str] = None
    profile_status: str = "incomplete"
    
    # Profile details if completed
    date_of_birth: Optional[str] = None
    place: Optional[str] = None
    university: Optional[str] = "Vignan's University"
    academic_year: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    cgpa: Optional[float] = None
    profile_image: Optional[str] = None

class StudentStatusResponse(BaseModel):
    account_status: AccountStatusType
    registration_number: str
    email_verified: bool
    profile_status: str
    rejection_reason: Optional[str] = None
    message: str
    can_access_interview: bool
