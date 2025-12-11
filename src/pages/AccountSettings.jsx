import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Lock, Bell, Shield, Trash2, Eye, EyeOff,
    CheckCircle2, AlertCircle, ArrowLeft, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Custom Label
const Label = ({ children, className, ...props }) => (
    <label className={`text-sm font-semibold text-gray-700 mb-1.5 block ${className}`} {...props}>
        {children}
    </label>
);

export default function AccountSettings() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Notification Preferences State
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
        consultationReminders: true
    });
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);

    // Account Management State
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setNotifications(data.data.notificationPreferences);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("Password too short", {
                description: "New password must be at least 6 characters long."
            });
            return;
        }

        if (newPassword === currentPassword) {
            toast.error("Same password", {
                description: "New password must be different from your current password."
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match", {
                description: "Please make sure both passwords are the same."
            });
            return;
        }

        setIsChangingPassword(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Password changed!", {
                    description: "Your password has been updated successfully."
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error("Failed to change password", {
                    description: data.message
                });
            }
        } catch (error) {
            console.error('Change password error:', error);
            toast.error("Error", {
                description: "Failed to change password. Please try again."
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleNotificationToggle = async (key) => {
        const newNotifications = { ...notifications, [key]: !notifications[key] };
        setNotifications(newNotifications);

        setIsSavingNotifications(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/settings/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newNotifications)
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Preferences updated", {
                    description: "Your notification preferences have been saved."
                });
            } else {
                // Revert on error
                setNotifications(notifications);
                toast.error("Failed to update", {
                    description: data.message
                });
            }
        } catch (error) {
            console.error('Update notifications error:', error);
            setNotifications(notifications);
            toast.error("Error", {
                description: "Failed to update preferences."
            });
        } finally {
            setIsSavingNotifications(false);
        }
    };

    const handleDeactivateAccount = async () => {
        setIsDeactivating(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/account/deactivate', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Account deactivated", {
                    description: "Your account has been deactivated."
                });
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            } else {
                toast.error("Failed to deactivate", {
                    description: data.message
                });
            }
        } catch (error) {
            console.error('Deactivate account error:', error);
            toast.error("Error", {
                description: "Failed to deactivate account."
            });
        } finally {
            setIsDeactivating(false);
            setShowDeactivateModal(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error("Password required", {
                description: "Please enter your password to confirm deletion."
            });
            return;
        }

        setIsDeleting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: deletePassword })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Account deleted", {
                    description: "Your account has been permanently deleted."
                });
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            } else {
                toast.error("Failed to delete", {
                    description: data.message
                });
            }
        } catch (error) {
            console.error('Delete account error:', error);
            toast.error("Error", {
                description: "Failed to delete account."
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setDeletePassword('');
        }
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4 text-gray-600 hover:text-blue-600"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account preferences and security</p>
                </div>

                {/* Security Section */}
                <Card className="mb-6 border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Lock className="h-5 w-5 text-blue-600" />
                            <span>Security</span>
                        </CardTitle>
                        <CardDescription>Manage your password and security settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    >
                                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {newPassword && (
                                    <div className="mt-2 space-y-2">
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

                            <div>
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <div className="flex items-center space-x-2 text-xs mt-1">
                                        {newPassword === confirmPassword ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span className="text-green-600 font-medium">Passwords match</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                <span className="text-red-600 font-medium">Passwords don't match</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card className="mb-6 border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Bell className="h-5 w-5 text-blue-600" />
                            <span>Notifications</span>
                        </CardTitle>
                        <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <p className="font-medium text-gray-900">Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive updates via email</p>
                            </div>
                            <Switch
                                checked={notifications.email}
                                onCheckedChange={() => handleNotificationToggle('email')}
                                disabled={isSavingNotifications}
                            />
                        </div>

                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <p className="font-medium text-gray-900">SMS Notifications</p>
                                <p className="text-sm text-gray-500">Receive updates via SMS</p>
                            </div>
                            <Switch
                                checked={notifications.sms}
                                onCheckedChange={() => handleNotificationToggle('sms')}
                                disabled={isSavingNotifications}
                            />
                        </div>

                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <p className="font-medium text-gray-900">Push Notifications</p>
                                <p className="text-sm text-gray-500">Receive push notifications</p>
                            </div>
                            <Switch
                                checked={notifications.push}
                                onCheckedChange={() => handleNotificationToggle('push')}
                                disabled={isSavingNotifications}
                            />
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-gray-900">Consultation Reminders</p>
                                <p className="text-sm text-gray-500">Get reminded about upcoming consultations</p>
                            </div>
                            <Switch
                                checked={notifications.consultationReminders}
                                onCheckedChange={() => handleNotificationToggle('consultationReminders')}
                                disabled={isSavingNotifications}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Account Management Section */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <span>Account Management</span>
                        </CardTitle>
                        <CardDescription>Manage your account status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-900 mb-2">Deactivate Account</h4>
                            <p className="text-sm text-yellow-800 mb-3">
                                Temporarily disable your account. You can reactivate it anytime by logging in again.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeactivateModal(true)}
                                className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Deactivate Account
                            </Button>
                        </div>

                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
                            <p className="text-sm text-red-800 mb-3">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteModal(true)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Deactivate Modal */}
                {showDeactivateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <Card className="max-w-md w-full bg-white shadow-2xl">
                            <CardHeader>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <CardTitle className="text-yellow-900">Deactivate Account?</CardTitle>
                                </div>
                                <CardDescription className="text-gray-600">
                                    Your account will be temporarily disabled and automatically reactivated after 7 days.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> You can reactivate your account anytime before the 7-day period by simply logging in again.
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeactivateModal(false)}
                                        className="flex-1 border-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDeactivateAccount}
                                        disabled={isDeactivating}
                                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                                    >
                                        {isDeactivating ? 'Deactivating...' : 'Deactivate'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <Card className="max-w-md w-full bg-white shadow-2xl border-2 border-red-200">
                            <CardHeader>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <CardTitle className="text-red-600">Delete Account Permanently?</CardTitle>
                                </div>
                                <CardDescription className="text-gray-600">
                                    This action is irreversible. All your data will be permanently deleted.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-800 font-semibold mb-2">
                                        ⚠️ Warning: This cannot be recovered!
                                    </p>
                                    <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                                        <li>All your personal information will be deleted</li>
                                        <li>Your consultation history will be removed</li>
                                        <li>You cannot recover this account</li>
                                    </ul>
                                </div>
                                <div>
                                    <Label htmlFor="deletePassword" className="text-gray-700">Enter your password to confirm deletion</Label>
                                    <Input
                                        id="deletePassword"
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Your password"
                                        className="mt-1.5"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeletePassword('');
                                        }}
                                        className="flex-1 border-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || !deletePassword}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Forever'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
