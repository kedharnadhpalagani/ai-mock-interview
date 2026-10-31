# AI MOCK INTERVIEW — VIGNAN'S UNIVERSITY
### Production-Grade Full-Stack AI Technical Mock Interview & Placement Readiness Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_TypeScript-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248.svg?style=flat&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Google Gemini Live](https://img.shields.io/badge/AI_Engine-Google_Gemini_Live_2.0-8E75C2.svg?style=flat&logo=google)](https://aistudio.google.com)
[![Resend](https://img.shields.io/badge/Email_Delivery-Resend_OTP-000000.svg?style=flat&logo=resend)](https://resend.com)
[![Tailwind CSS](https://img.shields.io/badge/Theme-Vignan_Quantum_Aurora-8B5CF6.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com)

---

## 1. Project Overview

**AI MOCK INTERVIEW — VIGNAN'S UNIVERSITY** is an enterprise-grade, secure, production-ready web application engineered for Vignan's Foundation for Science, Technology & Research. The platform equips students with conversational, voice-based AI technical mock interviews powered by the **Google Gemini Live API**, accompanied by automated client-side proctoring, multi-category weighted evaluations, actionable analytics, and downloadable official PDF performance reports.

### Architecture Highlights
- **Vignan Quantum Aurora Theme**: Premium glassmorphic interface styled with the signature palette (#10102B Midnight Indigo, #8B5CF6 Electric Violet, #22D3EE Aurora Cyan, #FF6B8A Neon Coral, #F5F7FF Soft Pearl).
- **Official Vignan University Logo**: Exact official insignia integrated beside "Vignan's University" in the header navigation and on official PDF assessment certificates.
- **Strict Student Approval Workflow**: Verified students are initially set to `pending_approval` upon email OTP verification. Access to interviews is restricted until reviewed and approved by Faculty or Administration.
- **Real-Time Voice Turn Taking**: Bi-directional audio dialogue using WebSockets and the Google Gemini Live API.
- **Client-Side Proctoring & 4-Step Warning System**: Monitored locally for camera integrity and presence, triggering progressive warnings and automated violation session termination on a 4th confirmed infraction.
- **Evidence-Based Evaluation**: Deterministic and LLM-driven structured evaluation across 5 configurable dimensions (Technical 40%, Project 25%, Communication 15%, Problem Solving 10%, Soft Skills 10%).

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Web Audio API, Web Speech API |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Motor (Async MongoDB), PyMongo, Argon2id (`argon2-cffi`), PyJWT, ReportLab, WebSockets |
| **Database** | MongoDB Atlas (Production-ready replica set with compound & TTL indexes) |
| **AI Engine** | Google Gemini Live API (`google-genai` SDK / Gemini 2.0 Flash) |
| **Email Service** | Resend (Transactional 6-digit registration OTPs and password reset) |
| **Deployment** | Vercel (Frontend SPA) + Render (Backend Web Service) + GitHub |

---

## 3. Project Structure

```text
ai-mock-interview/
├── frontend/                          # React + TypeScript + Vite Client
│   ├── public/
│   │   └── assets/
│   │       └── vignan-logo.png        # Official Vignan University Logo
│   ├── src/
│   │   ├── components/                # Shared Aurora & UI Components
│   │   │   ├── Navbar.tsx             # Responsive header with Vignan logo + text
│   │   │   ├── Footer.tsx             # University branding & discrete admin access
│   │   │   ├── QuantumAuroraBackground.tsx # Glowing radial mesh backdrop
│   │   │   ├── AIInterviewerAvatar.tsx# Animated vocal state avatar
│   │   │   ├── AudioWaveform.tsx      # Real-time microphone level visualizer
│   │   │   ├── ProctoringMonitor.tsx  # Webcam local face presence monitor
│   │   │   └── ProtectedRoute.tsx     # Role & account status guard
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Session state & token management
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # Hero, features, evaluation preview, CTAs
│   │   │   ├── auth/                  # Registration, Login, OTP, Reset, Status
│   │   │   ├── student/               # Profile, Dashboard, Setup, Room, Results
│   │   │   ├── faculty/               # Faculty Directory, Analytics, Approvals
│   │   │   └── admin/                 # Control center, Faculty, Weights, Audit
│   │   ├── services/
│   │   │   └── api.ts                 # Axios API client with interceptors
│   │   ├── types/
│   │   │   └── index.ts               # Shared TypeScript interfaces
│   │   ├── App.tsx                    # Route definitions
│   │   ├── main.tsx                   # React root entry
│   │   └── index.css                  # Aurora Glassmorphism styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── vercel.json                    # SPA rewrite configuration for Vercel
│   └── .env.example
├── backend/                           # FastAPI Python Backend
│   ├── app/
│   │   ├── config.py                  # Pydantic BaseSettings environment loader
│   │   ├── database.py                # Motor MongoDB connection & index initializer
│   │   ├── security.py                # Argon2id hashing & PyJWT token utilities
│   │   ├── deps.py                    # RBAC dependencies & session status checkers
│   │   ├── schemas/                   # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── auth_service.py        # Authentication & registration logic
│   │   │   ├── otp_service.py         # Resend OTP delivery & attempt limits
│   │   │   ├── approval_service.py    # Approval workflow & decision handler
│   │   │   ├── interview_service.py   # Question pool generator (10 skills + projects)
│   │   │   ├── ai_voice_service.py    # Gemini Live real-time voice interface
│   │   │   ├── evaluation_service.py  # Evidence-based structured evaluator
│   │   │   ├── pdf_service.py         # ReportLab official PDF report generator
│   │   │   └── audit_service.py       # Security-compliant audit trail logger
│   │   ├── routes/                    # Versioned REST & WebSocket routers
│   │   └── main.py                    # FastAPI application & admin bootstrap
│   ├── tests/                         # Automated pytest test suites
│   ├── requirements.txt
│   └── .env.example
├── render.yaml                        # Infrastructure-as-code for Render deployment
├── .gitignore
└── README.md                          # Comprehensive documentation
```

---

## 4. Local Development Quickstart

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- **Python** 3.10+ (Python 3.11 recommended)
- A free **MongoDB Atlas** account (or local MongoDB daemon)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your local environment file
copy .env.example .env     # On Windows
cp .env.example .env       # On Linux/macOS

# Run the FastAPI server with auto-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API and interactive documentation will be accessible at:
- **API Root**: `http://localhost:8000/api/v1`
- **Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Create your frontend environment file
copy .env.example .env     # On Windows
cp .env.example .env       # On Linux/macOS

# Start Vite development server
npm run dev
```
The frontend UI will be live at `http://localhost:3000`.

---

## 5. Automated Testing

The backend includes a comprehensive automated test suite covering authentication, Argon2id hashing, OTP rate-limiting, approval status rules, interview generation, evaluation criteria, PDF generation, and resilience against missing external credentials.

To run the tests:
```bash
# From the repository root
set PYTHONPATH=backend
backend\.venv\Scripts\python -m pytest backend/tests -v
```

All 12 test suites run completely offline using an in-memory database mock and execute in ~1.3 seconds.

---

## 6. Environment Variables Guide

### Backend (`backend/.env` & Render Dashboard)
| Variable | Required in Prod | Description |
|---|---|---|
| `MONGODB_URI` | **Yes** | Connection URI for MongoDB Atlas cluster. |
| `MONGODB_DATABASE` | **Yes** | Database name (e.g. `vignan_ai_interview_db`). |
| `JWT_SECRET` | **Yes** | High-entropy secret key for signing access tokens. |
| `RESEND_API_KEY` | **Yes** | API key from Resend dashboard for email OTP delivery. |
| `EMAIL_FROM` | **Yes** | Sender email address (e.g. `Vignan Placement <onboarding@resend.dev>`). |
| `AI_PROVIDER_API_KEY` | **Yes** | Google Gemini API Key from Google AI Studio. |
| `AI_MODEL` | No | Target model (default: `gemini-2.0-flash`). |
| `ADMIN_USERNAME` | **Yes** | User ID for initial administrator bootstrap on Render. |
| `ADMIN_INITIAL_PASSWORD` | **Yes** | Initial password for administrator account (hashed with Argon2id). |
| `FRONTEND_ORIGIN` | **Yes** | Comma-separated allowed frontend origins for CORS. |

### Frontend (`frontend/.env` & Vercel Dashboard)
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of deployed backend (e.g. `https://vignan-backend.onrender.com/api/v1`). |

---

## 7. Step-by-Step External Services Setup

### A. MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. Create a free shared cluster (M0 sandbox).
3. Under **Security → Database Access**, create a database user (e.g. `vignan_db_user`) with read/write privileges.
4. Under **Security → Network Access**, add IP Address `0.0.0.0/0` (Allow access from anywhere) so that Render can connect.
5. In **Database → Connect → Drivers**, copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add this string as `MONGODB_URI` in Render.

### B. Resend Email Service
1. Create a free account at [Resend](https://resend.com).
2. Generate an API Key under **API Keys** (starts with `re_...`).
3. For immediate testing, you can use the default domain:
   - `EMAIL_FROM=Vignan Mock Interview <onboarding@resend.dev>`
   - Resend delivers emails to your registered account email address.
4. For production university domains:
   - Add your institutional domain (e.g. `vignan.ac.in`) in **Domains**.
   - Add the specified DNS records (DKIM, SPF) to your domain registrar.
5. Set `RESEND_API_KEY` in Render.

### C. Google Gemini Live API
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create an API Key.
3. Configure `AI_PROVIDER_API_KEY` in Render with the generated key.
4. Model defaults to `gemini-2.0-flash`, which natively supports real-time multimodal reasoning and low-latency audio response turns.

---

## 8. Production Deployment Guide

### Deployment A: Backend Web Service on Render

1. Push your repository to **GitHub**.
2. Log in to [Render](https://render.com).
3. Click **New + → Web Service** and select your GitHub repository.
4. Choose the repository root, and select **Use render.yaml** (or manually configure):
   - **Name**: `vignan-ai-mock-interview-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend`
   - **Health Check Path**: `/health`
5. **CRITICAL REQUIREMENT — PROVIDE ADMIN CREDENTIALS**:
   In the Render dashboard, navigate to **Environment → Add Environment Variable** and enter:
   - `ADMIN_USERNAME`: Your chosen admin user ID
   - `ADMIN_INITIAL_PASSWORD`: Your chosen strong admin password
   - `MONGODB_URI`: Your Atlas connection string
   - `JWT_SECRET`: Random 32+ character string
   - `RESEND_API_KEY`: Your Resend API key
   - `EMAIL_FROM`: `Vignan Mock Interview <onboarding@resend.dev>`
   - `AI_PROVIDER_API_KEY`: Your Google Gemini API key
   - `FRONTEND_ORIGIN`: `https://your-frontend-app.vercel.app`
6. Click **Create Web Service**. On first startup, the backend automatically seeds your administrator account without overwriting on subsequent restarts.
7. Note down your Render backend URL (e.g. `https://vignan-backend.onrender.com`).

---

### Deployment B: Frontend Web Application on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New… → Project** and import your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and choose `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-service.onrender.com/api/v1` (Replace with your actual Render URL).
5. Click **Deploy**. Vercel will compile the TypeScript application, apply SPA rewrites via `vercel.json`, and deploy to a global CDN.
6. Once deployed, copy your Vercel URL and ensure it is listed in the `FRONTEND_ORIGIN` variable in Render.

---

## 9. Security & Governance Matrix

| Feature | Implementation Details |
|---|---|
| **Password Security** | Argon2id hashing with memory cost 64 MB, time cost 3, parallelism 4. Plaintext passwords are never stored or logged. |
| **Account Approval Workflow** | All newly registered students are created with `account_status = "pending_approval"`. Access to interview sessions is strictly barred until approval. |
| **Delegated Faculty Rights** | Faculty members can only review/approve student applications if explicitly granted the `student_approval` permission by an Administrator. |
| **Strict Identity Lock** | University registration numbers are verified upon email OTP verification and locked against student alteration. |
| **Integrity Proctoring** | Camera analysis monitors face presence; successive violations trigger warnings (1 to 3) and terminate on the 4th violation. |
| **Audit Trail** | All administrative actions, approvals, rejections, suspensions, and data exports are logged with timestamp and actor ID. Sensitive credentials are sanitized. |

---

## 10. Troubleshooting

- **Student cannot start interview**: Check that their account status is `active` (not `pending_approval` or `rejected`) and their profile has been completed.
- **Microphone / Camera not connecting**: Ensure browser permissions for camera and microphone are granted. Note that mock interviews require a desktop/laptop browser.
- **OTP email not arriving**: Check server logs. In local development without a `RESEND_API_KEY`, the 6-digit OTP code is logged directly to the server terminal. In production, ensure `RESEND_API_KEY` is set and valid in Render.
- **CORS error in browser console**: Verify that the deployed Vercel URL is added to the `FRONTEND_ORIGIN` environment variable in Render.

---

## 11. University Identity & Trademarks

- **Institution**: Vignan's Foundation for Science, Technology & Research (Deemed to be University)
- **Campus**: Vadlamudi, Guntur, Andhra Pradesh, India — 522213
- **Official Asset**: The official Vignan University insignia is embedded in `frontend/public/assets/vignan-logo.png` and included on all generated PDF certificates.
