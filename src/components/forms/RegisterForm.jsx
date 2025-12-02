import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Upload,
  Stethoscope,
  Building2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

export default function RegisterForm() {
  const [role, setRole] = useState("patient");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    name: "",
    phone: "",
  });

  const update = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    if (!form.email || !form.password || !form.confirm || !form.name || !form.phone) {
      toast.error("Please complete all fields");
      return false;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = () => {
    if (!validate()) return;
    toast.success("Account created successfully!");
  };

  return (
    <div>
      {/* Role */}
      <label className="block text-gray-700 mb-3">I am a</label>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* patient */}
        <button
          onClick={() => setRole("patient")}
          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${
            role === "patient"
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-200"
          }`}
        >
          <User /> Patient
        </button>

        {/* doctor */}
        <button
          onClick={() => setRole("doctor")}
          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${
            role === "doctor"
              ? "border-green-500 bg-green-50 text-green-600"
              : "border-gray-200"
          }`}
        >
          <Stethoscope /> Doctor
        </button>

        {/* pharmacy */}
        <button
          onClick={() => setRole("pharmacy")}
          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${
            role === "pharmacy"
              ? "border-purple-500 bg-purple-50 text-purple-600"
              : "border-gray-200"
          }`}
        >
          <Building2 /> Pharmacy
        </button>
      </div>

      {/* Email */}
      <label>Email</label>
      <div className="relative mb-4">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="email"
          placeholder="name@email.com"
          className="pl-10 h-12"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>

      {/* Password */}
      <label>Password</label>
      <div className="relative mb-4">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type={showPass ? "text" : "password"}
          placeholder="••••••••"
          className="pl-10 pr-10 h-12"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPass ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* Confirm Password */}
      <label>Confirm Password</label>
      <div className="relative mb-4">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          className="pl-10 pr-10 h-12"
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showConfirm ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* Name */}
      <label>Full Name</label>
      <div className="relative mb-4">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="John Doe"
          className="pl-10 h-12"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      {/* Phone */}
      <label>Phone Number</label>
      <div className="relative mb-6">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="tel"
          placeholder="+977 98xxxxxxx"
          className="pl-10 h-12"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>

      {/* Document Upload */}
      {(role === "doctor" || role === "pharmacy") && (
        <div className="mb-6 p-4 border-2 border-orange-300 bg-orange-50 rounded-xl">
          <div className="flex gap-2 mb-2">
            <AlertCircle className="text-orange-700" />
            <h3 className="font-semibold text-orange-800">Verification Required</h3>
          </div>

          <p className="text-sm text-orange-700 mb-4">
            Upload your license & certification documents for verification.
          </p>

          <Button className="w-full border-orange-500 text-orange-700" variant="outline">
            <Upload className="w-4 h-4 mr-2" /> Upload Documents
          </Button>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleRegister}
        className="w-full bg-blue-600 text-white h-12 rounded-lg"
      >
        Create Account
      </Button>

      <div className="flex items-center justify-center mt-4 gap-2 text-gray-500 text-sm">
        <Shield className="w-4 h-4" /> Secure & Encrypted
      </div>
    </div>
  );
}
