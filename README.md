# TalentForge — Modern Full-Stack Job Portal (Stage 1)

TalentForge is a full-stack, enterprise-grade job recruitment platform built with **React (Vite)**, **Node.js (Express)**, and **MongoDB (Mongoose)**, following the **Universal AI Agent Development Guidelines**.

---

## 🚀 Stage 1 Implementation Overview

Stage 1 establishes the complete foundation, architecture, multi-role authentication, user account hierarchies, and profile management systems:

- **Multi-Role User Authentication**: Support for **Candidate**, **Recruiter**, and **Employer** accounts.
- **Security & Authorization**: JWT authentication with Access Tokens (short-lived) and Refresh Tokens (7-day rotation), bcryptjs password hashing, HTTP-only cookie support, and backend role-based access control (RBAC).
- **Candidate Profile Management**: Full professional profile builder supporting education history, work experience, project showcases, skills tagging, resume upload (PDF/DOC/DOCX), summary, preferences, and completion metrics.
- **Recruiter Profile Management**: Professional identity, job title, department, professional bio, LinkedIn profile, and dynamic association with platform-registered companies or custom agencies.
- **Employer Company Management**: Organization branding, logo upload, industry sector, company size, website, headquarters location, company description, and social media handles.
- **Modern UI/UX**: Premium light theme with subtle neutral backgrounds, curated indigo/blue accents, Lucide React icons, CSS Modules, loading skeletons, and responsive layouts for mobile, tablet, and desktop.
- **Role-Specific Dashboard Shells**: Tailored workspace navigation shells for Candidates, Recruiters, and Employers with quick actions and Stage 2 feature teasers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM, Axios, Lucide React |
| **Styling** | Vanilla CSS Tokens (`index.css`) & CSS Modules (`*.module.css`) |
| **Backend** | Node.js (v24), Express.js (v5), Morgan, Cookie Parser, Multer |
| **Database** | MongoDB with Mongoose ODM (Indexes, text search, schemas) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Bcrypt (`bcryptjs`) |
| **Code Quality** | Oxlint (0 warnings, 0 errors), Vite Production Bundle (built in <1s) |

---

## 📂 Project Architecture & Folder Organization

```text
Job-Portal/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── common/
│   │   │       ├── Footer/
│   │   │       │   ├── Footer.jsx
│   │   │       │   └── Footer.module.css
│   │   │       ├── Layout/
│   │   │       │   ├── DashboardLayout.jsx
│   │   │       │   ├── DashboardLayout.module.css
│   │   │       │   └── MainLayout.jsx
│   │   │       └── Navbar/
│   │   │           ├── Navbar.jsx
│   │   │           └── Navbar.module.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Auth.module.css
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Candidate/
│   │   │   │   ├── Candidate.module.css
│   │   │   │   ├── CandidateDashboard.jsx
│   │   │   │   └── CandidateProfile.jsx
│   │   │   ├── Companies/
│   │   │   │   └── CompaniesList.jsx
│   │   │   ├── Employer/
│   │   │   │   ├── Employer.module.css
│   │   │   │   ├── EmployerDashboard.jsx
│   │   │   │   └── EmployerProfile.jsx
│   │   │   ├── Landing/
│   │   │   │   ├── Landing.jsx
│   │   │   │   └── Landing.module.css
│   │   │   ├── Recruiter/
│   │   │   │   ├── Recruiter.module.css
│   │   │   │   ├── RecruiterDashboard.jsx
│   │   │   │   └── RecruiterProfile.jsx
│   │   │   └── Unauthorized/
│   │   │       ├── ErrorPage.module.css
│   │   │       ├── NotFound.jsx
│   │   │       └── Unauthorized.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── multer.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── auth.model.js
│   │   │   └── auth.routes.js
│   │   ├── candidates/
│   │   │   ├── candidate.controller.js
│   │   │   ├── candidate.model.js
│   │   │   └── candidate.routes.js
│   │   ├── companies/
│   │   │   ├── company.controller.js
│   │   │   ├── company.model.js
│   │   │   └── company.routes.js
│   │   ├── recruiters/
│   │   │   ├── recruiter.controller.js
│   │   │   ├── recruiter.model.js
│   │   │   └── recruiter.routes.js
│   │   └── index.js
│   ├── uploads/
│   │   ├── images/
│   │   └── resumes/
│   ├── .env
│   ├── .env.example
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── test_api_stage1.js
│
├── .gitignore
└── README.md
```

---

## 📡 Standard API Specification

All backend responses conform to the mandatory format:

```json
{
  "success": true,
  "message": "Human-readable summary",
  "data": { ... },
  "error": null
}
```

### Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /register`: Register user as `candidate`, `recruiter`, or `employer`.
- `POST /login`: Authenticate and receive `accessToken` and `refreshToken`.
- `POST /refresh-token`: Rotate expired access token using refresh token.
- `POST /logout`: Invalidate session and revoke refresh token.
- `GET /me`: Retrieve authenticated user account and linked profile.
- `PUT /account`: Update core account details (name, phone, avatar).

#### Candidate Profiles (`/api/v1/candidates`)
- `GET /me`: Retrieve candidate profile (`candidate` role only).
- `PUT /me`: Update headline, skills, education, experience, projects, summary, preferences (`candidate` only).
- `POST /me/resume`: Upload resume file (PDF/DOC/DOCX up to 10MB).
- `DELETE /me/resume`: Remove uploaded resume.
- `POST /me/photo`: Upload profile avatar image.
- `GET /:id`: View candidate profile details (authenticated).

#### Recruiter Profiles (`/api/v1/recruiters`)
- `GET /me`: Retrieve recruiter profile (`recruiter` role only).
- `PUT /me`: Update job title, department, company affiliation, bio, LinkedIn (`recruiter` only).
- `POST /me/photo`: Upload recruiter photo.
- `GET /:id`: View recruiter details (authenticated).

#### Employer & Company (`/api/v1/companies`)
- `GET /my`: Retrieve employer company profile (`employer` role only).
- `PUT /my`: Update company branding, industry, size, website, location, description (`employer` only).
- `POST /my/logo`: Upload company logo.
- `GET /`: List registered companies with search and pagination (public).
- `GET /:id`: View company profile by ID (public).

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/job_portal_db
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 🏃 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017 or a MongoDB Atlas URI

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` with configured API proxy to backend.

### 3. Run Automated Tests
```bash
cd backend
node test_api_stage1.js
```
Runs the 19 integration tests covering registration, login, token refresh, RBAC 403 enforcement, profile CRUD, and logout.

### 4. Build and Lint Frontend
```bash
cd frontend
npm run lint
npm run build
```

---

## 🧪 Stage 1 Verification Results

- **Automated Integration Tests**: **19 / 19 PASSED (0 FAILED)**
  - Input validation & required field checks: PASSED
  - Multi-role registration & login: PASSED
  - Token refresh & logout revocation: PASSED
  - Role-based authorization enforcement (403): PASSED
  - Candidate, Recruiter, and Employer profile updates: PASSED
  - Company directory search: PASSED
- **Frontend Code Quality**:
  - `npm run lint`: 0 warnings, 0 errors.
  - `npm run build`: Production bundle generated cleanly in <1s.
- **Proxy & Connectivity**:
  - Tested Vite proxy from frontend `http://localhost:5173/api/v1/health` to backend `http://localhost:5000`: Verified HTTP 200 with standard API response.

---

## 🔮 Stage 2 Roadmap (Future Scope)

The Stage 1 architecture is indexed and ready for Stage 2 features:
1. **Job Management**: Job posting creation, editing, closing, and status management for recruiters and employers.
2. **Advanced Candidate Search**: Filtering candidates by indexed skills, locations, and experience.
3. **Application Lifecycle**: Candidates applying to jobs with uploaded resumes; recruiters tracking application stages (Review, Shortlist, Interview, Offer, Rejected).
4. **Notifications & Messaging**: Real-time alerts for application status updates.
