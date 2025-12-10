import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, CheckCircle, Edit, Camera, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function PharmacyProfile() {
    const { user } = useAuth();
    const { profile, updateProfile } = useProfile();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
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

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Here you would call your API to update pharmacy profile
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call

            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
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
                    // Use OpenStreetMap Nominatim API for reverse geocoding (free, no API key needed)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    if (data && data.address) {
                        const address = data.address;
                        const fullAddress = data.display_name || '';

                        // Extract city and update form
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
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    toast.error('Location information unavailable.');
                } else if (error.code === error.TIMEOUT) {
                    toast.error('Location request timed out.');
                } else {
                    toast.error('Failed to get your location.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-400 rounded-2xl p-8 text-white shadow-xl mb-6">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <User className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">My Profile</h1>
                                <p className="text-white/90 text-base mt-1">Manage your personal information and settings</p>
                            </div>
                        </div>
                        <Avatar className="h-16 w-16 border-4 border-white/30">
                            <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                                {formData.firstName?.[0] || 'P'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="relative z-10 flex items-center space-x-4 mt-4">
                        <Badge className="bg-white/20 text-white border-white/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Secure Profile
                        </Badge>
                        <Badge className="bg-white/20 text-white border-white/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
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
                                        <Avatar className="h-32 w-32 border-4 border-blue-100">
                                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-4xl">
                                                {formData.firstName?.[0] || 'P'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition-colors shadow-lg">
                                            <Camera className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mt-4">
                                        {formData.firstName || 'pharmacy'}
                                    </h3>
                                    <Badge className="mt-2 bg-teal-100 text-teal-800 border-teal-200">
                                        Pharmacy
                                    </Badge>
                                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        {formData.email}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content - Personal Information */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-8">
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
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    ) : (
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() => setIsEditing(false)}
                                                variant="outline"
                                                className="border-gray-200"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSave}
                                                className="bg-teal-600 hover:bg-teal-700 text-white"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                                    placeholder="pharmacy"
                                                    className="mt-1 border-gray-200"
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900">{formData.firstName || 'pharmacy'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="lastName"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                                    placeholder="Enter last name"
                                                    className="mt-1 border-gray-200"
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900">{formData.lastName || '-'}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleChange('email', e.target.value)}
                                                    placeholder="pharmacy@demo.com"
                                                    className="mt-1 border-gray-200"
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900">{formData.email || 'pharmacy@demo.com'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="phone"
                                                    value={formData.phone}
                                                    onChange={(e) => handleChange('phone', e.target.value)}
                                                    placeholder="Enter phone number"
                                                    className="mt-1 border-gray-200"
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900">{formData.phone || '-'}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="dateOfBirth"
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                                    className="mt-1 border-gray-200"
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900">{formData.dateOfBirth || 'mm/dd/yyyy'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</Label>
                                            {isEditing ? (
                                                <Select
                                                    value={formData.gender}
                                                    onValueChange={(value) => handleChange('gender', value)}
                                                >
                                                    <SelectTrigger className="mt-1 border-gray-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p className="mt-1 text-gray-900 capitalize">{formData.gender || 'Other'}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Textarea
                                                    id="address"
                                                    value={formData.address}
                                                    onChange={(e) => handleChange('address', e.target.value)}
                                                    placeholder="Enter your address"
                                                    rows={3}
                                                    className="mt-1 border-gray-200 pr-12"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={getCurrentLocation}
                                                    className="absolute right-2 top-3 p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title="Use current location"
                                                >
                                                    <MapPin className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="mt-1 text-gray-900">{formData.address || '-'}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="city"
                                                    value={formData.city}
                                                    onChange={(e) => handleChange('city', e.target.value)}
                                                    placeholder="Enter city"
                                                    className="mt-1 border-gray-200"
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900">{formData.city || '-'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="country"
                                                    value={formData.country}
                                                    onChange={(e) => handleChange('country', e.target.value)}
                                                    placeholder="Nepal"
                                                    className="mt-1 border-gray-200"
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900">{formData.country || 'Nepal'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
