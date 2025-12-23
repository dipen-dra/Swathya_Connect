import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Stethoscope,
  Building2,
  Mail,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "@/assets/swasthyalogo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Clean lightweight label
const Label = ({ children, className, ...props }) => (
  <label
    className={`text-sm font-normal text-gray-600 ${className}`}
    {...props}
  >
    {children}
  </label>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || null;

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLoginRole, setSelectedLoginRole] = useState("patient");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const roles = [
    { id: "patient", label: "Patient", icon: User },
    { id: "doctor", label: "Doctor", icon: Stethoscope },
    { id: "pharmacy", label: "Pharmacy", icon: Building2 },
  ];

  const RoleButton = ({ role, selected, onSelect }) => {
    const colors = {
      patient: {
        border: "border-blue-500",
        bg: "bg-blue-50",
        icon: "text-blue-600",
      },
      doctor: {
        border: "border-green-500",
        bg: "bg-green-50",
        icon: "text-green-600",
      },
      pharmacy: {
        border: "border-purple-500",
        bg: "bg-purple-50",
        icon: "text-purple-600",
      },
    };

    const isSelected = selected === role.id;

    return (
      <button
        type="button"
        onClick={() => onSelect(role.id)}
        className={`p-3 rounded-xl border-2 flex flex-col items-center transition ${isSelected
          ? `${colors[role.id].border} ${colors[role.id].bg}`
          : "border-gray-200 bg-white hover:border-gray-300"
          }`}
      >
        <role.icon
          className={`h-5 w-5 ${isSelected ? colors[role.id].icon : "text-gray-500"
            }`}
        />

        <span className="text-xs mt-1 font-normal text-gray-600">
          {role.label}
        </span>
      </button>
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Missing fields", {
        description: "Please enter your email and password.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use AuthContext login which saves token to localStorage
      await login(loginData.email, loginData.password, selectedLoginRole);

      toast.success("Welcome back!", {
        description: "You have logged in successfully.",
      });

      // Get the user data from localStorage to check their actual role
      const storedUser = localStorage.getItem('swasthya_user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const userRole = userData?.role || selectedLoginRole;

      console.log('🔍 Login redirect - User data:', userData);
      console.log('🔍 Login redirect - User role:', userRole);
      console.log('🔍 Login redirect - Selected role:', selectedLoginRole);

      // Use minimal setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        // Navigate to the page they were trying to access, or default dashboard
        const redirectPath = from || localStorage.getItem('redirect_after_login');

        if (redirectPath) {
          console.log('🚀 Navigating to saved location:', redirectPath);
          localStorage.removeItem('redirect_after_login'); // Clear it after use
          navigate(redirectPath, { replace: true });
        } else {
          // ADMIN EXCEPTION: Always redirect admin to admin dashboard
          // regardless of selected role
          console.log('🚀 Navigating based on role:', userRole);
          if (userRole === "admin") {
            console.log('→ Admin detected! Going to /admin/dashboard');
            navigate("/admin/dashboard", { replace: true });
          } else if (userRole === "patient") {
            console.log('→ Going to /dashboard');
            navigate("/dashboard", { replace: true });
          } else if (userRole === "doctor") {
            console.log('→ Going to /doctor/dashboard');
            navigate("/doctor/dashboard", { replace: true });
          } else if (userRole === "pharmacy") {
            console.log('→ Going to /pharmacy-dashboard');
            navigate("/pharmacy-dashboard", { replace: true });
          } else {
            console.log('⚠️ Unknown role, defaulting to /dashboard');
            navigate("/dashboard", { replace: true });
          }
        }
      }, 10); // Minimal delay - just enough for state update
    } catch (error) {
      console.error(error);

      const errorData = error.response?.data;

      // Handle rate limiting - IP blocked
      if (errorData?.blocked) {
        toast.error("Account Temporarily Locked", {
          description: `Too many failed login attempts. Please try again in ${errorData.remainingTime} minute${errorData.remainingTime > 1 ? 's' : ''}.`,
          duration: 8000,
        });
      }
      // Handle rate limiting - approaching limit
      else if (errorData?.remainingAttempts !== undefined) {
        if (errorData.remainingAttempts > 0) {
          toast.error("Invalid Credentials", {
            description: `${errorData.message}\n⚠️ ${errorData.remainingAttempts} attempt${errorData.remainingAttempts > 1 ? 's' : ''} remaining before account lock.`,
            duration: 6000,
          });
        } else if (errorData.locked) {
          toast.error("Account Locked", {
            description: "Too many failed attempts. Your account has been temporarily locked for 15 minutes.",
            duration: 8000,
          });
        }
      }
      // Generic error
      else {
        toast.error("Login Failed", {
          description: errorData?.message || error.message || "Invalid credentials. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle =
    "pl-10 pr-10 h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        onClick={() => navigate(from || "/")}
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4 pt-2">
            <img
              src={Logo}
              alt="Swasthya Connect Logo"
              className="h-20 w-auto object-contain"
            />
          </div>
          <p className="text-gray-600 text-sm">Healthcare at your fingertips</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label>I am a</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {roles.map((role) => (
                    <RoleButton
                      key={role.id}
                      role={role}
                      selected={selectedLoginRole}
                      onSelect={setSelectedLoginRole}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Email or Phone</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        email: e.target.value,
                      })
                    }
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        password: e.target.value,
                      })
                    }
                    className={inputStyle}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
              >
                {isLoading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <div className="text-center space-y-4 mt-6">
              <Button
                variant="link"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Forgot your password?
              </Button>

              <div className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:text-blue-700 p-0 font-semibold"
                >
                  Register here
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}