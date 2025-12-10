import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ConsultationProvider } from "./contexts/ConsultationContext";
import { RemindersProvider } from "./contexts/RemindersContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";

import Home from "./pages/Home";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from "./pages/ForgotPassword";
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfilePage from './pages/DoctorProfilePage';
import AdminDashboard from './pages/AdminDashboard';
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
                  {/* Landing Page - Redirect authenticated users to dashboard */}
                  <Route
                    path="/"
                    element={
                      <PublicRoute>
                        <Home />
                      </PublicRoute>
                    }
                  />

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

                  {/* Protected Dashboard Routes - Patient Only */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/doctors"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/consultations"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/pharmacy"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/profile"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/health-records"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor Dashboard Routes - Doctor Only */}
                  <Route
                    path="/doctor/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctor/dashboard/:tab"
                    element={
                      <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctor/profile"
                    element={
                      <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Dashboard Routes - Admin Only */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Payment Callback Routes - Patient Only */}
                  <Route
                    path="/payment/esewa/success"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <EsewaSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment/esewa/failure"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <EsewaFailure />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment/khalti/success"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
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
