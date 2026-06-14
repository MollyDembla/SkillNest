import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Auth
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";

// Courses
import CourseCatalogPage from "../pages/courses/CourseCatalogPage";
import CourseDetailPage from "../pages/courses/CourseDetailPage";
import SearchResultsPage from "../pages/courses/SearchResultsPage";
import CategoryPage from "../pages/courses/CategoryPage";

// Student
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import CartPage from "../pages/student/CartPage";
import WishlistPage from "../pages/student/WishlistPage";
import CheckoutPage from "../pages/student/CheckoutPage";
import CheckoutSuccessPage from "../pages/student/CheckoutSuccessPage";
import MyLearningPage from "../pages/student/MyLearningPage";
import LearningPlayerPage from "../pages/student/LearningPlayerPage";
import StudentProfilePage from "../pages/student/StudentProfilePage";
import CertificatePage from "../pages/student/CertificatePage";

// Instructor
import InstructorDashboardPage from "../pages/instructor/InstructorDashboardPage";
import CourseManagePage from "../pages/instructor/CourseManagePage";
import CourseCreatePage from "../pages/instructor/CourseCreatePage";
import CourseEditPage from "../pages/instructor/CourseEditPage";
import InstructorAnalyticsPage from "../pages/instructor/InstructorAnalyticsPage";
import InstructorProfilePage from "../pages/instructor/InstructorProfilePage";

// Admin
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminCourseManagePage from "../pages/admin/AdminCourseManagePage";
import AdminUserManagePage from "../pages/admin/AdminUserManagePage";
import CourseApprovalPage from "../pages/admin/CourseApprovalPage";
import PlatformAnalyticsPage from "../pages/admin/PlatformAnalyticsPage";

// Shared
import MessagesPage from "../pages/chat/MessagesPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import HomePage from "../pages/HomePage";
import InstructorChatPage from "../pages/instructor/InstructorChatPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";

function HomeRedirect() {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  if (!user) return <HomePage />;
  if (user.role === "student") return <Navigate to="/dashboard" replace />;
  if (user.role === "instructor") return <Navigate to="/instructor/dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/courses" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      {/* Auth */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Public course routes */}
      <Route path="/courses" element={<CourseCatalogPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/category/:category" element={<CategoryPage />} />

      {/* Protected student routes */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/dashboard" element={<StudentDashboardPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/my-learning" element={<MyLearningPage />} />
        <Route path="/learn/:courseId" element={<LearningPlayerPage />} />
        <Route path="/profile" element={<StudentProfilePage />} />
        <Route path="/certificate/:courseId" element={<CertificatePage />} />
      </Route>

      {/* Protected instructor routes */}
      <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
        <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
        <Route path="/instructor/courses" element={<CourseManagePage />} />
        <Route path="/instructor/courses/create" element={<CourseCreatePage />} />
        <Route path="/instructor/courses/:courseId/edit" element={<CourseEditPage />} />
        <Route path="/instructor/analytics" element={<InstructorAnalyticsPage />} />
        <Route path="/instructor/profile" element={<InstructorProfilePage />} />
        <Route path="/instructor/messages" element={<InstructorChatPage />} />
      </Route>

      {/* Any authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/courses" element={<AdminCourseManagePage />} />
        <Route path="/admin/approvals" element={<CourseApprovalPage />} />
        <Route path="/admin/users" element={<AdminUserManagePage />} />
        <Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
