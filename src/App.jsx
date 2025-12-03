import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Home from "./pages/Home";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";

export default function App() {
  return (
    <>
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
        </Routes>
      </BrowserRouter>
    </>
  );
}
