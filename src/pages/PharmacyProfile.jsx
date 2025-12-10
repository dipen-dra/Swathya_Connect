import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, MapPin, Calendar, Shield, Building, FileText, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function PharmacyProfile() {
    const { user } = useAuth();
    const { profile, updateProfile } = useProfile();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        dateOfBirth: '',
        gender: 'other',
        address: '',
        city: '',
        country: 'Nepal',
        pharmacyName: '',
        licenseNumber: '',
        panNumber: '',
        registrationDate: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const nameParts = user.fullName?.split(' ') || [''];
            setFormData(prev => ({
                ...prev,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
                phone: user.phone || '',
                pharmacyName: user.fullName || ''
            }));
        }
    }, [user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Here you would call your API to update pharmacy profile
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call

            toast.success('Profile updated successfully!');
            navigate('/pharmacy-dashboard/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto p-6 max-w-5xl">
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-400 rounded-2xl p-8 text-white shadow-xl mb-6">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 flex items-center space-x-4">
                        <div className="w-14 h-14 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <User className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Profile</h1>
                            <p className="text-white/90 text-base mt-1">Manage your personal information and settings</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center space-x-4 mt-4">
                        <Badge className="bg-white/20 text-white border-white/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Secure Profile
                        </Badge>
                        <Badge className="bg-white/20 text-white border-white/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified Account
                        </Badge>
                        <Badge className="bg-white/20 text-white border-white/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Swasthya Connect
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-lg sticky top-6">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative">
                                        <Avatar className="h-32 w-32">
                                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-4xl">
                                                {formData.firstName?.[0] || 'P'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition-colors">
                                            <Camera className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mt-4">
                                        {formData.firstName || 'pharmacy'}
                                    </h3>
                                    <Badge className="mt-2 bg-teal-100 text-teal-800 border-teal-200">
                                        Pharmacy
                                    </Badge>
                                    <p className="text-sm text-gray-500 mt-2">{formData.email}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content - Profile Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="border-b bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Personal Information</CardTitle>
                                            <p className="text-sm text-gray-600">Update your personal details and contact information</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                value={formData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                                placeholder="pharmacy"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                value={formData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                placeholder="pharmacy@demo.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                            <Input
                                                id="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="gender">Gender</Label>
                                            <Select
                                                value={formData.gender}
                                                onValueChange={(value) => handleChange('gender', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            placeholder="Enter your address"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => handleChange('city', e.target.value)}
                                                placeholder="Enter city"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="country">Country</Label>
                                            <Select
                                                value={formData.country}
                                                onValueChange={(value) => handleChange('country', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Nepal">Nepal</SelectItem>
                                                    <SelectItem value="India">India</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Business Information */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="border-b bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <Building className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Business Information</CardTitle>
                                            <p className="text-sm text-gray-600">Pharmacy license and registration details</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                                            <Input
                                                id="pharmacyName"
                                                value={formData.pharmacyName}
                                                onChange={(e) => handleChange('pharmacyName', e.target.value)}
                                                placeholder="Enter pharmacy name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="licenseNumber">License Number</Label>
                                            <Input
                                                id="licenseNumber"
                                                value={formData.licenseNumber}
                                                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                                                placeholder="Enter license number"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="panNumber">PAN Number</Label>
                                            <Input
                                                id="panNumber"
                                                value={formData.panNumber}
                                                onChange={(e) => handleChange('panNumber', e.target.value)}
                                                placeholder="Enter PAN number"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="registrationDate">Registration Date</Label>
                                            <Input
                                                id="registrationDate"
                                                type="date"
                                                value={formData.registrationDate}
                                                onChange={(e) => handleChange('registrationDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/pharmacy-dashboard/profile')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
