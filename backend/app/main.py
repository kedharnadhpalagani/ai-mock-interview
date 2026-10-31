import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.security import hash_password
from app.routes import (
    auth,
    student,
    approvals,
    faculty,
    admin,
    interviews,
    analytics,
    reports
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

async def bootstrap_initial_admin():
    """
    Bootstrap initial administrator account using environment variables supplied on Render.
    Ensures idempotency: does not recreate or overwrite existing passwords on restart.
    """
    if not settings.ADMIN_USERNAME or not settings.ADMIN_INITIAL_PASSWORD:
        logger.warning(
            "===> NOTE: ADMIN_USERNAME or ADMIN_INITIAL_PASSWORD not set in environment. "
            "Please configure these on Render for production admin access. <==="
        )
        return

    db = await get_database()
    if db is None:
        logger.error("Cannot bootstrap admin: Database connection is not available.")
        return

    username = settings.ADMIN_USERNAME.strip()
    existing_admin = await db["admins"].find_one({"username": username})
    if existing_admin:
        logger.info(f"Administrator account '{username}' already exists. Skipping bootstrap.")
        return

    now = datetime.now(timezone.utc)
    admin_id = str(uuid.uuid4())
    admin_doc = {
        "_id": admin_id,
        "id": admin_id,
        "username": username,
        "email": f"{username}@vignan.ac.in",
        "name": "Super Administrator",
        "password_hash": hash_password(settings.ADMIN_INITIAL_PASSWORD),
        "role": "admin",
        "account_status": "active",
        "permissions": ["all", "student_approval", "manage_faculty", "manage_settings"],
        "created_at": now,
        "updated_at": now
    }

    await db["admins"].insert_one(admin_doc)
    logger.info(f"Initial administrator account '{username}' successfully bootstrapped.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("Initializing AI Mock Interview backend service...")
    await connect_to_mongo()
    await bootstrap_initial_admin()
    yield
    # Shutdown sequence
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS for production Vercel and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under versioned /api/v1 prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(student.router, prefix=settings.API_V1_STR)
app.include_router(approvals.router, prefix=settings.API_V1_STR)
app.include_router(faculty.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(interviews.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "service": "AI MOCK INTERVIEW — VIGNAN'S UNIVERSITY API",
        "status": "online",
        "version": "1.0.0",
        "api_docs": "/docs"
    }

@app.get("/health")
async def health_check():
    db = await get_database()
    db_connected = False
    if db is not None:
        try:
            await db.command("ping")
            db_connected = True
        except Exception:
            db_connected = False

    return {
        "status": "healthy" if db_connected else "degraded",
        "database_connected": db_connected,
        "resend_configured": bool(settings.RESEND_API_KEY),
        "ai_provider_configured": bool(settings.AI_PROVIDER_API_KEY),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
