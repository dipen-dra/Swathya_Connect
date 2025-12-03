
// // src/pages/LoginPage.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Eye,
//   EyeOff,
//   ArrowLeft,
//   User,
//   Stethoscope,
//   Building2,
//   Shield,
//   Upload,
//   Phone,
//   Mail,
//   Lock,
// } from "lucide-react";
// import { toast } from "sonner";
// import Logo from "@/assets/swasthyalogo.png";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// // Clean lightweight label
// const Label = ({ children, className, ...props }) => (
//   <label
//     className={`text-sm font-normal text-gray-600 ${className}`}
//     {...props}
//   >
//     {children}
//   </label>
// );

// export default function LoginPage() {
//   const navigate = useNavigate();

//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [selectedRole, setSelectedRole] = useState("patient");
//   const [selectedLoginRole, setSelectedLoginRole] = useState("patient");
//   const [activeTab, setActiveTab] = useState("login");

//   const [loginData, setLoginData] = useState({
//     email: "",
//     password: "",
//   });

//   const [registerData, setRegisterData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//     fullName: "",
//     phone: "",
//     role: "patient",
//   });

//   const roles = [
//     { id: "patient", label: "Patient", icon: User },
//     { id: "doctor", label: "Doctor", icon: Stethoscope },
//     { id: "pharmacy", label: "Pharmacy", icon: Building2 },
//   ];

//   // Role button component with restored colors
//   const RoleButton = ({ role, selected, onSelect }) => {
//     const colors = {
//       patient: {
//         border: "border-blue-500",
//         bg: "bg-blue-50",
//         icon: "text-blue-600",
//       },
//       doctor: {
//         border: "border-green-500",
//         bg: "bg-green-50",
//         icon: "text-green-600",
//       },
//       pharmacy: {
//         border: "border-purple-500",
//         bg: "bg-purple-50",
//         icon: "text-purple-600",
//       },
//     };

//     const isSelected = selected === role.id;

//     return (
//       <button
//         type="button"
//         onClick={() => onSelect(role.id)}
//         className={`p-3 rounded-xl border-2 flex flex-col items-center transition ${
//           isSelected
//             ? `${colors[role.id].border} ${colors[role.id].bg}`
//             : "border-gray-200 bg-white hover:border-gray-300"
//         }`}
//       >
//         <role.icon
//           className={`h-5 w-5 ${
//             isSelected ? colors[role.id].icon : "text-gray-500"
//           }`}
//         />

//         <span className="text-xs mt-1 font-normal text-gray-600">
//           {role.label}
//         </span>
//       </button>
//     );
//   };

//   const handleLogin = (e) => {
//     e.preventDefault();

//     if (!loginData.email || !loginData.password) {
//       toast.error("Missing fields", {
//         description: "Please enter your email and password.",
//       });
//       return;
//     }

//     setIsLoading(true);
//     setTimeout(() => {
//       toast.success("Welcome back!", {
//         description: "You have logged in successfully.",
//       });
//       navigate("/");
//       setIsLoading(false);
//     }, 1500);
//   };

//   const handleRegister = (e) => {
//     e.preventDefault();

//     if (
//       !registerData.email ||
//       !registerData.password ||
//       !registerData.fullName ||
//       !registerData.phone
//     ) {
//       toast.error("Incomplete form", {
//         description: "Please fill out all required fields.",
//       });
//       return;
//     }

//     if (registerData.password !== registerData.confirmPassword) {
//       toast.error("Passwords do not match", {
//         description: "Both passwords must match.",
//       });
//       return;
//     }

//     if (registerData.password.length < 8) {
//       toast.error("Weak password", {
//         description: "Password must be at least 8 characters.",
//       });
//       return;
//     }

//     setIsLoading(true);
//     setTimeout(() => {
//       toast.success("Account created!", {
//         description: "Your account has been created successfully.",
//       });
//       navigate("/login");
//       setIsLoading(false);
//     }, 1500);
//   };

//   const inputStyle =
//     "pl-10 pr-10 h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white placeholder:text-gray-400";

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
//       <Button
//         variant="ghost"
//         onClick={() => navigate("/")}
//         className="absolute top-6 left-6 text-gray-600 hover:text-gray-900"
//       >
//         <ArrowLeft className="h-5 w-5 mr-2" />
//         Back
//       </Button>

//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center mb-4 pt-2">
//             <img
//               src={Logo}
//               alt="Swasthya Connect Logo"
//               className="h-20 w-auto object-contain"
//             />
//           </div>
//           <p className="text-gray-600 text-sm">Healthcare at your fingertips</p>
//         </div>

//         <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
//           <CardContent className="p-8">
//             <Tabs value={activeTab} onValueChange={setActiveTab}>
//               <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
//                 <TabsTrigger
//                   value="login"
//                   className={`rounded-lg ${
//                     activeTab === "login"
//                       ? "font-semibold text-gray-900"
//                       : "font-normal text-gray-600"
//                   }`}
//                 >
//                   Login
//                 </TabsTrigger>

//                 <TabsTrigger
//                   value="register"
//                   className={`rounded-lg ${
//                     activeTab === "register"
//                       ? "font-semibold text-gray-900"
//                       : "font-normal text-gray-600"
//                   }`}
//                 >
//                   Register
//                 </TabsTrigger>
//               </TabsList>

//               {/* ---------------- LOGIN ---------------- */}
//               <TabsContent value="login" className="space-y-6">
//                 <form onSubmit={handleLogin} className="space-y-6">
//                   <div>
//                     <Label>I am a</Label>
//                     <div className="grid grid-cols-3 gap-2 mt-2">
//                       {roles.map((role) => (
//                         <RoleButton
//                           key={role.id}
//                           role={role}
//                           selected={selectedLoginRole}
//                           onSelect={setSelectedLoginRole}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Email or Phone</Label>
//                     <div className="relative mt-1">
//                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type="email"
//                         placeholder="Enter your email"
//                         value={loginData.email}
//                         onChange={(e) =>
//                           setLoginData({
//                             ...loginData,
//                             email: e.target.value,
//                           })
//                         }
//                         className={inputStyle}
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Password</Label>
//                     <div className="relative mt-1">
//                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type={showPassword ? "text" : "password"}
//                         placeholder="Enter your password"
//                         value={loginData.password}
//                         onChange={(e) =>
//                           setLoginData({
//                             ...loginData,
//                             password: e.target.value,
//                           })
//                         }
//                         className={inputStyle}
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2"
//                       >
//                         {showPassword ? (
//                           <EyeOff className="h-4 w-4 text-gray-400" />
//                         ) : (
//                           <Eye className="h-4 w-4 text-gray-400" />
//                         )}
//                       </Button>
//                     </div>
//                   </div>

//                   <Button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
//                   >
//                     {isLoading ? "Signing in…" : "Sign In"}
//                   </Button>
//                 </form>

//                 <div className="text-center">
//                   <Button
//                     variant="link"
//                     onClick={() => navigate("/forgot-password")}
//                     className="text-sm text-gray-600 hover:text-blue-600"
//                   >
//                     Forgot your password?
//                   </Button>
//                 </div>
//               </TabsContent>

//               {/* ---------------- REGISTER ---------------- */}
//               <TabsContent value="register" className="space-y-6">
//                 <form onSubmit={handleRegister} className="space-y-6">
//                   <div>
//                     <Label>I am a</Label>
//                     <div className="grid grid-cols-3 gap-2 mt-2">
//                       {roles.map((role) => (
//                         <RoleButton
//                           key={role.id}
//                           role={role}
//                           selected={selectedRole}
//                           onSelect={(roleId) => {
//                             setSelectedRole(roleId);
//                             setRegisterData({
//                               ...registerData,
//                               role: roleId,
//                             });
//                           }}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Email</Label>
//                     <div className="relative mt-1">
//                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type="email"
//                         placeholder="Enter your email"
//                         value={registerData.email}
//                         onChange={(e) =>
//                           setRegisterData({
//                             ...registerData,
//                             email: e.target.value,
//                           })
//                         }
//                         className={inputStyle}
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Password</Label>
//                     <div className="relative mt-1">
//                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type={showPassword ? "text" : "password"}
//                         placeholder="Enter your password"
//                         value={registerData.password}
//                         onChange={(e) =>
//                           setRegisterData({
//                             ...registerData,
//                             password: e.target.value,
//                           })
//                         }
//                         className={inputStyle}
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2"
//                       >
//                         {showPassword ? (
//                           <EyeOff className="h-4 w-4 text-gray-400" />
//                         ) : (
//                           <Eye className="h-4 w-4 text-gray-400" />
//                         )}
//                       </Button>
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Confirm Password</Label>
//                     <div className="relative mt-1">
//                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type={showConfirmPassword ? "text" : "password"}
//                         placeholder="Confirm your password"
//                         value={registerData.confirmPassword}
//                         onChange={(e) =>
//                           setRegisterData({
//                             ...registerData,
//                             confirmPassword: e.target.value,
//                           })
//                         }
//                         className={inputStyle}
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() =>
//                           setShowConfirmPassword(!showConfirmPassword)
//                         }
//                         className="absolute right-3 top-1/2 -translate-y-1/2"
//                       >
//                         {showConfirmPassword ? (
//                           <EyeOff className="h-4 w-4 text-gray-400" />
//                         ) : (
//                           <Eye className="h-4 w-4 text-gray-400" />
//                         )}
//                       </Button>
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Full Name</Label>
//                     <div className="relative mt-1">
//                       <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type="text"
//                         placeholder="Enter your full name"
//                         value={registerData.fullName}
//                         onChange={(e) =>
//                           setRegisterData({
//                             ...registerData,
//                             fullName: e.target.value,
//                           })
//                         }
//                         className={inputStyle}
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Phone Number</Label>
//                     <div className="relative mt-1">
//                       <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type="tel"
//                         placeholder="Enter your phone number"
//                         value={registerData.phone}
//                         onChange={(e) =>
//                           setRegisterData({
//                             ...registerData,
//                             phone: e.target.value,
//                           })
//                         }
//                         className={inputStyle}
//                       />
//                     </div>
//                   </div>

//                   {(selectedRole === "doctor" || selectedRole === "pharmacy") && (
//                     <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
//                       <div className="flex items-center space-x-2">
//                         <Shield className="h-5 w-5 text-amber-600" />
//                         <span className="text-sm font-normal text-amber-800">
//                           Professional Verification Required
//                         </span>
//                       </div>

//                       <p className="text-xs text-amber-700">
//                         {selectedRole === "doctor"
//                           ? "Upload your medical license and certification documents."
//                           : "Upload your pharmacy license and registration documents."}
//                       </p>

//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
//                       >
//                         <Upload className="h-4 w-4 mr-2" />
//                         Upload Documents
//                       </Button>
//                     </div>
//                   )}

//                   <Button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
//                   >
//                     {isLoading ? "Creating account…" : "Create Account"}
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>

//             <div className="mt-6 flex items-center justify-center text-xs text-gray-500 gap-2">
//               <Shield className="h-4 w-4" />
//               <span>Secured with end-to-end encryption</span>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }




// src/pages/LoginPage.jsx
import React, { useState, useRef } from "react"; // --- NEW: Added useRef
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
  FileCheck, // --- NEW: Icon for selected file
} from "lucide-react";
import { toast } from "sonner";
import Logo from "@/assets/swasthyalogo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  // --- NEW: Reference for the hidden file input
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [selectedRole, setSelectedRole] = useState("patient");
  const [selectedLoginRole, setSelectedLoginRole] = useState("patient");
  const [activeTab, setActiveTab] = useState("login");
  
  // --- NEW: State to store the uploaded document
  const [verificationFile, setVerificationFile] = useState(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    role: "patient",
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
        className={`p-3 rounded-xl border-2 flex flex-col items-center transition ${
          isSelected
            ? `${colors[role.id].border} ${colors[role.id].bg}`
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <role.icon
          className={`h-5 w-5 ${
            isSelected ? colors[role.id].icon : "text-gray-500"
          }`}
        />

        <span className="text-xs mt-1 font-normal text-gray-600">
          {role.label}
        </span>
      </button>
    );
  };

  // --- NEW: Handle file selection logic
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVerificationFile(file);
      toast.success("Document attached", {
        description: `Selected: ${file.name}`,
      });
    }
  };

  // --- NEW: Trigger the hidden input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error("Missing fields", {
        description: "Please enter your email and password.",
      });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      toast.success("Welcome back!", {
        description: "You have logged in successfully.",
      });
      navigate("/");
      setIsLoading(false);
    }, 1500);
  };

  const handleRegister = (e) => {
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

    // --- NEW: Check if document is uploaded for doctor/pharmacy
    if ((selectedRole === 'doctor' || selectedRole === 'pharmacy') && !verificationFile) {
        toast.error("Document Required", {
            description: "Please upload your professional license/verification documents.",
        });
        return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Both passwords must match.",
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
    
    // NOTE: When sending to backend, you will need to use FormData because of the file
    // Example: const formData = new FormData(); formData.append('file', verificationFile);
    
    setTimeout(() => {
      toast.success("Account created!", {
        description: "Your account has been created successfully.",
      });
      navigate("/login");
      setIsLoading(false);
    }, 1500);
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
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className={`rounded-lg ${
                    activeTab === "login"
                      ? "font-semibold text-gray-900"
                      : "font-normal text-gray-600"
                  }`}
                >
                  Login
                </TabsTrigger>

                <TabsTrigger
                  value="register"
                  className={`rounded-lg ${
                    activeTab === "register"
                      ? "font-semibold text-gray-900"
                      : "font-normal text-gray-600"
                  }`}
                >
                  Register
                </TabsTrigger>
              </TabsList>

              {/* ---------------- LOGIN ---------------- */}
              <TabsContent value="login" className="space-y-6">
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

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </TabsContent>

              {/* ---------------- REGISTER ---------------- */}
              <TabsContent value="register" className="space-y-6">
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
                            setVerificationFile(null); // Clear file on role switch
                            setRegisterData({
                              ...registerData,
                              role: roleId,
                            });
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ... Existing inputs for Email, Name etc ... */}
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

                  {/* --- NEW: Updated Documents Section with File Upload Logic --- */}
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

                      {/* --- NEW: Hidden Input Field --- */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />

                      {/* --- NEW: Button triggers the hidden input --- */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUploadClick}
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {verificationFile ? "Change Document" : "Upload Documents"}
                      </Button>

                      {/* --- NEW: Show selected filename --- */}
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
                </form>
              </TabsContent>
            </Tabs>

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