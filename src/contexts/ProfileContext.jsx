import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { profileAPI } from '@/services/api';
import { toast } from 'sonner';

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
        console.log('🔄 ProfileContext: useEffect triggered, user:', user?.id);
        if (user) {
            console.log('🔄 ProfileContext: User found, loading profile...');
            loadProfile();
        } else {
            console.log('⚠️  ProfileContext: No user found, skipping profile load');
            setProfile(null);
            setLoading(false);
        }
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;

        setLoading(true);
        try {
            console.log('🔄 ProfileContext: Fetching profile from API...');
            const response = await profileAPI.getProfile();
            console.log('✅ ProfileContext: Profile loaded:', response.data.data);
            setProfile(response.data.data);
        } catch (error) {
            console.error('❌ ProfileContext: Failed to load profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        if (!profile) return;

        try {
            console.log('🔄 ProfileContext: Updating profile...', profileData);
            const response = await profileAPI.updateProfile(profileData);
            console.log('✅ ProfileContext: Profile updated:', response.data.data);
            setProfile(response.data.data);
            toast.success('Profile updated successfully');
            return response.data.data;
        } catch (error) {
            console.error('❌ ProfileContext: Failed to update profile:', error);
            toast.error('Failed to update profile');
            throw error;
        }
    };

    const uploadProfileImage = async (file) => {
        try {
            console.log('🔄 ProfileContext: Uploading profile image...', file.name);
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await profileAPI.uploadProfileImage(formData);
            console.log('✅ ProfileContext: Image uploaded:', response.data.imageUrl);
            setProfile(response.data.data);
            toast.success('Profile image uploaded successfully');
            return response.data.imageUrl;
        } catch (error) {
            console.error('❌ ProfileContext: Failed to upload profile image:', error);
            toast.error('Failed to upload profile image');
            throw error;
        }
    };

    const deleteProfileImage = async () => {
        try {
            const response = await profileAPI.deleteProfileImage();
            setProfile(response.data.data);
            toast.success('Profile image deleted successfully');
        } catch (error) {
            console.error('Failed to delete profile image:', error);
            toast.error('Failed to delete profile image');
            throw error;
        }
    };

    return (
        <ProfileContext.Provider value={{
            profile,
            loading,
            updateProfile,
            uploadProfileImage,
            deleteProfileImage,
            refreshProfile: loadProfile
        }}>
            {children}
        </ProfileContext.Provider>
    );
};
