import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../shared/layout/DashboardLayout";
import ProjectLayout from "../shared/layout/ProjectLayout";
import LoginPage from "./pages/auth/login/page";
import RegisterPage from "./pages/auth/register/page";
import VerifyEmailPage from "./pages/auth/verify-email/page";
import ForgotPasswordPage from "./pages/auth/forgot-password/page";
import ResetPasswordPage from "./pages/auth/reset-password/page";
import AcceptInvitationPage from "./pages/auth/accept-invitation/page";
import RefuseInvitationPage from "./pages/auth/refuse-invitation/page";
import AdminUsersPage from "./pages/admin/users/page";
import AdminUserDetailsPage from "./pages/admin/users/[id]/page";
import AdminProjectsPage from "./pages/admin/projects/page";
import AdminDashboardPage from "./pages/admin/page";
import ProjectsPage from "./pages/projects/page";
import ProjectOverview from "./pages/projects/[id]/overview/page";
import ProjectBacklog from "./pages/projects/[id]/backlog/page";
import ProjectSprints from "./pages/projects/[id]/sprints/page";
import ActiveSprintPage from "./pages/projects/[id]/sprints/active/page";
import SprintPlanningPage from "./pages/projects/[id]/sprints/planning/page";
import SprintHistoryPage from "./pages/projects/[id]/sprints/history/page";
import SprintRetrospective from "./pages/projects/[id]/sprints/[sprintId]/retrospective/page";
import ProjectKanban from "./pages/projects/[id]/kanban/page";
import ProjectMembers from "./pages/projects/[id]/members/page";
import ProjectAnalytics from "./pages/projects/[id]/analytics/page";
import ProfilePage from "./pages/profile/page";


export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 🔓 PUBLIC ROUTES */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/accept-invitation" element={<AcceptInvitationPage />} />
        <Route path="/auth/refuse-invitation" element={<RefuseInvitationPage />} />
        
        {/* 🔐 PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/projects" element={<ProjectsPage />} />
            
            <Route element={<ProjectLayout />}>
              <Route path="/projects/:id" element={<ProjectOverview />} />
              <Route path="/projects/:id/backlog" element={<ProjectBacklog />} />
              <Route path="/projects/:id/sprints" element={<ProjectSprints />} />
              <Route path="/projects/:id/sprints/active" element={<ActiveSprintPage />} />
              <Route path="/projects/:id/sprints/planning" element={<SprintPlanningPage />} />
              <Route path="/projects/:id/sprints/history" element={<SprintHistoryPage />} />
              <Route path="/projects/:id/sprints/:sprintId/retrospective" element={<SprintRetrospective />} />
              <Route path="/projects/:id/kanban" element={<ProjectKanban />} />
              <Route path="/projects/:id/members" element={<ProjectMembers />} />
              <Route path="/projects/:id/analytics" element={<ProjectAnalytics />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />

            {/* 🛡️ ADMIN ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />
              <Route path="/admin/projects" element={<AdminProjectsPage />} />
            </Route>
            
          </Route>
        </Route>

        

        <Route path="/" element={<Navigate to="/projects" replace />} />
        
      </Routes>
    </Router>
  );
};

export default AppRouter;
