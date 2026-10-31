from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field, model_validator

class EvaluationWeightsConfig(BaseModel):
    technical_knowledge: float = Field(default=40.0, ge=0, le=100)
    project_understanding: float = Field(default=25.0, ge=0, le=100)
    communication: float = Field(default=15.0, ge=0, le=100)
    problem_solving: float = Field(default=10.0, ge=0, le=100)
    behavioral_and_soft_skills: float = Field(default=10.0, ge=0, le=100)

    @model_validator(mode="after")
    def validate_sum_100(self) -> "EvaluationWeightsConfig":
        total = (
            self.technical_knowledge +
            self.project_understanding +
            self.communication +
            self.problem_solving +
            self.behavioral_and_soft_skills
        )
        if abs(total - 100.0) > 0.01:
            raise ValueError(f"Total weights must equal exactly 100%. Current sum: {total:.1f}%")
        return self

class AuditLogEntry(BaseModel):
    id: str
    actor_id: str
    actor_name: str
    actor_role: str
    action: str
    target_id: Optional[str] = None
    target_type: Optional[str] = None
    reason: Optional[str] = None
    details: Optional[Dict] = None
    timestamp: datetime

class AdminDashboardStats(BaseModel):
    total_students: int
    pending_approvals: int
    active_students: int
    rejected_students: int
    suspended_students: int
    total_faculty: int
    total_interviews: int
    average_interview_score: float
    total_audit_events: int
