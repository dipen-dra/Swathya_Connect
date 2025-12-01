// // src/pages/LoginPage.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Eye, 
//   EyeOff, 
//   ArrowLeft, 
//   Heart, 
//   User, 
//   Stethoscope, 
//   Building2, 
//   Shield, 
//   Upload, 
//   Phone, 
//   Mail, 
//   Lock 
// } from 'lucide-react';
// import { toast } from 'sonner';

// // Components
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// // Simple Label component
// const Label = ({ children, className, ...props }) => (
//   <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
//     {children}
//   </label>
// );

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [selectedRole, setSelectedRole] = useState('patient');
//   const [selectedLoginRole, setSelectedLoginRole] = useState('patient');
//   const [activeTab, setActiveTab] = useState('login');

//   const [loginData, setLoginData] = useState({
//     email: '',
//     password: ''
//   });

//   const [registerData, setRegisterData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//     fullName: '',
//     phone: '',
//     role: 'patient'
//   });

//   const roles = [
//     {
//       id: 'patient',
//       label: 'Patient',
//       icon: User,
//       description: 'Book consultations and manage health records',
//       color: 'border-blue-200 bg-blue-50 text-blue-700'
//     },
//     {
//       id: 'doctor',
//       label: 'Doctor',
//       icon: Stethoscope,
//       description: 'Provide consultations and medical services',
//       color: 'border-green-200 bg-green-50 text-green-700'
//     },
//     {
//       id: 'pharmacy',
//       label: 'Pharmacy',
//       icon: Building2,
//       description: 'Manage prescriptions and medication delivery',
//       color: 'border-purple-200 bg-purple-50 text-purple-700'
//     }
//   ];

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (!loginData.email || !loginData.password) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     setIsLoading(true);
//     // Simulate API call
//     setTimeout(() => {
//       console.log("Logged in as:", selectedLoginRole, loginData);
//       toast.success('Welcome back!');
//       navigate('/'); 
//       setIsLoading(false);
//     }, 1500);
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (!registerData.email || !registerData.password || !registerData.fullName || !registerData.phone) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     if (registerData.password !== registerData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     if (registerData.password.length < 8) {
//       toast.error('Password must be at least 8 characters');
//       return;
//     }

//     setIsLoading(true);
//     // Simulate API call
//     setTimeout(() => {
//       console.log("Registered:", selectedRole, registerData);
//       toast.success('Account created successfully!');
//       navigate('/');
//       setIsLoading(false);
//     }, 1500);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      
//       {/* Back Button - Fixed to Top Left */}
//       <Button
//         variant="ghost"
//         onClick={() => navigate('/')}
//         className="absolute top-6 left-6 text-gray-600 hover:text-gray-900"
//       >
//         <ArrowLeft className="h-5 w-5 mr-2" />
//         Back
//       </Button>

//       <div className="w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center space-x-3 mb-4 pt-2">
//             <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
//               <Heart className="h-6 w-6 text-white" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900">Swasthya Connect</h1>
//           </div>
//           <p className="text-gray-600 text-sm">Healthcare at your fingertips</p>
//         </div>

//         {/* Auth Card */}
//         <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
//           <CardContent className="p-8">
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//               <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
//                 <TabsTrigger 
//                   value="login" 
//                   className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
//                 >
//                   Login
//                 </TabsTrigger>
//                 <TabsTrigger 
//                   value="register" 
//                   className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
//                 >
//                   Register
//                 </TabsTrigger>
//               </TabsList>

//               {/* Login Tab */}
//               <TabsContent value="login" className="space-y-6">
//                 <form onSubmit={handleLogin} className="space-y-6">
//                   {/* Role Selection */}
//                   <div className="space-y-3">
//                     <Label className="text-sm font-medium text-gray-700">I am a</Label>
//                     <div className="grid grid-cols-3 gap-2">
//                       {roles.map((role) => (
//                         <button
//                           key={role.id}
//                           type="button"
//                           onClick={() => setSelectedLoginRole(role.id)}
//                           className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
//                             selectedLoginRole === role.id
//                               ? role.color
//                               : 'border-gray-200 bg-white hover:border-gray-300'
//                           }`}
//                         >
//                           <role.icon className={`h-5 w-5 ${
//                             selectedLoginRole === role.id ? 'text-current' : 'text-gray-400'
//                           }`} />
//                           <span className={`text-xs font-medium ${
//                             selectedLoginRole === role.id ? 'text-current' : 'text-gray-600'
//                           }`}>
//                             {role.label}
//                           </span>
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="login-email">Email or Phone</Label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         id="login-email"
//                         type="email"
//                         placeholder="Enter your email"
//                         value={loginData.email}
//                         onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
//                         className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="login-password">Password</Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         id="login-password"
//                         type={showPassword ? 'text' : 'password'}
//                         placeholder="Enter your password"
//                         value={loginData.password}
//                         onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//                         className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
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
//                     className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
//                   >
//                     {isLoading ? (
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                         <span>Signing in...</span>
//                       </div>
//                     ) : (
//                       'Sign In'
//                     )}
//                   </Button>
//                 </form>

//                 <div className="text-center">
//                   <Button 
//                     variant="link" 
//                     onClick={() => toast.info("Password reset flow")}
//                     className="text-sm text-gray-600 hover:text-blue-600"
//                   >
//                     Forgot your password?
//                   </Button>
//                 </div>
//               </TabsContent>

//               {/* Register Tab */}
//               <TabsContent value="register" className="space-y-6">
//                 <form onSubmit={handleRegister} className="space-y-6">
//                   <div className="space-y-3">
//                     <Label className="text-sm font-medium text-gray-700">I am a</Label>
//                     <div className="grid grid-cols-3 gap-2">
//                       {roles.map((role) => (
//                         <button
//                           key={role.id}
//                           type="button"
//                           onClick={() => {
//                             setSelectedRole(role.id);
//                             setRegisterData({ ...registerData, role: role.id });
//                           }}
//                           className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
//                             selectedRole === role.id
//                               ? role.color
//                               : 'border-gray-200 bg-white hover:border-gray-300'
//                           }`}
//                         >
//                           <role.icon className={`h-5 w-5 ${
//                             selectedRole === role.id ? 'text-current' : 'text-gray-400'
//                           }`} />
//                           <span className={`text-xs font-medium ${
//                             selectedRole === role.id ? 'text-current' : 'text-gray-600'
//                           }`}>
//                             {role.label}
//                           </span>
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="register-email">Email or Phone</Label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         id="register-email"
//                         type="email"
//                         placeholder="Enter your email"
//                         value={registerData.email}
//                         onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
//                         className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="register-password">Password</Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         id="register-password"
//                         type={showPassword ? 'text' : 'password'}
//                         placeholder="Enter your password"
//                         value={registerData.password}
//                         onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
//                         className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
//                       >
//                         {showPassword ? (
//                           <EyeOff className="h-4 w-4 text-gray-400" />
//                         ) : (
//                           <Eye className="h-4 w-4 text-gray-400" />
//                         )}
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="register-confirm-password">Confirm Password</Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         id="register-confirm-password"
//                         type="password"
//                         placeholder="Confirm your password"
//                         value={registerData.confirmPassword}
//                         onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
//                         className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="register-name">Full Name</Label>
//                     <div className="relative">
//                       <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         id="register-name"
//                         type="text"
//                         placeholder="Enter your full name"
//                         value={registerData.fullName}
//                         onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
//                         className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="register-phone">Phone Number</Label>
//                     <div className="relative">
//                       <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         id="register-phone"
//                         type="tel"
//                         placeholder="Enter your phone number"
//                         value={registerData.phone}
//                         onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
//                         className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//                       />
//                     </div>
//                   </div>

//                   {/* Professional Verification */}
//                   {(selectedRole === 'doctor' || selectedRole === 'pharmacy') && (
//                     <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
//                       <div className="flex items-center space-x-2">
//                         <Shield className="h-5 w-5 text-amber-600" />
//                         <span className="text-sm font-medium text-amber-800">
//                           Professional Verification Required
//                         </span>
//                       </div>
//                       <p className="text-xs text-amber-700">
//                         {selectedRole === 'doctor' 
//                           ? 'Upload your medical license and certification documents for verification.'
//                           : 'Upload your pharmacy license and business registration documents for verification.'
//                         }
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
//                     className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
//                   >
//                     {isLoading ? (
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                         <span>Creating account...</span>
//                       </div>
//                     ) : (
//                       'Create Account'
//                     )}
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>

//             {/* Security Badge */}
//             <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
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

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Simple Label component
const Label = ({ children, className, ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Logged in as:", selectedLoginRole, loginData);
      toast.success('Welcome back!');
      navigate('/'); 
      setIsLoading(false);
    }, 1500);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.email || !registerData.password || !registerData.fullName || !registerData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Registered:", selectedRole, registerData);
      toast.success('Account created successfully!');
      navigate('/');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      
      {/* Back Button - Fixed to Top Left */}
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
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Swasthya Connect</h1>
          </div>
          <p className="text-gray-600 text-sm">Healthcare at your fingertips</p>
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">I am a</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedLoginRole(role.id)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
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

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email or Phone</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
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
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
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

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">I am a</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.id);
                            setRegisterData({ ...registerData, role: role.id });
                          }}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
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

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email or Phone</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
                          ? 'Upload your medical license and certification documents for verification.'
                          : 'Upload your pharmacy license and business registration documents for verification.'
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Secured with end-to-end encryption</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}