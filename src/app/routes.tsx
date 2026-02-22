import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
const Login = lazy(() => import("./pages/Login"));
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const LecturerDetails = lazy(() => import("./pages/student/LecturerDetails"));
const BookClass = lazy(() => import("./pages/student/BookClass"));
const MyBookings = lazy(() => import("./pages/student/MyBookings"));
const LecturerDashboard = lazy(() => import("./pages/lecturer/Dashboard"));
const LecturerAvailability = lazy(() => import("./pages/lecturer/Availability"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/super-admin/Dashboard"));
const DeveloperDashboard = lazy(() => import("./pages/developer/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Register = lazy(() => import("./pages/Register"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ChatThread = lazy(() => import("./pages/chat/Thread"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const StudentBookingDetails = lazy(() => import("./pages/student/BookingDetails"));
const KYCReview = lazy(() => import("./pages/admin/KYCReview"));
const SupportInbox = lazy(() => import("./pages/admin/SupportInbox"));
const SupportNew = lazy(() => import("./pages/Support"));

const withSuspense = (Component: any) => (props: any) =>
  <Suspense fallback={null}><Component {...props} /></Suspense>;

export const router = createBrowserRouter([
  {
    path: "/",
    Component: withSuspense(Login),
  },
  {
    path: "/login",
    Component: withSuspense(Login),
  },
  {
    path: "/register",
    Component: withSuspense(Register),
  },
  {
    path: "/onboarding",
    Component: withSuspense(Onboarding),
  },
  {
    path: "/profile",
    Component: withSuspense(Onboarding),
  },
  {
    path: "/chat/:bookingId",
    Component: withSuspense(ChatThread),
  },
  {
    path: "/admin/analytics",
    Component: withSuspense(AdminAnalytics),
  },
  {
    path: "/student/booking/:id",
    Component: withSuspense(StudentBookingDetails),
  },
  {
    path: "/admin/kyc",
    Component: withSuspense(KYCReview),
  },
  {
    path: "/admin/support",
    Component: withSuspense(SupportInbox),
  },
  {
    path: "/support",
    Component: withSuspense(SupportNew),
  },
  {
    path: "/student",
    children: [
      { index: true, Component: withSuspense(StudentDashboard) },
      { path: "dashboard", Component: withSuspense(StudentDashboard) },
      { path: "lecturer/:id", Component: withSuspense(LecturerDetails) },
      { path: "book/:lecturerId", Component: withSuspense(BookClass) },
      { path: "bookings", Component: withSuspense(MyBookings) },
    ],
  },
  {
    path: "/lecturer",
    children: [
      { index: true, Component: withSuspense(LecturerDashboard) },
      { path: "dashboard", Component: withSuspense(LecturerDashboard) },
      { path: "availability", Component: withSuspense(LecturerAvailability) },
    ],
  },
  {
    path: "/admin",
    children: [
      { index: true, Component: withSuspense(AdminDashboard) },
      { path: "dashboard", Component: withSuspense(AdminDashboard) },
    ],
  },
  {
    path: "/super-admin",
    children: [
      { index: true, Component: withSuspense(SuperAdminDashboard) },
      { path: "dashboard", Component: withSuspense(SuperAdminDashboard) },
    ],
  },
  {
    path: "/developer",
    children: [
      { index: true, Component: withSuspense(DeveloperDashboard) },
      { path: "dashboard", Component: withSuspense(DeveloperDashboard) },
    ],
  },
  {
    path: "*",
    Component: withSuspense(NotFound),
  },
]);
