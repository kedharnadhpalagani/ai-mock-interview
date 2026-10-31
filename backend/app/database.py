import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, IndexModel
from app.config import settings

logger = logging.getLogger("uvicorn.error")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def get_database() -> AsyncIOMotorDatabase:
    return db_instance.db

async def connect_to_mongo():
    logger.info("Connecting to MongoDB Atlas...")
    try:
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        db_instance.db = db_instance.client[settings.MONGODB_DATABASE]
        logger.info(f"MongoDB connection initialized to database: {settings.MONGODB_DATABASE}")
        
        # Initialize collections and indexes in the background
        await init_db_indexes(db_instance.db)
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        # Allow server to start, endpoints will handle DB connectivity gracefully
        pass

async def close_mongo_connection():
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

async def init_db_indexes(db: AsyncIOMotorDatabase):
    try:
        # Students indexes
        students = db["students"]
        await students.create_index([("email", ASCENDING)], unique=True)
        await students.create_index([("registration_number", ASCENDING)], unique=True)
        await students.create_index([("account_status", ASCENDING)])
        await students.create_index([("registered_at", ASCENDING)])

        # Faculty indexes
        faculty = db["faculty"]
        await faculty.create_index([("faculty_id", ASCENDING)], unique=True)
        await faculty.create_index([("email", ASCENDING)], unique=True)
        await faculty.create_index([("account_status", ASCENDING)])

        # Admin indexes
        admins = db["admins"]
        await admins.create_index([("username", ASCENDING)], unique=True)

        # OTP verifications TTL index
        otps = db["otp_verifications"]
        await otps.create_index([("email", ASCENDING), ("purpose", ASCENDING)])
        await otps.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)

        # Interviews index
        interviews = db["interviews"]
        await interviews.create_index([("interview_id", ASCENDING)], unique=True)
        await interviews.create_index([("student_id", ASCENDING)])
        await interviews.create_index([("status", ASCENDING)])
        await interviews.create_index([("created_at", ASCENDING)])

        # Interview results index
        results = db["interview_results"]
        await results.create_index([("interview_id", ASCENDING)], unique=True)
        await results.create_index([("student_id", ASCENDING)])
        await results.create_index([("overall_score", ASCENDING)])
        await results.create_index([("created_at", ASCENDING)])

        # Audit logs index
        audit = db["audit_logs"]
        await audit.create_index([("timestamp", ASCENDING)])
        await audit.create_index([("actor_id", ASCENDING)])
        await audit.create_index([("action", ASCENDING)])

        # System settings index
        settings_col = db["system_settings"]
        await settings_col.create_index([("key", ASCENDING)], unique=True)

        # Ensure default evaluation weights exist
        default_weights = await settings_col.find_one({"key": "evaluation_weights"})
        if not default_weights:
            await settings_col.insert_one({
                "key": "evaluation_weights",
                "weights": {
                    "technical_knowledge": 40,
                    "project_understanding": 25,
                    "communication": 15,
                    "problem_solving": 10,
                    "behavioral_and_soft_skills": 10
                },
                "total": 100
            })

        logger.info("MongoDB collections and indexes initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not initialize MongoDB indexes (will retry on active queries): {str(e)}")
