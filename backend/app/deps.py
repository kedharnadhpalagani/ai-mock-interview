import logging
from typing import Optional, Dict, Any, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_database
from app.security import decode_access_token

logger = logging.getLogger("uvicorn.error")
security = HTTPBearer(auto_error=False)

async def get_current_user_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

async def get_current_user(
    token_data: Dict[str, Any] = Depends(get_current_user_token)
) -> Dict[str, Any]:
    db = await get_database()
    user_id = token_data.get("sub")
    role = token_data.get("role")

    if not user_id or not role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload.")

    user = None
    if role == "student":
        user = await db["students"].find_one({"_id": user_id})
        if not user:
            # check string id
            user = await db["students"].find_one({"id": user_id})
    elif role == "faculty":
        user = await db["faculty"].find_one({"_id": user_id})
        if not user:
            user = await db["faculty"].find_one({"id": user_id})
    elif role == "admin":
        user = await db["admins"].find_one({"_id": user_id})
        if not user:
            user = await db["admins"].find_one({"id": user_id})
            if not user:
                # bootstrap admin fallback
                user = await db["admins"].find_one({"username": user_id})

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account no longer exists.")

    # Always revalidate account status in the database on protected requests!
    account_status = user.get("account_status", "active")
    if account_status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended by administration. Access is restricted."
        )

    # Attach role and permissions to user object
    user["role"] = role
    user["user_id"] = user_id
    user["account_status"] = account_status
    user["permissions"] = user.get("permissions", token_data.get("permissions", []))
    return user

async def get_current_active_student(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action is only accessible to students."
        )
    account_status = current_user.get("account_status")
    if account_status == "pending_approval":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently pending administrative approval."
        )
    if account_status == "rejected":
        rejection_reason = current_user.get("rejection_reason", "Not specified")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your account application was rejected. Reason: {rejection_reason}"
        )
    if account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account status '{account_status}' is not active."
        )
    return current_user

async def get_current_faculty(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    if current_user.get("role") not in ["faculty", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to authorized faculty and administrators."
        )
    return current_user

async def get_current_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted strictly to administrators."
        )
    return current_user

def require_faculty_permission(permission: str):
    async def permission_checker(
        current_user: Dict[str, Any] = Depends(get_current_user)
    ) -> Dict[str, Any]:
        if current_user.get("role") == "admin":
            return current_user
        
        user_permissions = current_user.get("permissions", [])
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not hold the required permission: '{permission}'."
            )
        return current_user
    return permission_checker
