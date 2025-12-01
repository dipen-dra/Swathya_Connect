import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from "@/assets/swasthyalogo.png";
import { 
  Heart, 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  Shield,
  Clock,
  Send
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

// Custom Label matching LoginPage
const Label = ({ children, className, ...props }) => (
  <label className={`text-sm font-semibold text-gray-700 mb-1.5 block ${className}`} {...props}>
    {children}
  </label>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address.",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API
    setTimeout(() => {
      setIsLoading(false);
      setIsEmailSent(true);

      toast.success("Reset link sent!", {
        description: "Check your inbox and spam folder.",
      });
    }, 1500);
  };

  const handleResendEmail = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      toast.info("Email sent again", {
        description: "We've resent the password reset instructions.",
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20 flex items-center justify-center p-4 font-sans relative">
      
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 text-gray-600 hover:text-blue-600 text-base h-10 px-4 font-medium"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Sign In
      </Button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
  <div className="flex items-center justify-center space-x-3 mb-3">
    <img 
      src={Logo} 
      alt="Swasthya Connect Logo" 
      className="h-30 w-auto object-contain"
    />
  </div>
        {/* <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Swasthya Connect</h1>
          </div> */}
        </div>

        {/* Reset Password Card */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isEmailSent ? 'Check Your Email' : 'Reset Password'}
            </CardTitle>

            <CardDescription className="text-gray-600 text-base mt-2">
              {isEmailSent 
                ? "We've sent reset instructions to your email."
                : "Enter your email and we'll send you a reset link."
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {!isEmailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-11 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-lg bg-gray-50/50 placeholder:text-gray-400 transition-all"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Send Reset Link</span>
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Success State */}
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">What's next?</p>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1.5 list-disc list-inside">
                          <li>Check your email inbox & spam folder</li>
                          <li>Click the reset link</li>
                          <li>Create a new password</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-11 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                  >
                    {isLoading ? "Resending..." : "Resend Email"}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-gray-500 font-medium">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Your account security is our priority</span>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6 border-0 shadow-lg bg-white/60 backdrop-blur-sm rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Need Help?</h3>
            <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside">
              <li>Check your spam/junk folder</li>
              <li>Reset links expire after 1 hour</li>
              <li>Contact support if you don’t receive the email</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-200/60">
              <p className="text-xs text-gray-500">
                Still having trouble? <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Contact Support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
