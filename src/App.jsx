import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ConsultationProvider } from "./contexts/ConsultationContext";
import { RemindersProvider } from "./contexts/RemindersContext";
import { SocketProvider } from "./contexts/SocketContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import LoadingScreen from "./components/LoadingScreen";

import Home from "./pages/Home";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfilePage from './pages/DoctorProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import EsewaSuccess from './pages/EsewaSuccess';
import KhaltiSuccess from './pages/KhaltiSuccess';
import EsewaMedicineSuccess from './pages/EsewaMedicineSuccess';
import KhaltiMedicineSuccess from './pages/KhaltiMedicineSuccess';
import EsewaFailure from "./pages/EsewaFailure";
import ProfilePage from './pages/ProfilePage';
import AccountSettings from './pages/AccountSettings';
import PharmacyDashboard from './pages/PharmacyDashboard';
import PharmacyProfile from './pages/PharmacyProfile';
import ChatConsultation from './pages/ChatConsultation';
import CheckoutPage from './pages/patient/CheckoutPage';

import Store from './pages/public/Store';
import CartPage from './pages/public/CartPage';
import NotFound from './pages/NotFound';

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading (checking auth, loading configs, etc.)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Show loader for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while app initializes
  if (loading) {
    return <LoadingScreen />;
  }

  // Placeholder Client ID
  const GOOGLE_CLIENT_ID = "381818830866-smf0ps7geage5ib54sdavnookdqnlgcq.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ProfileProvider>
          <NotificationProvider>
            <ConsultationProvider>
              <RemindersProvider>
                <SocketProvider>
                  {/* GLOBAL TOAST SYSTEM */}
                  <Toaster position="top-right" richColors expand theme="light" />

                  <Router>
                    <Routes>
                      {/* Main Route - Store is now default */}
                      <Route path="/" element={<Store />} />

                      {/* Landing Page - Moved to /home */}
                      <Route
                        path="/home"
                        element={
                          <PublicRoute>
                            <Home />
                          </PublicRoute>
                        }
                      />

                      {/* Store Page - Specific route (optional alias) */}
                      <Route path="/store" element={<Store />} />
                      <Route path="/cart" element={<CartPage />} />

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

                      {/* Password Reset Routes */}
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/verify-otp" element={<VerifyOTP />} />
                      <Route path="/reset-password" element={<ResetPassword />} />

                      {/* Account Settings */}
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <AccountSettings />
                        </ProtectedRoute>
                      } />

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
                        path="/patient/checkout"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <CheckoutPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/medicine-orders"
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
                      <Route
                        path="/consultation-chat/:id"
                        element={
                          <ProtectedRoute allowedRoles={['doctor', 'patient']}>
                            <ChatConsultation />
                          </ProtectedRoute>
                        }
                      />

                      {/* Pharmacy Dashboard Route */}
                      <Route
                        path="/pharmacy-dashboard"
                        element={
                          <ProtectedRoute allowedRoles={['pharmacy']}>
                            <PharmacyDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/pharmacy-dashboard/:tab"
                        element={
                          <ProtectedRoute allowedRoles={['pharmacy']}>
                            <PharmacyDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/pharmacy" element={<Navigate to="/pharmacy-dashboard" replace />} />
                      <Route
                        path="/pharmacy/profile"
                        element={
                          <ProtectedRoute allowedRoles={['pharmacy']}>
                            <PharmacyProfile />
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
                      {/* Payment Success Pages */}
                      <Route
                        path="/esewa-success"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <EsewaSuccess />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/khalti-success"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <KhaltiSuccess />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/esewa-medicine-success"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <EsewaMedicineSuccess />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/khalti-medicine-success"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <KhaltiMedicineSuccess />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/esewa-medicine-failure"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <Navigate to="/dashboard" replace />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/khalti-medicine-failure"
                        element={
                          <ProtectedRoute allowedRoles={['patient']}>
                            <Navigate to="/dashboard" replace />
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
                      {/* 404 Not Found Route - THIS MUST BE LAST */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Router>
                </SocketProvider>
              </RemindersProvider>
            </ConsultationProvider>
          </NotificationProvider>
        </ProfileProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
