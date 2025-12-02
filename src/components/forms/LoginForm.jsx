import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Stethoscope,
  Building2,
  Shield,
  Phone,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  PHARMACY: "pharmacy",
};

export function LoginForm() {
  const [selectedRole, setSelectedRole] = useState(ROLES.PATIENT);

  // Common fields
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register-only fields
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Simple validation error state
  const [errors, setErrors] = useState({});

  const resetErrors = () => setErrors({});

  // ---------------- LOGIN HANDLER ----------------
  const handleSignIn = () => {
    resetErrors();
    const newErrors = {};

    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone is required.";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Sign in with:", {
      role: selectedRole,
      emailOrPhone,
      password,
    });

    // TODO: replace with real API + toast later
    alert(`Signed in as ${selectedRole.toUpperCase()}`);
  };

  // ---------------- REGISTER HANDLER ----------------
  const handleCreateAccount = () => {
    resetErrors();
    const newErrors = {};

    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone is required.";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Create account:", {
      role: selectedRole,
      emailOrPhone,
      password,
      fullName,
      phoneNumber,
    });

    // TODO: replace with real API + toast later
    alert(`Account created for ${selectedRole.toUpperCase()}`);
  };

  const RoleButton = ({ role, icon: Icon, label, activeColor }) => (
    <button
      type="button"
      onClick={() => setSelectedRole(role)}
      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
        selectedRole === role
          ? `${activeColor.bg} ${activeColor.border} ${activeColor.text}`
          : "border-gray-200 text-gray-600 hover:border-gray-300"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      {/* Tabs */}
      <Tabs defaultValue="login" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        {/* ---------------- LOGIN TAB ---------------- */}
        <TabsContent value="login" className="mt-6">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-3 text-sm font-medium">
              I am a
            </label>
            <div className="grid grid-cols-3 gap-3">
              <RoleButton
                role={ROLES.PATIENT}
                icon={User}
                label="Patient"
                activeColor={{
                  bg: "bg-blue-50",
                  border: "border-blue-500",
                  text: "text-blue-600",
                }}
              />
              <RoleButton
                role={ROLES.DOCTOR}
                icon={Stethoscope}
                label="Doctor"
                activeColor={{
                  bg: "bg-blue-50",
                  border: "border-blue-500",
                  text: "text-blue-600",
                }}
              />
              <RoleButton
                role={ROLES.PHARMACY}
                icon={Building2}
                label="Pharmacy"
                activeColor={{
                  bg: "bg-blue-50",
                  border: "border-blue-500",
                  text: "text-blue-600",
                }}
              />
            </div>
          </div>

          {/* Email / Phone */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm">
              Email or Phone
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter your email or phone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            {errors.emailOrPhone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.emailOrPhone}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-sm">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Sign In Button */}
          <Button
            type="button"
            onClick={handleSignIn}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mb-4"
          >
            Sign In
          </Button>

          {/* Forgot Password */}
          <div className="text-center mb-6">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Forgot your password?
            </button>
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secured with end-to-end encryption</span>
          </div>
        </TabsContent>

        {/* ---------------- REGISTER TAB ---------------- */}
        <TabsContent value="register" className="mt-6">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-3 text-sm font-medium">
              I am a
            </label>
            <div className="grid grid-cols-3 gap-3">
              <RoleButton
                role={ROLES.PATIENT}
                icon={User}
                label="Patient"
                activeColor={{
                  bg: "bg-blue-50",
                  border: "border-blue-500",
                  text: "text-blue-600",
                }}
              />
              <RoleButton
                role={ROLES.DOCTOR}
                icon={Stethoscope}
                label="Doctor"
                activeColor={{
                  bg: "bg-green-50",
                  border: "border-green-500",
                  text: "text-green-600",
                }}
              />
              <RoleButton
                role={ROLES.PHARMACY}
                icon={Building2}
                label="Pharmacy"
                activeColor={{
                  bg: "bg-purple-50",
                  border: "border-purple-500",
                  text: "text-purple-600",
                }}
              />
            </div>
          </div>

          {/* Email or Phone */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm">
              Email or Phone
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter your email or phone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            {errors.emailOrPhone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.emailOrPhone}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-sm">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Professional Verification (Doctor / Pharmacy) */}
          {(selectedRole === ROLES.DOCTOR || selectedRole === ROLES.PHARMACY) && (
            <div className="mb-6 p-4 border-2 border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="text-orange-900 text-sm font-semibold">
                  Professional Verification Required
                </h3>
              </div>
              <p className="text-xs text-orange-800 mb-4">
                {selectedRole === ROLES.DOCTOR
                  ? "Upload your medical license and certification documents for verification."
                  : "Upload your pharmacy license and business registration documents for verification."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-orange-400 text-orange-700 hover:bg-orange-100 h-12"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          )}

          {/* Create Account Button */}
          <Button
            type="button"
            onClick={handleCreateAccount}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mb-6"
          >
            Create Account
          </Button>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secured with end-to-end encryption</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
