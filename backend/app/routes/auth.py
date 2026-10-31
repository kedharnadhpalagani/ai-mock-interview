from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import (
    StudentRegisterRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse
)
from app.services.auth_service import register_student_account, authenticate_user
from app.services.otp_service import create_and_send_otp, verify_otp
from app.security import (
    create_password_reset_token,
    verify_password_reset_token,
    hash_password
)
from app.database import get_database
from app.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp")
async def send_otp_endpoint(req: ResendOTPRequest):
    """Dispatch verification OTP via Resend"""
    success, message = await create_and_send_otp(req.email, purpose=req.purpose)
    if not success and "wait" in message.lower():
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=message)
    return {"success": success, "message": message}

@router.post("/verify-otp")
async def verify_otp_endpoint(req: VerifyOTPRequest):
    """Verify submitted 6-digit OTP code"""
    success, message = await verify_otp(req.email, req.otp, purpose=req.purpose)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"success": True, "message": message}

@router.post("/register-student", response_model=TokenResponse)
async def register_student_endpoint(
    req: StudentRegisterRequest,
    otp: str
):
    """
    Register student account after email OTP validation.
    Account status will strictly be set to 'pending_approval'.
    """
    return await register_student_account(
        full_name=req.full_name,
        university_reg_number=req.university_reg_number,
        email=req.email,
        password=req.password,
        otp_code=otp
    )

@router.post("/login", response_model=TokenResponse)
async def login_endpoint(req: LoginRequest):
    """Unified login for Students, Faculty, and Administrators"""
    return await authenticate_user(req.identifier, req.password)

@router.post("/forgot-password")
async def forgot_password_endpoint(req: ForgotPasswordRequest):
    """Initiate password reset flow by sending OTP"""
    db = await get_database()
    email_clean = req.email.strip().lower()

    # Verify if user exists in any role
    user = await db["students"].find_one({"email": email_clean})
    if not user:
        user = await db["faculty"].find_one({"email": email_clean})
    if not user:
        user = await db["admins"].find_one({"email": email_clean})

    if not user:
        # Avoid user enumeration by returning standard response
        return {"success": True, "message": "If the email is registered, a password reset code has been sent."}

    success, message = await create_and_send_otp(email_clean, purpose="password_reset")
    return {"success": success, "message": message}

@router.post("/verify-reset-otp")
async def verify_reset_otp_endpoint(req: VerifyOTPRequest):
    """Verify reset OTP and return short-lived reset token"""
    success, message = await verify_otp(req.email, req.otp, purpose="password_reset")
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    
    reset_token = create_password_reset_token(req.email.strip().lower())
    return {"success": True, "reset_token": reset_token}

@router.post("/reset-password")
async def reset_password_endpoint(req: ResetPasswordRequest):
    """Reset password using verified short-lived reset token"""
    email = verify_password_reset_token(req.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token is invalid or has expired. Please request a new code."
        )

    db = await get_database()
    new_hash = hash_password(req.new_password)

    # Check and update student
    res = await db["students"].update_one(
        {"email": email},
        {"$set": {"password_hash": new_hash}}
    )
    if res.matched_count == 0:
        res = await db["faculty"].update_one(
            {"email": email},
            {"$set": {"password_hash": new_hash}}
        )
    if res.matched_count == 0:
        res = await db["admins"].update_one(
            {"email": email},
            {"$set": {"password_hash": new_hash}}
        )

    return {"success": True, "message": "Your password has been successfully updated. You may now log in."}

@router.get("/me")
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    """Retrieve currently authenticated session profile"""
    return {
        "user_id": user.get("user_id"),
        "role": user.get("role"),
        "name": user.get("full_name") or user.get("name") or "User",
        "email": user.get("email"),
        "account_status": user.get("account_status"),
        "permissions": user.get("permissions", []),
        "profile_status": user.get("profile_status", "incomplete"),
        "registration_number": user.get("registration_number")
    }
