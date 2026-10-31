import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.database import get_database

async def record_audit_log(
    actor_id: str,
    actor_name: str,
    actor_role: str,
    action: str,
    target_id: Optional[str] = None,
    target_type: Optional[str] = None,
    reason: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
):
    """
    Log system action for administrative transparency.
    Security rule: Never log passwords, OTPs, auth tokens, or private API keys.
    """
    db = await get_database()
    if db is None:
        return

    # Sanitize details to guarantee no secrets leak into audit trail
    sanitized_details = {}
    if details:
        for k, v in details.items():
            if any(secret_word in k.lower() for secret_word in ["password", "token", "otp", "secret", "key", "credential"]):
                sanitized_details[k] = "[REDACTED]"
            else:
                sanitized_details[k] = v

    log_doc = {
        "id": str(uuid.uuid4()),
        "actor_id": str(actor_id),
        "actor_name": actor_name,
        "actor_role": actor_role,
        "action": action,
        "target_id": str(target_id) if target_id else None,
        "target_type": target_type,
        "reason": reason,
        "details": sanitized_details,
        "timestamp": datetime.now(timezone.utc)
    }

    try:
        await db["audit_logs"].insert_one(log_doc)
    except Exception:
        # Prevent audit logging failure from failing the main operation
        pass
