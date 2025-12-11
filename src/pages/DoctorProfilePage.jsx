import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { User, Edit3, Save, X, Shield, CheckCircle, ArrowLeft, Camera, LogOut, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { profileAPI } from '@/services/api';

export default function DoctorProfilePage() {
    const { user, logout } = useAuth();
    const { profile, updateProfile, uploadProfileImage } = useProfile();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        specialty: '',
        licenseNumber: '',
        yearsOfExperience: '',
        education: '',
        professionalBio: '',
        address: '',
        city: '',
        country: 'Nepal'
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: user?.email || '',
                phoneNumber: profile.phoneNumber || '',
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
                gender: profile.gender || '',
                specialty: profile.specialty || '',
                licenseNumber: profile.licenseNumber || '',
                yearsOfExperience: profile.yearsOfExperience || '',
                education: profile.education || '',
                professionalBio: profile.professionalBio || '',
                address: profile.address || '',
                city: profile.city || '',
                country: profile.country || 'Nepal'
            });
        }
    }, [profile, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // First, upload profile image if selected
            if (profileImage) {
                await uploadProfileImage(profileImage);
            }

            // Then update profile data
            await updateProfile(formData);

            setIsEditing(false);
            setProfileImage(null);
            setProfileImagePreview(null);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: user?.email || '',
                phoneNumber: profile.phoneNumber || '',
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
                gender: profile.gender || '',
                specialty: profile.specialty || '',
                licenseNumber: profile.licenseNumber || '',
                yearsOfExperience: profile.yearsOfExperience || '',
                education: profile.education || '',
                professionalBio: profile.professionalBio || '',
                address: profile.address || '',
                city: profile.city || '',
                country: profile.country || 'Nepal'
            });
        }
        setProfileImage(null);
        setProfileImagePreview(null);
        setIsEditing(false);
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size should be less than 5MB');
                return;
            }
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignOut = async () => {
        try {
            await logout();
            navigate('/');
            toast.success('Signed out successfully');
        } catch (error) {
            toast.error('Failed to sign out');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        toast.loading('Getting your location...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    if (data && data.address) {
                        const address = data.address;
                        const fullAddress = data.display_name || '';
                        const city = address.city || address.town || address.village || address.county || '';

                        setFormData(prev => ({
                            ...prev,
                            address: fullAddress,
                            city: city
                        }));

                        toast.dismiss();
                        toast.success('Location retrieved successfully!');
                    } else {
                        toast.dismiss();
                        toast.error('Could not retrieve address from location');
                    }
                } catch (error) {
                    console.error('Error getting address:', error);
                    toast.dismiss();
                    toast.error('Failed to get address from location');
                }
            },
            (error) => {
                toast.dismiss();
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error('Location permission denied. Please enable location services.');
                } else {
                    toast.error('Failed to get your location.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Back Button */}
                <Button
                    onClick={() => navigate('/doctor/dashboard')}
                    variant="ghost"
                    className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">My Profile</h1>
                                <p className="text-blue-100 mt-1">Manage your personal information and settings</p>
                            </div>
                        </div>
                        <Avatar className="h-14 w-14 border-4 border-white/30">
                            <AvatarImage src={getImageUrl(profile?.profileImage)} />
                            <AvatarFallback className="bg-white text-blue-600 text-xl font-bold">
                                {formData.firstName[0]?.toUpperCase() || 'D'}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex items-center space-x-6 mt-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Secure Profile</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Verified Account</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>SwasthyaConnect</span>
                        </div>
                    </div>
                </div>

                {/* Main Content - Side by Side Layout */}
                <div className="flex gap-6">
                    {/* Left Sidebar - Profile Card */}
                    <div className="w-80 flex-shrink-0">
                        <Card className="border border-gray-200 shadow-sm">
                            <CardContent className="p-6 text-center">
                                <div className="relative inline-block mb-4">
                                    <Avatar className="h-28 w-28">
                                        <AvatarImage src={profileImagePreview || getImageUrl(profile?.profileImage)} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-3xl font-bold">
                                            {formData.firstName[0]?.toUpperCase() || 'D'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isEditing && (
                                        <>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                            >
                                                <Camera className="h-4 w-4" />
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileImageChange}
                                                className="hidden"
                                            />
                                        </>
                                    )}
                                    {!isEditing && (
                                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {formData.firstName || 'doctor'} {formData.lastName}
                                </h3>
                                <Badge className="mb-3 bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                    Doctor
                                </Badge>
                                <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{formData.email || user?.email}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content - Personal Information Form */}
                    <div className="flex-1">
                        <Card className="border border-gray-200 shadow-sm">
                            <CardContent className="p-6">
                                {/* Header with Edit Button */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                        <p className="text-sm text-gray-600 mt-1">Update your personal details and contact information</p>
                                    </div>
                                    {!isEditing ? (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            className="border-gray-200"
                                        >
                                            <Edit3 className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    ) : null}
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-5">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Email and Phone */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                disabled={true}
                                                className="border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</Label>
                                            <Input
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {/* DOB and Gender */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</Label>
                                            <Input
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                                placeholder="mm/dd/yyyy"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">Gender</Label>
                                            <Select
                                                value={formData.gender}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                                                disabled={!isEditing}
                                            >
                                                <SelectTrigger className="border-gray-200">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Specialty and License */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">Specialty</Label>
                                            <Input
                                                id="specialty"
                                                name="specialty"
                                                value={formData.specialty}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">License Number</Label>
                                            <Input
                                                id="licenseNumber"
                                                name="licenseNumber"
                                                value={formData.licenseNumber}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Experience and Education */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</Label>
                                            <Input
                                                id="yearsOfExperience"
                                                name="yearsOfExperience"
                                                type="number"
                                                value={formData.yearsOfExperience}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">Education</Label>
                                            <Input
                                                id="education"
                                                name="education"
                                                value={formData.education}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Professional Bio */}
                                    <div>
                                        <Label htmlFor="professionalBio" className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</Label>
                                        <Textarea
                                            id="professionalBio"
                                            name="professionalBio"
                                            value={formData.professionalBio}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="min-h-[90px] border-gray-200"
                                            placeholder="Brief description of your medical practice and expertise"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</Label>
                                        <div className="relative">
                                            <Textarea
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="min-h-[70px] border-gray-200 pr-12"
                                            />
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={getCurrentLocation}
                                                    className="absolute right-2 top-2 p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title="Use current location"
                                                >
                                                    <MapPin className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* City and Country */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">City</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">Country</Label>
                                            <Input
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                                placeholder="Nepal"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isEditing && (
                                        <div className="flex items-center space-x-3 pt-4">
                                            <Button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                onClick={handleCancel}
                                                variant="outline"
                                                className="border-gray-200"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    )}

                                    {/* Sign Out Button */}
                                    {!isEditing && (
                                        <div className="pt-6 mt-6 border-t border-gray-200">
                                            <Button
                                                onClick={() => setShowSignOutDialog(true)}
                                                variant="outline"
                                                className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Sign Out
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sign Out Confirmation Dialog */}
                <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <div className="flex items-center space-x-2">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <LogOut className="h-6 w-6 text-red-600" />
                                </div>
                                <AlertDialogTitle>Sign out?</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription>
                                Are you sure you want to sign out? You'll need to sign in again to access your account.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSignOut} className="bg-red-500 hover:bg-red-600 text-white">
                                Sign Out
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
