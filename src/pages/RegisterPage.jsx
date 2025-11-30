import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/forms/RegisterForm";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      {/* Back to Login */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-700 hover:text-black"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-semibold">Create Account</h1>
          <p className="text-gray-600">Join Swasthya Connect</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
