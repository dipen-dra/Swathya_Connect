import React, { useState } from 'react';
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
import { User, Check, Shield, Heart, Edit, Save, X } from 'lucide-react';
import Header from '@/components/layout/Header';

export function ProfilePage() {
    const { user } = useAuth();
    const { profile } = useProfile();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        firstName: profile?.firstName || 'patient',
        lastName: profile?.lastName || '',
        email: user?.email || 'patient@demo.com',
        phoneNumber: profile?.phoneNumber || '',
        dateOfBirth: profile?.dateOfBirth || '',
        gender: profile?.gender || '',
        bloodGroup: profile?.bloodGroup || '',
        emergencyContact: profile?.emergencyContact || '',
        medicalHistory: profile?.medicalHistory || '',
        address: profile?.address || '',
        city: profile?.city || '',
        country: profile?.country || 'Nepal'
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // TODO: Save to backend
        console.log('Saving profile:', formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset form data
        setFormData({
            firstName: profile?.firstName || 'patient',
            lastName: profile?.lastName || '',
            email: user?.email || 'patient@demo.com',
            phoneNumber: profile?.phoneNumber || '',
            dateOfBirth: profile?.dateOfBirth || '',
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
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-6 py-8 max-w-6xl">
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">My Profile</h1>
                                <p className="text-blue-100 mt-1">Manage your personal information and settings</p>
                            </div>
                        </div>
                        <Avatar className="h-16 w-16 border-4 border-white/30">
                            <AvatarImage src={profile?.profileImage} />
                            <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-1">
                        <Card className="border border-gray-200">
                            <CardContent className="p-6 text-center">
                                <div className="relative inline-block mb-4">
                                    <Avatar className="h-32 w-32">
                                        <AvatarImage src={profile?.profileImage} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-4xl font-bold">
                                            {formData.firstName[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                        <Check className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {formData.firstName} {formData.lastName}
                                </h3>
                                <Badge className="mb-3 bg-blue-100 text-blue-700 border-blue-200">
                                    Patient
                                </Badge>
                                <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-4">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{formData.email}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content - Personal Information Form */}
                    <div className="lg:col-span-2">
                        <Card className="border border-gray-200">
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

                                <div className="space-y-6">
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
                                            className="min-h-[100px] border-gray-200"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <Textarea
                                            value={formData.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            disabled={!isEditing}
                                            className="min-h-[80px] border-gray-200"
                                        />
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
