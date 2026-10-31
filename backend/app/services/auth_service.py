import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from fastapi import HTTPException, status
from app.database import get_database
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token
)
from app.services.audit_service import record_audit_log
from app.services.otp_service import verify_otp, create_and_send_otp

async def register_student_account(
    full_name: str,
    university_reg_number: str,
    email: str,
    password: str,
    otp_code: str
) -> Dict[str, Any]:
    db = await get_database()
    email_clean = email.strip().lower()
    reg_clean = university_reg_number.strip().upper()

    # 1. Check unique email constraint
    existing_email = await db["students"].find_one({"email": email_clean})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # 2. Check unique registration number constraint
    existing_reg = await db["students"].find_one({"registration_number": reg_clean})
    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this university registration number already exists."
        )

    # 3. Verify OTP
    otp_valid, otp_msg = await verify_otp(email_clean, otp_code, purpose="registration")
    if not otp_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=otp_msg)

    # 4. Hash password with Argon2id
    hashed = hash_password(password)

    # 5. Create student document with mandatory initial pending_approval state
    now = datetime.now(timezone.utc)
    student_id = str(uuid.uuid4())
    student_doc = {
        "_id": student_id,
        "id": student_id,
        "full_name": full_name.strip(),
        "registration_number": reg_clean,
        "email": email_clean,
        "password_hash": hashed,
        "account_status": "pending_approval",  # Strict non-negotiable rule
        "email_verified": True,
        "registered_at": now,
        "reviewed_at": None,
        "reviewed_by": None,
        "reviewer_role": None,
        "rejection_reason": None,
        "profile_status": "incomplete",
        "created_at": now,
        "updated_at": now
    }

    await db["students"].insert_one(student_doc)

    # 6. Audit log
    await record_audit_log(
        actor_id=student_id,
        actor_name=full_name.strip(),
        actor_role="student",
        action="STUDENT_REGISTERED",
        target_id=student_id,
        target_type="student",
        details={"registration_number": reg_clean, "email": email_clean}
    )

    # Create restricted access token for viewing status
    token = create_access_token(
        subject=student_id,
        role="student",
        account_status="pending_approval"
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "student",
        "account_status": "pending_approval",
        "user_id": student_id,
        "name": full_name.strip(),
        "email": email_clean,
        "profile_status": "incomplete"
    }

async def authenticate_user(identifier: str, password: str) -> Dict[str, Any]:
    db = await get_database()
    ident_clean = identifier.strip()
    ident_lower = ident_clean.lower()
    ident_upper = ident_clean.upper()

    # Check Admins first
    admin = await db["admins"].find_one({
        "$or": [
            {"username": ident_clean},
            {"email": ident_lower}
        ]
    })
    if admin and verify_password(password, admin.get("password_hash", "")):
        # Update last login
        await db["admins"].update_one(
            {"_id": admin["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}}
        )
        token = create_access_token(
            subject=str(admin.get("id", admin.get("_id"))),
            role="admin",
            account_status="active",
            permissions=["all", "student_approval", "manage_faculty", "manage_settings"]
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "admin",
            "account_status": "active",
            "user_id": str(admin.get("id", admin.get("_id"))),
            "name": admin.get("name", "Administrator"),
            "email": admin.get("email", ""),
            "permissions": ["all", "student_approval", "manage_faculty", "manage_settings"]
        }

    # Check Faculty
    faculty = await db["faculty"].find_one({
        "$or": [
            {"faculty_id": ident_clean},
            {"faculty_id": ident_upper},
            {"email": ident_lower}
        ]
    })
    if faculty and verify_password(password, faculty.get("password_hash", "")):
        if faculty.get("account_status") != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your faculty account is deactivated. Contact administration."
            )
        await db["faculty"].update_one(
            {"_id": faculty["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}}
        )
        token = create_access_token(
            subject=str(faculty.get("id", faculty.get("_id"))),
            role="faculty",
            account_status="active",
            permissions=faculty.get("permissions", [])
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "faculty",
            "account_status": "active",
            "user_id": str(faculty.get("id", faculty.get("_id"))),
            "name": faculty.get("name", ""),
            "email": faculty.get("email", ""),
            "permissions": faculty.get("permissions", [])
        }

    # Check Students
    student = await db["students"].find_one({
        "$or": [
            {"email": ident_lower},
            {"registration_number": ident_upper},
            {"registration_number": ident_clean}
        ]
    })
    if student and verify_password(password, student.get("password_hash", "")):
        acc_status = student.get("account_status", "pending_approval")
        if acc_status == "suspended":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your student account has been suspended by administration. Access is restricted."
            )
        
        token = create_access_token(
            subject=str(student.get("id", student.get("_id"))),
            role="student",
            account_status=acc_status
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "student",
            "account_status": acc_status,
            "user_id": str(student.get("id", student.get("_id"))),
            "name": student.get("full_name", ""),
            "email": student.get("email", ""),
            "profile_status": student.get("profile_status", "incomplete"),
            "rejection_reason": student.get("rejection_reason")
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. Please verify your identifier and password."
    )
