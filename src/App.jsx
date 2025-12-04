import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ConsultationProvider } from "./contexts/ConsultationContext";

import Home from "./pages/Home";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import PatientDashboard from "./pages/PatientDashboard";

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <NotificationProvider>
          <ConsultationProvider>
            {/* GLOBAL TOAST SYSTEM */}
            <Toaster
              position="top-right"
              richColors
              expand
              theme="light"
            />

            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth" element={<Login />} />

                {/* Forgot Password Route */}
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<PatientDashboard />} />
              </Routes>
            </BrowserRouter>
          </ConsultationProvider>
        </NotificationProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
