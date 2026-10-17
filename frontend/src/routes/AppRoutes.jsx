import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../components/common/Layout/MainLayout";
import DashboardLayout from "../components/common/Layout/DashboardLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Public Pages
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import CompaniesList from "../pages/Companies/CompaniesList";
import JobsList from "../pages/Jobs/JobsList";
import JobDetails from "../pages/Jobs/JobDetails";
import JobForm from "../pages/Jobs/JobForm";

// Candidate Pages
import CandidateDashboard from "../pages/Candidate/CandidateDashboard";
import CandidateProfile from "../pages/Candidate/CandidateProfile";
import MyApplications from "../pages/Candidate/MyApplications";
import SavedJobs from "../pages/Candidate/SavedJobs";
import InvitationsList from "../pages/Candidate/InvitationsList";

// Recruiter Pages
import RecruiterDashboard from "../pages/Recruiter/RecruiterDashboard";
import RecruiterProfile from "../pages/Recruiter/RecruiterProfile";
import ManageJobs from "../pages/Recruiter/ManageJobs";
import ApplicationsReview from "../pages/Recruiter/ApplicationsReview";
import CandidateSearch from "../pages/Recruiter/CandidateSearch";

// Employer Pages
import EmployerDashboard from "../pages/Employer/EmployerDashboard";
import EmployerProfile from "../pages/Employer/EmployerProfile";

// Errors
import Unauthorized from "../pages/Unauthorized/Unauthorized";
import NotFound from "../pages/Unauthorized/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/companies" element={<CompaniesList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Candidate Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard/candidate" element={<CandidateDashboard />} />
        <Route path="/profile/candidate" element={<CandidateProfile />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
        <Route path="/invitations" element={<InvitationsList />} />
      </Route>

      {/* Recruiter Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
        <Route path="/profile/recruiter" element={<RecruiterProfile />} />
        <Route path="/dashboard/recruiter/jobs" element={<ManageJobs />} />
        <Route path="/dashboard/recruiter/applications" element={<ApplicationsReview />} />
      </Route>

      {/* Employer Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["employer"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard/employer" element={<EmployerDashboard />} />
        <Route path="/profile/employer" element={<EmployerProfile />} />
        <Route path="/dashboard/employer/jobs" element={<ManageJobs />} />
        <Route path="/dashboard/employer/applications" element={<ApplicationsReview />} />
      </Route>

      {/* Shared Recruiter & Employer Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["recruiter", "employer"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/candidates" element={<CandidateSearch />} />
        <Route path="/jobs/create" element={<JobForm />} />
        <Route path="/jobs/edit/:id" element={<JobForm />} />
      </Route>

      {/* 404 Catch-All */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

