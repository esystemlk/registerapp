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
