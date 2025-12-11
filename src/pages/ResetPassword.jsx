import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from "@/assets/swasthyalogo.png";
import { ArrowLeft, Shield, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

// Custom Label
const Label = ({ children, className, ...props }) => (
    <label className={`text-sm font-semibold text-gray-700 mb-1.5 block ${className}`} {...props}>
        {children}
    </label>
);

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const verificationToken = location.state?.verificationToken;

    // Redirect if no verification token
    useEffect(() => {
        if (!verificationToken) {
            toast.error("Session expired", {
                description: "Please start the password reset process again.",
            });
            navigate('/forgot-password');
        }
    }, [verificationToken, navigate]);

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 3) return { strength, label: 'Medium', color: 'bg-yellow-500' };
        return { strength, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("Password too short", {
                description: "Password must be at least 6 characters long.",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match", {
                description: "Please make sure both passwords are the same.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ verificationToken, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Password reset successful!", {
                    description: "You can now login with your new password.",
                });
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error("Reset failed", {
                    description: data.message || "Failed to reset password. Please try again.",
                });
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error("Error", {
                description: "Failed to reset password. Please try again.",
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
                </div>

                {/* Reset Password Card */}
                <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="text-center pb-2 pt-8">
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Create New Password
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base mt-2">
                            Choose a strong password for your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-12 pr-12 h-11 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-lg bg-gray-50/50 placeholder:text-gray-400 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {newPassword && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">Password Strength:</span>
                                            <span className={`font-semibold ${passwordStrength.label === 'Weak' ? 'text-red-600' :
                                                    passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                                                        'text-green-600'
                                                }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="flex space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full ${i < passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-12 pr-12 h-11 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-lg bg-gray-50/50 placeholder:text-gray-400 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {/* Match Indicator */}
                                {confirmPassword && (
                                    <div className="flex items-center space-x-2 text-xs">
                                        {newPassword === confirmPassword ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span className="text-green-600 font-medium">Passwords match</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-red-600 font-medium">Passwords don't match</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading || !newPassword || !confirmPassword}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Resetting...</span>
                                    </div>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-gray-500 font-medium">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span>Your password is encrypted and secure</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Requirements */}
                <Card className="mt-6 border-0 shadow-lg bg-white/60 backdrop-blur-sm rounded-xl">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Password Requirements</h3>
                        <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside">
                            <li>At least 6 characters long</li>
                            <li>Mix of uppercase and lowercase letters (recommended)</li>
                            <li>Include numbers and special characters (recommended)</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
