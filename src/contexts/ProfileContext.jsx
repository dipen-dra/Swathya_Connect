import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(undefined);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

export const ProfileProvider = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadProfile();
        } else {
            setProfile(null);
            setLoading(false);
        }
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Simulate API call - in real app, this would fetch from backend
            const savedProfile = localStorage.getItem(`profile_${user.id}`);
            if (savedProfile) {
                setProfile(JSON.parse(savedProfile));
            } else {
                // Create default profile based on user role
                const defaultProfile = createDefaultProfile(user);
                setProfile(defaultProfile);
                localStorage.setItem(`profile_${user.id}`, JSON.stringify(defaultProfile));
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const createDefaultProfile = (user) => {
        const baseProfile = {
            id: `profile_${user.id}`,
            userId: user.id,
            firstName: user.name.split(' ')[0] || '',
            lastName: user.name.split(' ')[1] || '',
            email: user.email,
            phone: '',
            address: '',
            city: '',
            dateOfBirth: '',
            gender: 'other',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        switch (user.role) {
            case 'patient':
                return {
                    ...baseProfile,
                    bloodGroup: '',
                    allergies: [],
                    medicalHistory: [],
                    emergencyContact: {
                        name: '',
                        phone: '',
                        relationship: '',
                    },
                };

            case 'doctor':
                return {
                    ...baseProfile,
                    specialization: '',
                    licenseNumber: '',
                    experience: 0,
                    education: [],
                    certifications: [],
                    consultationFee: 0,
                    availableHours: {},
                    bio: '',
                    rating: 0,
                    totalConsultations: 0,
                };

            case 'pharmacy':
                return {
                    ...baseProfile,
                    pharmacyName: '',
                    licenseNumber: '',
                    operatingHours: {},
                    services: [],
                    deliveryAvailable: false,
                    deliveryRadius: 0,
                };

            case 'admin':
                return {
                    ...baseProfile,
                    department: '',
                    role: 'admin',
                    permissions: [],
                };

            default:
                return baseProfile;
        }
    };

    const updateProfile = async (profileData) => {
        if (!profile) return;

        try {
            const updatedProfile = {
                ...profile,
                ...profileData,
                updatedAt: new Date().toISOString(),
            };

            setProfile(updatedProfile);
            localStorage.setItem(`profile_${profile.userId}`, JSON.stringify(updatedProfile));
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    };

    const uploadProfileImage = async (file) => {
        // Simulate file upload - in real app, this would upload to cloud storage
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result;
                resolve(imageUrl);
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <ProfileContext.Provider value={{
            profile,
            loading,
            updateProfile,
            uploadProfileImage,
        }}>
            {children}
        </ProfileContext.Provider>
    );
};
