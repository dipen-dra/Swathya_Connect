import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from "@/assets/swasthyalogo.png";
import { ArrowLeft, Shield, Clock, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function VerifyOTP() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const inputRefs = useRef([]);

    // Redirect if no email
    useEffect(() => {
        if (!email) {
            toast.error("Session expired", {
                description: "Please start the password reset process again.",
            });
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error("Invalid OTP", {
                description: "Please enter all 6 digits.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: otpString }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("OTP verified!", {
                    description: "You can now reset your password.",
                });
                navigate('/reset-password', { state: { verificationToken: data.verificationToken } });
            } else {
                toast.error("Verification failed", {
                    description: data.message || "Invalid or expired OTP.",
                });
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            toast.error("Error", {
                description: "Failed to verify OTP. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setTimeLeft(600); // Reset timer
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                toast.success("OTP resent!", {
                    description: "Check your email for the new OTP.",
                });
            } else {
                toast.error("Error", {
                    description: "Failed to resend OTP. Please try again.",
                });
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            toast.error("Error", {
                description: "Failed to resend OTP. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20 flex items-center justify-center p-4 font-sans relative">

            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => navigate('/forgot-password')}
                className="absolute top-6 left-6 text-gray-600 hover:text-blue-600 text-base h-10 px-4 font-medium"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
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
                </div>

                {/* OTP Verification Card */}
                <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="text-center pb-2 pt-8">
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Verify OTP
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base mt-2">
                            Enter the 6-digit code sent to {email}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* OTP Input Boxes */}
                            <div className="flex justify-center space-x-3">
                                {otp.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-lg"
                                    />
                                ))}
                            </div>

                            {/* Timer */}
                            <div className="flex items-center justify-center space-x-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className={`font-medium ${timeLeft < 60 ? 'text-red-600' : 'text-gray-600'}`}>
                                    {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP Expired'}
                                </span>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading || otp.join('').length !== 6 || timeLeft <= 0}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    'Verify OTP'
                                )}
                            </Button>

                            {/* Resend Button */}
                            <Button
                                type="button"
                                onClick={handleResend}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full h-11 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Resend OTP
                            </Button>
                        </form>

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
                            <li>OTP expires after 10 minutes</li>
                            <li>Click "Resend OTP" if you didn't receive it</li>
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
