import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AppContent } from "./context/AppContext";

// PUBLIC WEBSITE ROUTES
import { Home } from "./basic-user-access/pages/Home";
import { NotFound } from "./basic-user-access/pages/NotFound";

// ADMIN ROUTES
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./components/DashboardLayout";

const GearLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <svg
      className="animate-spin h-16 w-16"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="#26358F" // E-Alerto Blue color
    >
      <path d="M94.43 56.24V43.76l-10.6-3.39a34.88 34.88 0 0 0-2.41-5.81l5.4-9.7-8.82-8.81-9.7 5.39a35.66 35.66 0 0 0-5.81-2.41L56.24 5.57H43.76l-3.39 10.6a34.88 34.88 0 0 0-5.81 2.41l-9.7-5.39-8.81 8.81 5.39 9.7a35.66 35.66 0 0 0-2.41 5.81L5.57 43.76v12.48l10.6 3.39a34.88 34.88 0 0 0 2.41 5.81l-5.39 9.7 8.81 8.81 9.7-5.39a35.66 35.66 0 0 0 5.81 2.41l3.39 10.6h12.48l3.39-10.6a34.88 34.88 0 0 0 5.81-2.41l9.7 5.39 8.82-8.81-5.4-9.7a35.66 35.66 0 0 0 2.41-5.81ZM50 65.71A15.71 15.71 0 1 1 65.71 50 15.71 15.71 0 0 1 50 65.71Z" />
    </svg>
  </div>
);

const App = () => {
  const { isLoggedIn, userData, isLoading } = useContext(AppContent);
  const isAdmin = isLoggedIn && userData;

  if (isLoading) {
    return <GearLoader />;
  }

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* 🌐 Public Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔐 Admin Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            isAdmin ? <DashboardLayout /> : <Navigate to="/login" replace />
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
