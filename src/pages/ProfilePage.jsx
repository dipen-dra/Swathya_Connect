import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Check, Shield, Heart, Edit, Save, X, ArrowLeft, Camera, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';

export function ProfilePage() {
    const { user } = useAuth();
    const { profile, updateProfile, uploadProfileImage } = useProfile();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(profile?.profileImage || null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        firstName: profile?.firstName || 'patient',
        lastName: profile?.lastName || '',
        email: user?.email || 'patient@demo.com',
        phoneNumber: profile?.phoneNumber || '',
        whatsappNumber: profile?.whatsappNumber || '',
        dateOfBirth: profile?.dateOfBirth || '',
        gender: profile?.gender || '',
        bloodGroup: profile?.bloodGroup || '',
        emergencyContact: profile?.emergencyContact || '',
        medicalHistory: profile?.medicalHistory || '',
        address: profile?.address || '',
        city: profile?.city || '',
        country: profile?.country || 'Nepal'
    });

    // Update formData when profile loads from API
    useEffect(() => {
        if (profile) {
            console.log('📝 ProfilePage: Profile loaded, updating form data:', profile);
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: user?.email || '',
                phoneNumber: profile.phoneNumber || '',
                whatsappNumber: profile.whatsappNumber || '',
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
                gender: profile.gender || '',
                bloodGroup: profile.bloodGroup || '',
                emergencyContact: profile.emergencyContact || '',
                medicalHistory: profile.medicalHistory || '',
                address: profile.address || '',
                city: profile.city || '',
                country: profile.country || 'Nepal'
            });
            setProfileImage(profile.profileImage || null);
        }
    }, [profile, user]);

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath; // Already a full URL
        return `http://localhost:5000${imagePath}`; // Prepend backend URL
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            // Upload image if a new one was selected
            if (selectedFile) {
                await uploadProfileImage(selectedFile);
            }

            // Update profile data
            await updateProfile(formData);

            setIsEditing(false);
            setSelectedFile(null);
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    };

    const handleCancel = () => {
        // Reset form data
        setFormData({
            firstName: profile?.firstName || 'patient',
            lastName: profile?.lastName || '',
            email: user?.email || 'patient@demo.com',
            phoneNumber: profile?.phoneNumber || '',
            whatsappNumber: profile?.whatsappNumber || '',
            dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
            gender: profile?.gender || '',
            bloodGroup: profile?.bloodGroup || '',
            emergencyContact: profile?.emergencyContact || '',
            medicalHistory: profile?.medicalHistory || '',
            address: profile?.address || '',
            city: profile?.city || '',
            country: profile?.country || 'Nepal'
        });
        if (isEditing) {
            setIsEditing(false);
        } else {
            navigate('/dashboard/profile');
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard/profile');
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

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

                        alert('Location retrieved successfully!');
                    } else {
                        alert('Could not retrieve address from location');
                    }
                } catch (error) {
                    console.error('Error getting address:', error);
                    alert('Failed to get address from location');
                }
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert('Location permission denied. Please enable location services.');
                } else {
                    alert('Failed to get your location.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Back Button */}
                <Button
                    onClick={handleBackToDashboard}
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
                                {formData.firstName[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex items-center space-x-6 mt-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Secure Profile</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Check className="h-4 w-4" />
                            <span>Verified Account</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4" />
                            <span>Swasthya Connect</span>
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
                                        <AvatarImage src={getImageUrl(profileImage)} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-3xl font-bold">
                                            {formData.firstName[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="profile-upload"
                                        className="absolute -bottom-1 -right-1 w-9 h-9 bg-teal-500 hover:bg-teal-600 rounded-full border-4 border-white flex items-center justify-center cursor-pointer transition-colors"
                                    >
                                        <Camera className="h-4 w-4 text-white" />
                                    </label>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {formData.firstName} {formData.lastName}
                                </h3>
                                <Badge className="mb-3 bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                    Patient
                                </Badge>
                                <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{formData.email}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content - Personal Information Form */}
                    <div className="flex-1">
                        <Card className="border border-gray-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                        <p className="text-sm text-gray-600 mt-1">Update your personal details and contact information</p>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            className="border-gray-200"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-5">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Email and Phone */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <Input
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {/* WhatsApp Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            WhatsApp Number (for medicine reminders)
                                            <span className="text-xs text-gray-500 ml-2">Format: +9779812345678</span>
                                        </label>
                                        <Input
                                            type="tel"
                                            placeholder="+977..."
                                            value={formData.whatsappNumber}
                                            onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                                            disabled={!isEditing}
                                            className="border-gray-200"
                                        />
                                    </div>

                                    {/* Date of Birth and Gender */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                            <Input
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                            <Select
                                                value={formData.gender}
                                                onValueChange={(value) => handleChange('gender', value)}
                                                disabled={!isEditing}
                                            >
                                                <SelectTrigger className="border-gray-200">
                                                    <SelectValue placeholder="Other" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Blood Group and Emergency Contact */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                            <Select
                                                value={formData.bloodGroup}
                                                onValueChange={(value) => handleChange('bloodGroup', value)}
                                                disabled={!isEditing}
                                            >
                                                <SelectTrigger className="border-gray-200">
                                                    <SelectValue placeholder="Select blood group" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    <SelectItem value="A+">A+</SelectItem>
                                                    <SelectItem value="A-">A-</SelectItem>
                                                    <SelectItem value="B+">B+</SelectItem>
                                                    <SelectItem value="B-">B-</SelectItem>
                                                    <SelectItem value="O+">O+</SelectItem>
                                                    <SelectItem value="O-">O-</SelectItem>
                                                    <SelectItem value="AB+">AB+</SelectItem>
                                                    <SelectItem value="AB-">AB-</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                                            <Input
                                                value={formData.emergencyContact}
                                                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Medical History */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                                        <Textarea
                                            value={formData.medicalHistory}
                                            onChange={(e) => handleChange('medicalHistory', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Any chronic conditions, past surgeries, or important medical history..."
                                            className="min-h-[90px] border-gray-200"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <div className="relative">
                                            <Textarea
                                                value={formData.address}
                                                onChange={(e) => handleChange('address', e.target.value)}
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <Input
                                                value={formData.city}
                                                onChange={(e) => handleChange('city', e.target.value)}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                            <Input
                                                value={formData.country}
                                                onChange={(e) => handleChange('country', e.target.value)}
                                                disabled={!isEditing}
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isEditing && (
                                        <div className="flex items-center space-x-3 pt-4">
                                            <Button
                                                onClick={handleSave}
                                                className="bg-teal-500 hover:bg-teal-600 text-white"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </Button>
                                            <Button
                                                onClick={handleCancel}
                                                variant="outline"
                                                className="border-gray-200"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}

                                    {!isEditing && (
                                        <div className="pt-4">
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
