from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

class StudentRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    university_reg_number: str = Field(..., min_length=4, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v

    @field_validator("university_reg_number")
    @classmethod
    def clean_reg_no(cls, v: str) -> str:
        return v.strip().upper()

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    purpose: str = Field(default="registration")  # registration or password_reset

class ResendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = Field(default="registration")

class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=2, description="Email, Registration Number, Faculty ID or Admin Username")
    password: str = Field(..., min_length=1)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    account_status: str
    user_id: str
    name: str
    email: str
    profile_status: Optional[str] = "incomplete"
    permissions: list[str] = []
