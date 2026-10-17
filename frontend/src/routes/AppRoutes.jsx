import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../components/common/Layout/MainLayout";
import DashboardLayout from "../components/common/Layout/DashboardLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Pages
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import CompaniesList from "../pages/Companies/CompaniesList";

// Candidate Pages
import CandidateDashboard from "../pages/Candidate/CandidateDashboard";
import CandidateProfile from "../pages/Candidate/CandidateProfile";

// Recruiter Pages
import RecruiterDashboard from "../pages/Recruiter/RecruiterDashboard";
import RecruiterProfile from "../pages/Recruiter/RecruiterProfile";

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
      </Route>

      {/* 404 Catch-All */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
