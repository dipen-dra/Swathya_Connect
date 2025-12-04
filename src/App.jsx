import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ConsultationProvider } from "./contexts/ConsultationContext";
import { RemindersProvider } from "./contexts/RemindersContext";

import Home from "./pages/Home";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import { PatientDashboard } from "./pages/PatientDashboard";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <NotificationProvider>
          <ConsultationProvider>
            <RemindersProvider>
              {/* GLOBAL TOAST SYSTEM */}
              <Toaster position="top-right" richColors expand theme="light" />

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
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </BrowserRouter>
            </RemindersProvider>
          </ConsultationProvider>
        </NotificationProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
