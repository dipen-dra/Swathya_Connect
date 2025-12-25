import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Stethoscope,
  Building2,
  Shield,
  Upload,
  Phone,
  Mail,
  Lock,
  FileCheck,
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

import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("patient");
  const [verificationFile, setVerificationFile] = useState(null);

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVerificationFile(file);
      toast.success("Document attached", {
        description: `Selected: ${file.name}`,
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !registerData.email ||
      !registerData.password ||
      !registerData.fullName ||
      !registerData.phone
    ) {
      toast.error("Incomplete form", {
        description: "Please fill out all required fields.",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Both passwords must match.",
      });
      return;
    }

    if ((selectedRole === 'doctor' || selectedRole === 'pharmacy') && !verificationFile) {
      toast.error("Verification Required", {
        description: "Please upload the required verification documents.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', registerData.fullName);
      formData.append('email', registerData.email);
      formData.append('password', registerData.password);
      formData.append('phone', registerData.phone);
      formData.append('role', selectedRole);

      if (verificationFile) {
        formData.append('verificationDocument', verificationFile);
      }

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Account created!", {
          description: "Your account has been created successfully. Please login.",
        });
        navigate("/login"); // Redirect to login page
      } else {
        toast.error("Registration Failed", {
          description: data.message || "Could not create account",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async (credentialResponse) => {
    try {
      if ((selectedRole === 'doctor' || selectedRole === 'pharmacy')) {
        toast.info("Signing up with Google", {
          description: "Document verification will be skipped. Currently set as unverified.",
          duration: 4000
        });
      }

      setIsLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        idToken: credentialResponse.credential,
        role: selectedRole
      });

      if (res.data.success) {
        toast.success("Registration Successful");
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('swasthya_user', JSON.stringify(res.data.user));

        // Redirect logic
        window.location.href = '/dashboard'; // Simple redirect for now
      }
    } catch (error) {
      console.error('Google Registration Error:', error);
      toast.error(error.response?.data?.message || "Google Registration Failed");
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
        onClick={() => navigate("/")}
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
          <CardContent className="p-6 md:p-8">
            <div className="flex justify-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <Label>I am a</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {roles.map((role) => (
                    <RoleButton
                      key={role.id}
                      role={role}
                      selected={selectedRole}
                      onSelect={(roleId) => {
                        setSelectedRole(roleId);
                        setVerificationFile(null);
                        setRegisterData({ ...registerData, role: roleId });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.fullName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        fullName: e.target.value,
                      })
                    }
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <Label>Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        phone: e.target.value,
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
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
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

              <div>
                <Label>Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={inputStyle}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {(selectedRole === "doctor" || selectedRole === "pharmacy") && (
                <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-normal text-amber-800">
                      Professional Verification Required
                    </span>
                  </div>

                  <p className="text-xs text-amber-700">
                    {selectedRole === "doctor"
                      ? "Upload your medical license and certification documents."
                      : "Upload your pharmacy license and registration documents."}
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {verificationFile ? "Change Document" : "Upload Documents"}
                  </Button>

                  {verificationFile && (
                    <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg border border-amber-200">
                      <FileCheck className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-amber-900 truncate max-w-[200px]">
                        {verificationFile.name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
              >
                {isLoading ? "Creating account…" : "Create Account"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleRegister}
                  onError={() => toast.error("Google Sign Up Failed")}
                  useOneTap
                  theme="outline"
                  shape="circle"
                  text="signup_with"
                  width="100%"
                  locale="en_US"
                  key="google-login-btn"
                />
              </div>
            </form>

            <div className="text-center mt-6">
              <div className="text-sm text-gray-600">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 p-0 font-semibold"
                >
                  Sign in here
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
