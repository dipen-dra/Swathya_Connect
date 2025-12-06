import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ConsultationProvider } from "./contexts/ConsultationContext";
import { RemindersProvider } from "./contexts/RemindersContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from "./pages/ForgotPassword";
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfilePage from './pages/DoctorProfilePage';
import EsewaSuccess from './pages/EsewaSuccess';
import EsewaFailure from "./pages/EsewaFailure";
import KhaltiSuccess from './pages/KhaltiSuccess';
import ProfilePage from './pages/ProfilePage';

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

                  {/* Auth Routes - Redirect to dashboard if already logged in */}
                  <Route
                    path="/login"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <LoginPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <RegisterPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/auth"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <LoginPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Forgot Password Route */}
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Protected Dashboard Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/doctors"
                    element={
                      <ProtectedRoute>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/consultations"
                    element={
                      <ProtectedRoute>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/pharmacy"
                    element={
                      <ProtectedRoute>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/profile"
                    element={
                      <ProtectedRoute>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/health-records"
                    element={
                      <ProtectedRoute>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor Dashboard Routes */}
                  <Route
                    path="/doctor/dashboard"
                    element={
                      <ProtectedRoute>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctor/profile"
                    element={
                      <ProtectedRoute>
                        <DoctorProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Payment Callback Routes */}
                  <Route
                    path="/payment/esewa/success"
                    element={
                      <ProtectedRoute>
                        <EsewaSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment/esewa/failure"
                    element={
                      <ProtectedRoute>
                        <EsewaFailure />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment/khalti/success"
                    element={
                      <ProtectedRoute>
                        <KhaltiSuccess />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </RemindersProvider>
          </ConsultationProvider>
        </NotificationProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
