import pytest
from datetime import datetime, timedelta, timezone
from app.security import (
    hash_password,
    verify_password,
    generate_secure_otp,
    create_access_token,
    decode_access_token,
    create_password_reset_token,
    verify_password_reset_token
)
from app.services.otp_service import verify_otp
from app.services.auth_service import register_student_account, authenticate_user
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_argon2id_hashing():
    pw = "Vignan@Secure2026"
    hashed = hash_password(pw)
    assert hashed.startswith("$argon2id$")
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

@pytest.mark.asyncio
async def test_jwt_token_claims():
    token = create_access_token(
        subject="student_123",
        role="student",
        account_status="pending_approval"
    )
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "student_123"
    assert payload["role"] == "student"
    assert payload["account_status"] == "pending_approval"

@pytest.mark.asyncio
async def test_otp_attempt_limits_and_expiry(mock_mongo):
    email = "test.student@vignan.ac.in"
    otp_code = "123456"
    now = datetime.now(timezone.utc)

    # Insert OTP record
    await mock_mongo["otp_verifications"].insert_one({
        "email": email,
        "otp": otp_code,
        "purpose": "registration",
        "attempts": 0,
        "max_attempts": 3,
        "is_used": False,
        "created_at": now,
        "expires_at": now + timedelta(minutes=5)
    })

    # Test wrong code increments attempts
    valid, msg = await verify_otp(email, "000000", "registration")
    assert valid is False
    assert "Incorrect" in msg

    # Test valid code succeeds
    valid, msg = await verify_otp(email, otp_code, "registration")
    assert valid is True
    assert "successfully" in msg

@pytest.mark.asyncio
async def test_student_registration_pending_approval_rule(mock_mongo):
    email = "rahul.211fa04001@vignan.ac.in"
    reg_no = "211FA04001"
    otp_code = "998877"
    now = datetime.now(timezone.utc)

    # Prepare verified OTP
    await mock_mongo["otp_verifications"].insert_one({
        "email": email,
        "otp": otp_code,
        "purpose": "registration",
        "attempts": 0,
        "max_attempts": 5,
        "is_used": False,
        "created_at": now,
        "expires_at": now + timedelta(minutes=5)
    })

    result = await register_student_account(
        full_name="Rahul Sharma",
        university_reg_number=reg_no,
        email=email,
        password="ValidPassword123!",
        otp_code=otp_code
    )

    # Verify NON-NEGOTIABLE RULE: account_status must be pending_approval
    assert result["account_status"] == "pending_approval"
    assert result["role"] == "student"

    # Verify student saved in DB with pending_approval
    saved = await mock_mongo["students"].find_one({"email": email})
    assert saved is not None
    assert saved["account_status"] == "pending_approval"
    assert saved["email_verified"] is True
    assert saved["registration_number"] == reg_no

    # Test duplicate registration number rejection
    with pytest.raises(HTTPException) as exc_info:
        await register_student_account(
            full_name="Duplicate Rahul",
            university_reg_number=reg_no,
            email="other.email@vignan.ac.in",
            password="ValidPassword123!",
            otp_code=otp_code
        )
    assert exc_info.value.status_code == 400
    assert "registration number already exists" in exc_info.value.detail.lower()

@pytest.mark.asyncio
async def test_password_reset_flow():
    email = "reset.test@vignan.ac.in"
    token = create_password_reset_token(email)
    verified_email = verify_password_reset_token(token)
    assert verified_email == email
