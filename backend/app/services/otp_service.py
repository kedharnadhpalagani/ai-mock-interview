
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Tuple, Optional

import resend

from app.config import settings
from app.database import get_database
from app.security import generate_secure_otp


logger = logging.getLogger("uvicorn.error")


def to_utc_aware(value: Optional[datetime]) -> Optional[datetime]:
    """
    Convert MongoDB datetime values into timezone-aware UTC datetimes.

    MongoDB commonly returns naive datetime objects even when the
    original datetime was stored in UTC.
    """
    if value is None:
        return None

    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


async def send_email_via_resend(
    to_email: str,
    subject: str,
    html_content: str
) -> Tuple[bool, str]:
    """Send an email using the Resend API."""

    if not settings.RESEND_API_KEY:
        logger.warning(
            f"RESEND_API_KEY is not configured. Email to {to_email} "
            "not sent via network. Please configure RESEND_API_KEY "
            "and EMAIL_FROM in production."
        )
        return False, (
            "RESEND_API_KEY is not configured in backend "
            "environment variables."
        )

    try:
        resend.api_key = settings.RESEND_API_KEY

        params: resend.Emails.SendParams = {
            "from": settings.EMAIL_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }

        response = resend.Emails.send(params)

        logger.info(
            f"Resend email sent successfully to {to_email}. "
            f"ID: {response.get('id', 'ok')}"
        )

        return True, "Email sent successfully."

    except Exception as e:
        error_msg = str(e)

        logger.error(
            f"Failed to send email to {to_email} via Resend: "
            f"{error_msg}"
        )

        return False, f"Resend email delivery failed: {error_msg}"


async def create_and_send_otp(
    email: str,
    purpose: str = "registration"
) -> Tuple[bool, str]:
    """Generate, store, and dispatch a 6-digit OTP."""

    db = await get_database()
    now = datetime.now(timezone.utc)

    normalized_email = email.lower().strip()

    # Check whether an active OTP was recently requested.
    existing_otp = await db["otp_verifications"].find_one({
        "email": normalized_email,
        "purpose": purpose,
        "is_used": False,
        "expires_at": {"$gt": now}
    })

    if existing_otp:
        created_at = to_utc_aware(
            existing_otp.get("created_at")
        )

        if created_at:
            elapsed_seconds = (
                now - created_at
            ).total_seconds()

            if elapsed_seconds < settings.OTP_RESEND_COOLDOWN_SECONDS:
                remaining_seconds = int(
                    settings.OTP_RESEND_COOLDOWN_SECONDS
                    - elapsed_seconds
                )

                return False, (
                    f"Please wait {remaining_seconds} seconds "
                    "before requesting a new OTP."
                )

    # Invalidate previous unverified OTPs.
    await db["otp_verifications"].update_many(
        {
            "email": normalized_email,
            "purpose": purpose
        },
        {
            "$set": {"is_used": True}
        }
    )

    # Generate a new six-digit OTP.
    otp_code = generate_secure_otp(6)

    expires_at = now + timedelta(
        minutes=settings.OTP_EXPIRE_MINUTES
    )

    otp_record = {
        "id": str(uuid.uuid4()),
        "email": normalized_email,
        "otp": otp_code,
        "purpose": purpose,
        "attempts": 0,
        "max_attempts": settings.OTP_MAX_ATTEMPTS,
        "is_used": False,
        "created_at": now,
        "expires_at": expires_at
    }

    await db["otp_verifications"].insert_one(otp_record)

    # Email subject.
    subject = (
        "Your Verification OTP — AI Mock Interview "
        "(Vignan's University)"
        if purpose == "registration"
        else "Password Reset OTP — AI Mock Interview "
        "(Vignan's University)"
    )

    # Email HTML template.
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0A0A1B;
          color: #F5F7FF;
          padding: 20px;
        }}

        .card {{
          max-width: 500px;
          margin: 0 auto;
          background: #16163F;
          border: 1px solid #8B5CF6;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
        }}

        .logo-text {{
          font-size: 20px;
          font-weight: bold;
          color: #22D3EE;
          margin-bottom: 8px;
        }}

        .title {{
          font-size: 16px;
          color: #F5F7FF;
          margin-bottom: 24px;
        }}

        .otp-box {{
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #8B5CF6;
          background: rgba(139, 92, 246, 0.1);
          padding: 16px;
          border-radius: 8px;
          border: 1px dashed #8B5CF6;
          display: inline-block;
          margin: 20px 0;
        }}

        .footer {{
          font-size: 12px;
          color: #94A3B8;
          margin-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 15px;
        }}
      </style>
    </head>

    <body>
      <div class="card">

        <div class="logo-text">
          VIGNAN'S UNIVERSITY
        </div>

        <div class="title">
          AI Mock Interview Platform
        </div>

        <p>
          Use the one-time verification code below to complete your
          {purpose.replace('_', ' ')}.
        </p>

        <div class="otp-box">
          {otp_code}
        </div>

        <p style="font-size: 14px; color: #FF6B8A;">
          This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.
        </p>

        <p style="font-size: 13px; color: #94A3B8;">
          If you did not request this verification code,
          please ignore this email.
        </p>

        <div class="footer">
          Vignan's Foundation for Science, Technology &amp; Research
          <br>
          Automated System — Please do not reply to this email.
        </div>

      </div>
    </body>
    </html>
    """

    # Send OTP email.
    success, message = await send_email_via_resend(
        normalized_email,
        subject,
        html_content
    )

    # Development fallback.
    if not success and not settings.RESEND_API_KEY:
        logger.info(
            f"===> [DEV / LOCAL OTP] For {normalized_email} "
            f"({purpose}): {otp_code} "
            f"(Valid for {settings.OTP_EXPIRE_MINUTES} mins) <==="
        )

        return True, (
            "Verification OTP generated. "
            "(Development Mode: Checked in server log)"
        )

    return success, message


async def verify_otp(
    email: str,
    otp: str,
    purpose: str = "registration"
) -> Tuple[bool, str]:
    """Validate OTP with attempt limits and expiration checks."""

    db = await get_database()
    now = datetime.now(timezone.utc)

    normalized_email = email.lower().strip()

    # Find active OTP.
    record = await db["otp_verifications"].find_one({
        "email": normalized_email,
        "purpose": purpose,
        "is_used": False
    })

    if not record:
        return False, (
            "No active verification OTP found. "
            "Please request a new code."
        )

    # Check maximum attempts.
    if record.get("attempts", 0) >= record.get(
        "max_attempts",
        settings.OTP_MAX_ATTEMPTS
    ):
        await db["otp_verifications"].update_one(
            {"_id": record["_id"]},
            {"$set": {"is_used": True}}
        )

        return False, (
            "Maximum verification attempts exceeded. "
            "Please request a new OTP."
        )

    # Normalize MongoDB expiration datetime to UTC.
    expires_at = to_utc_aware(
        record.get("expires_at")
    )

    # Check expiration.
    if expires_at is None or expires_at < now:
        await db["otp_verifications"].update_one(
            {"_id": record["_id"]},
            {"$set": {"is_used": True}}
        )

        return False, (
            "Verification OTP has expired. "
            "Please request a new code."
        )

    # Check submitted OTP.
    if record.get("otp") != otp.strip():
        await db["otp_verifications"].update_one(
            {"_id": record["_id"]},
            {"$inc": {"attempts": 1}}
        )

        remaining = (
            record.get(
                "max_attempts",
                settings.OTP_MAX_ATTEMPTS
            )
            - (record.get("attempts", 0) + 1)
        )

        return False, (
            f"Incorrect verification OTP. "
            f"{remaining} attempt(s) remaining."
        )

    # Mark OTP as successfully used.
    await db["otp_verifications"].update_one(
        {"_id": record["_id"]},
        {
            "$set": {
                "is_used": True,
                "verified_at": now
            }
        }
    )

    return True, "OTP verified successfully."
