// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Heart, 
  User, 
  Stethoscope, 
  Building2, 
  Shield, 
  Upload, 
  Phone, 
  Mail, 
  Lock 
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from "@/assets/swasthyalogo.png";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Label Component
const Label = ({ children, className, ...props }) => (
  <label className={`text-sm font-medium ${className}`} {...props}>
    {children}
  </label>
);

export default function LoginPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [selectedLoginRole, setSelectedLoginRole] = useState('patient');
  const [activeTab, setActiveTab] = useState('login');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'patient'
  });

  const roles = [
    {
      id: 'patient',
      label: 'Patient',
      icon: User,
      description: 'Book consultations and manage health records',
      color: 'border-blue-200 bg-blue-50 text-blue-700'
    },
    {
      id: 'doctor',
      label: 'Doctor',
      icon: Stethoscope,
      description: 'Provide consultations and medical services',
      color: 'border-green-200 bg-green-50 text-green-700'
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy',
      icon: Building2,
      description: 'Manage prescriptions and medication delivery',
      color: 'border-purple-200 bg-purple-50 text-purple-700'
    }
  ];

  // ------------------ LOGIN ------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Missing fields", {
        description: "Please enter your email and password.",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      console.log("Logged in:", selectedLoginRole, loginData);

      toast.success("Welcome back!", {
        description: "You have logged in successfully.",
      });

      navigate('/');
      setIsLoading(false);
    }, 1500);
  };

  // ------------------ REGISTER ------------------
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!registerData.email || !registerData.password || !registerData.fullName || !registerData.phone) {
      toast.error("Incomplete form", {
        description: "Please fill out all required fields.",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Both passwords must match to continue.",
      });
      return;
    }

    if (registerData.password.length < 8) {
      toast.error("Weak password", {
        description: "Password must be at least 8 characters.",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      console.log("Registered:", selectedRole, registerData);

      toast.success("Account created!", {
        description: "Your account has been successfully created.",
      });
      navigate('/');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </Button>

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4 pt-2">
            {/* <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center"> */}
              <img
              src={Logo}
              alt="Swasthya Connect Logo" 
    className="h-30 w-auto object-contain"
              />
            {/* </div> */}
            {/* <h1 className="text-2xl font-bold text-gray-900">Swasthya Connect</h1> */}
          </div>
          <p className="text-gray-600 text-sm">Healthcare at your fingertips</p>
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white">Register</TabsTrigger>
              </TabsList>

              {/* ------------ LOGIN TAB ------------ */}
              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">

                  {/* Role Selector */}
                  <div className="space-y-3">
                    <Label className="text-gray-700">I am a</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedLoginRole(role.id)}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                            selectedLoginRole === role.id
                              ? role.color
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <role.icon className={`h-5 w-5 ${
                            selectedLoginRole === role.id ? 'text-current' : 'text-gray-400'
                          }`} />
                          <span className={`text-xs font-medium ${
                            selectedLoginRole === role.id ? 'text-current' : 'text-gray-600'
                          }`}>
                            {role.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label>Email or Phone</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10 h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10 h-12 rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-white border-2 border-t-transparent rounded-full animate-spin" />
                        <span>Signing in…</span>
                      </div>
                    ) : "Sign In"}
                  </Button>
                </form>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </TabsContent>

              {/* ------------ REGISTER TAB ------------ */}
              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">

                  {/* Role Selector */}
                  <div className="space-y-3">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.id);
                            setRegisterData({ ...registerData, role: role.id });
                          }}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                            selectedRole === role.id
                              ? role.color
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <role.icon className={`h-5 w-5 ${
                            selectedRole === role.id ? 'text-current' : 'text-gray-400'
                          }`} />
                          <span className={`text-xs font-medium ${
                            selectedRole === role.id ? 'text-current' : 'text-gray-600'
                          }`}>
                            {role.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10 rounded-xl h-12"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10 pr-10 rounded-xl h-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="pl-10 rounded-xl h-12"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                        className="pl-10 rounded-xl h-12"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="pl-10 rounded-xl h-12"
                      />
                    </div>
                  </div>

                  {/* Professional Verification */}
                  {(selectedRole === 'doctor' || selectedRole === 'pharmacy') && (
                    <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          Professional Verification Required
                        </span>
                      </div>

                      <p className="text-xs text-amber-700">
                        {selectedRole === 'doctor' 
                          ? 'Upload your medical license and certification documents.'
                          : 'Upload your pharmacy license and registration documents.'
                        }
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                      </Button>
                    </div>
                  )}

                  {/* Submit Register */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-white border-2 border-t-transparent rounded-full animate-spin" />
                        <span>Creating account…</span>
                      </div>
                    ) : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

            </Tabs>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center text-xs text-gray-500 gap-2">
              <Shield className="h-4 w-4" />
              <span>Secured with end-to-end encryption</span>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
