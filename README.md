# TalentForge — Modern Full-Stack Job Portal (Stage 1 & Stage 2)

TalentForge is a production-ready, enterprise-grade job recruitment platform built with **React (Vite)**, **Node.js (Express)**, and **MongoDB (Mongoose)**, following the **Universal AI Agent Development Guidelines**.

---

## 🚀 Overview of Implemented Stages

### Stage 1: Foundation, RBAC Authentication & Profile Management
- **Multi-Role User Authentication**: Support for **Candidate**, **Recruiter**, and **Employer** accounts with registration and login.
- **Security & Authorization**: JWT authentication with Access Tokens (short-lived) and Refresh Tokens (7-day rotation), bcryptjs password hashing, HTTP-only cookie support, and backend role-based access control (RBAC).
- **Candidate Profile Management**: Full professional profile builder supporting education history, work experience, project showcases, skills tagging, resume upload (PDF/DOC/DOCX), summary, preferences, and completion metrics.
- **Recruiter Profile Management**: Professional identity, job title, department, professional bio, LinkedIn profile, and association with platform-registered companies or custom agencies.
- **Employer Company Management**: Organization branding, logo upload, industry sector, company size, website, headquarters location, company description, and social media handles.
- **Modern UI/UX**: Premium light theme with subtle neutral backgrounds, curated indigo/blue accents, Lucide React icons, CSS Modules, loading skeletons, and responsive layouts for mobile, tablet, and desktop.
- **Role-Specific Dashboard Shells**: Tailored workspace navigation shells for Candidates, Recruiters, and Employers.

### Stage 2: Job Management, Search, Applications, Discovery & Invitations
- **Job Management**:
  - Full schema support: Job Title, Company, Description, Responsibilities, Required Qualifications, Required Skills, Experience Range (`min`-`max`), Employment Type (`full-time`, `part-time`, `contract`, `internship`), Workplace Type (`onsite`, `remote`, `hybrid`), Salary Range (`min`-`max`, currency, periodicity), Location, Vacancies, Application Deadline, Required Education, and Status (`draft`, `published`, `closed`).
  - Recruiters and Employers can create, edit, publish, close, and manage their company job postings.
  - Ownership & RBAC verification ensures only authorized recruiters/employers can modify or close their company openings.
- **Candidate Job Search & Saved Jobs**:
  - Full-text and keyword search across title, company, description, and required skills.
  - Multi-faceted filtering by location, experience range, employment type, salary range, and workplace type.
  - Sorting options by posting date (newest/oldest) or salary.
  - Job bookmarking/saving (`/api/v1/saved-jobs`) allowing candidates to track opportunities from search or details pages.
- **Job Application System**:
  - Application submission with either profile resume or newly uploaded file (PDF/DOC/DOCX up to 10MB) and optional cover letter.
  - Compound database index (`candidateId` + `jobId`) prevents duplicate applications.
  - Candidate application history tracking with interactive timeline view and withdrawal capability.
  - Recruiter application screening dashboard: view applicants per job, filter by status, inspect candidate resumes, and manage application lifecycle across 8 validated statuses:
    - `Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Interview` ➔ `Offered` ➔ `Hired` ➔ `Rejected` (or `Withdrawn` by candidate).
    - Strict authorization ensures candidates cannot alter application statuses to recruiter-controlled states.
- **Recruiter Candidate Discovery**:
  - Candidate search interface allowing recruiters to find talent by skills, keywords, and location.
  - Privacy-preserving candidate cards displaying professional headline, experience summary, skills, and education.
  - Comprehensive candidate profile view modal with resume inspection permissions.
- **Recruiter Direct Invitations**:
  - Recruiters can invite suitable candidates directly to apply for active company job openings with personalized notes.
  - Candidates receive invitations on their dashboard and can **Accept** or **Decline**.
  - Accepting an invitation smoothly navigates the candidate directly to the job application interface without automatically submitting unintended applications.
  - Invitations can be cancelled by recruiters prior to response.
- **In-App Notifications**:
  - Database-backed notifications for key recruitment events: job application submitted, status transitions, invitations received, and invitation responses.
  - Unread badge counter, notification dropdown in the navigation bar, and one-click "Mark all as read" handling.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM, Axios, Lucide React |
| **Styling** | Vanilla CSS Design Tokens (`index.css`) & CSS Modules (`*.module.css`) |
| **Backend** | Node.js (v24), Express.js (v5), Morgan, Cookie Parser, Multer |
| **Database** | MongoDB with Mongoose ODM (Compound indexes, text search indexes, schema validations) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Bcrypt (`bcryptjs`) |
| **Code Quality** | Oxlint (0 errors), Vite Production Bundle (built cleanly in <1s) |

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
│   │   │           ├── Navbar.module.css
│   │   │           ├── NotificationDropdown.jsx
│   │   │           └── NotificationDropdown.module.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Candidate/
│   │   │   │   ├── CandidateDashboard.jsx
│   │   │   │   ├── CandidateProfile.jsx
│   │   │   │   ├── InvitationsList.jsx
│   │   │   │   ├── MyApplications.jsx
│   │   │   │   └── SavedJobs.jsx
│   │   │   ├── Companies/
│   │   │   │   └── CompaniesList.jsx
│   │   │   ├── Employer/
│   │   │   │   ├── EmployerDashboard.jsx
│   │   │   │   └── EmployerProfile.jsx
│   │   │   ├── Jobs/
│   │   │   │   ├── JobDetails.jsx
│   │   │   │   ├── JobForm.jsx
│   │   │   │   └── JobsList.jsx
│   │   │   ├── Landing/
│   │   │   │   └── Landing.jsx
│   │   │   ├── Recruiter/
│   │   │   │   ├── ApplicationsReview.jsx
│   │   │   │   ├── CandidateSearch.jsx
│   │   │   │   ├── ManageJobs.jsx
│   │   │   │   ├── RecruiterDashboard.jsx
│   │   │   │   └── RecruiterProfile.jsx
│   │   │   └── Unauthorized/
│   │   │       ├── NotFound.jsx
│   │   │       └── Unauthorized.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── multer.js
│   ├── modules/
│   │   ├── applications/
│   │   │   ├── application.controller.js
│   │   │   ├── application.model.js
│   │   │   └── application.routes.js
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
│   │   ├── invitations/
│   │   │   ├── invitation.controller.js
│   │   │   ├── invitation.model.js
│   │   │   └── invitation.routes.js
│   │   ├── jobs/
│   │   │   ├── job.controller.js
│   │   │   ├── job.model.js
│   │   │   └── job.routes.js
│   │   ├── notifications/
│   │   │   ├── notification.controller.js
│   │   │   ├── notification.model.js
│   │   │   └── notification.routes.js
│   │   ├── recruiters/
│   │   │   ├── recruiter.controller.js
│   │   │   ├── recruiter.model.js
│   │   │   └── recruiter.routes.js
│   │   ├── savedJobs/
│   │   │   ├── savedJob.controller.js
│   │   │   ├── savedJob.model.js
│   │   │   └── savedJob.routes.js
│   │   └── index.js
│   ├── uploads/
│   │   ├── images/
│   │   └── resumes/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── test_api_stage1.js
│   └── test_api_stage2.js
│
├── .gitignore
└── README.md
```

---

## 📡 Complete API Specification

All endpoints return a uniform JSON envelope:
```json
{
  "success": true,
  "message": "Human-readable summary",
  "data": { ... },
  "error": null
}
```

### 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/register` | Register user account | Public |
| `POST` | `/login` | Authenticate and obtain JWT access & refresh tokens | Public |
| `POST` | `/refresh-token` | Rotate expired access token | Public (valid refresh token) |
| `POST` | `/logout` | Revoke session and refresh token | Authenticated |
| `GET` | `/me` | Get active user identity and profile snapshot | Authenticated |
| `PUT` | `/account` | Update account profile details | Authenticated |

### 2. Jobs (`/api/v1/jobs`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Browse and filter published jobs with pagination & sorting | Public |
| `GET` | `/company/my` | View all jobs for authenticated recruiter/employer's company | Recruiter, Employer |
| `GET` | `/:id` | Get comprehensive details of a single job opening | Public |
| `POST` | `/` | Create a new job opening | Recruiter, Employer |
| `PUT` | `/:id` | Update job opening specifications | Recruiter, Employer (Owner) |
| `PATCH` | `/:id/status` | Change job opening status (`draft`, `published`, `closed`) | Recruiter, Employer (Owner) |
| `DELETE` | `/:id` | Delete job opening | Recruiter, Employer (Owner) |

### 3. Saved Jobs (`/api/v1/saved-jobs`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Retrieve candidate's saved/bookmarked jobs | Candidate |
| `POST` | `/:jobId` | Save/bookmark a job opening | Candidate |
| `DELETE` | `/:jobId` | Remove a job from saved list | Candidate |

### 4. Applications (`/api/v1/applications`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/` | Apply to a published job with profile resume or new upload | Candidate |
| `GET` | `/me` | View candidate's application history and status timeline | Candidate |
| `PATCH` | `/:id/withdraw` | Withdraw active application | Candidate (Applicant) |
| `GET` | `/job/:jobId` | List all candidate applications for a specific job | Recruiter, Employer (Company) |
| `GET` | `/recruiter/all` | List all applications across all company jobs | Recruiter, Employer (Company) |
| `GET` | `/:id` | View specific application record and applicant details | Recruiter, Employer, Candidate |
| `PATCH` | `/:id/status` | Transition application status (Review, Shortlist, Interview, Offer, Hire, Reject) | Recruiter, Employer (Company) |

### 5. Candidate Discovery (`/api/v1/candidates`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/search` | Search and filter candidate profiles by skills, keywords, location | Recruiter, Employer |
| `GET` | `/detail/:id` | View detailed candidate professional profile | Recruiter, Employer |
| `GET` | `/me` | Get authenticated candidate profile | Candidate |
| `PUT` | `/me` | Update candidate skills, experience, education, bio | Candidate |
| `POST` | `/me/resume` | Upload candidate resume | Candidate |
| `DELETE` | `/me/resume` | Delete candidate resume | Candidate |

### 6. Recruiter Direct Invitations (`/api/v1/invitations`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/` | Send job invitation with personal note to candidate | Recruiter, Employer |
| `GET` | `/sent` | View list of invitations sent by recruiter's company | Recruiter, Employer |
| `PATCH` | `/:id/cancel` | Cancel a pending invitation | Recruiter, Employer (Sender) |
| `GET` | `/me` | Candidate dashboard list of received invitations | Candidate |
| `PATCH` | `/:id/respond` | Candidate accepts or declines invitation | Candidate (Recipient) |

### 7. In-App Notifications (`/api/v1/notifications`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Retrieve paginated notifications for current user | Authenticated |
| `GET` | `/unread-count` | Retrieve badge counter of unread notifications | Authenticated |
| `PATCH` | `/:id/read` | Mark individual notification as read | Authenticated |
| `PATCH` | `/read-all` | Mark all notifications as read | Authenticated |
| `DELETE` | `/:id` | Delete notification | Authenticated |

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

## 🏃 Running the Application

### 1. Prerequisites
- **Node.js**: v18+ (Node v24 recommended)
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017/job_portal_db` or MongoDB Atlas URI

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🧪 Automated Test Verification

TalentForge features automated end-to-end integration test suites for both stages:

### Stage 1 Integration Suite:
```bash
cd backend
node test_api_stage1.js
```
- **Result**: **19 / 19 PASSED (0 FAILED)**
- Covers authentication, JWT issuance, token rotation, RBAC 403 enforcement, profile CRUD across Candidate/Recruiter/Employer, company directories, and session invalidation.

### Stage 2 Integration Suite:
```bash
cd backend
node test_api_stage2.js
```
- **Result**: **34 / 34 PASSED (0 FAILED)**
- Covers:
  1. Full job creation with schema properties by Recruiter/Employer.
  2. RBAC protection: Candidates strictly forbidden from creating jobs (403).
  3. Keyword search, faceted filtering, and single job retrieval.
  4. Saved jobs lifecycle: save, view list, and unsave.
  5. Application lifecycle: submission with cover letter, compound index duplicate prevention (400), application history.
  6. Recruiter screening: view job applicants, status transitions (`applied` ➔ `under_review` ➔ `shortlisted`), candidate RBAC protection.
  7. Recruiter candidate discovery & authorized profile viewing.
  8. Recruiter invitation workflow: send invitation, view sent, candidate view received, candidate accept invitation.
  9. In-app notifications: event creation, unread count query, mark-all-read handling.
  10. Job status lifecycle: transition to `closed` and back to `published`.

### Overall Test Suite Total:
**53 / 53 Automated Tests Passing (100% Success Rate)**

### Frontend Verification:
```bash
cd frontend
npm run lint    # Oxlint: 0 errors
npm run build   # Production bundle built in <1s
```
