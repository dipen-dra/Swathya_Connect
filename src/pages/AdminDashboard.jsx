import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { adminAPI } from '@/services/api';
import { toast } from 'sonner';

// Import modular components
import AdminStats from '../components/admin/AdminStats';
import AdminTabs from '../components/admin/AdminTabs';
import PendingVerifications from '../components/admin/PendingVerifications';
import ApprovedProfiles from '../components/admin/ApprovedProfiles';
import RejectedProfiles from '../components/admin/RejectedProfiles';
import RejectDialog from '../components/admin/RejectDialog';
import AllUsers from '../components/admin/AllUsers';
import AnalyticsOverview from '../components/admin/AnalyticsOverview';

export default function AdminDashboard() {
    // State management
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0, totalUsers: 0 });
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [approvedProfiles, setApprovedProfiles] = useState([]);
    const [rejectedProfiles, setRejectedProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Reject dialog state
    const [rejectDialog, setRejectDialog] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);

    // Fetch all data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchStats(),
                fetchPendingProfiles(),
                fetchApprovedProfiles(),
                fetchRejectedProfiles()
            ]);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getVerificationStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchPendingProfiles = async () => {
        try {
            const response = await adminAPI.getPendingProfiles();
            if (response.data.success) {
                setPendingProfiles(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching pending profiles:', error);
        }
    };

    const fetchApprovedProfiles = async () => {
        try {
            const response = await adminAPI.getApprovedProfiles();
            if (response.data.success) {
                setApprovedProfiles(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching approved profiles:', error);
            // If endpoint doesn't exist yet, silently fail
            setApprovedProfiles([]);
        }
    };

    const fetchRejectedProfiles = async () => {
        try {
            const response = await adminAPI.getRejectedProfiles();
            if (response.data.success) {
                setRejectedProfiles(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching rejected profiles:', error);
            // If endpoint doesn't exist yet, silently fail
            setRejectedProfiles([]);
        }
    };

    const handleApprove = async (profileId) => {
        try {
            setProcessing(true);
            const response = await adminAPI.approveProfile(profileId);

            if (response.data.success) {
                toast.success('Profile approved successfully!');
                await fetchAllData(); // Refresh all data
            }
        } catch (error) {
            console.error('Error approving profile:', error);
            toast.error(error.response?.data?.message || 'Failed to approve profile');
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectClick = (profile) => {
        setSelectedProfile(profile);
        setRejectDialog(true);
    };

    const handleRejectConfirm = async (rejectionReason) => {
        try {
            setProcessing(true);
            const response = await adminAPI.rejectProfile(selectedProfile._id, rejectionReason);

            if (response.data.success) {
                toast.success('Profile rejected');
                setRejectDialog(false);
                setSelectedProfile(null);
                await fetchAllData(); // Refresh all data
            }
        } catch (error) {
            console.error('Error rejecting profile:', error);
            toast.error(error.response?.data?.message || 'Failed to reject profile');
        } finally {
            setProcessing(false);
        }
    };

    const handleViewDocument = (documentUrl) => {
        if (!documentUrl) {
            toast.error('No document available');
            return;
        }
        // Ensure proper URL format with slash
        const fullUrl = documentUrl.startsWith('http')
            ? documentUrl
            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${documentUrl.startsWith('/') ? '' : '/'}${documentUrl}`;
        window.open(fullUrl, '_blank');
    };

    // Fetch users with pagination and filters
    const handleFetchUsers = async (params) => {
        try {
            const response = await adminAPI.getAllUsers(params);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
            return null;
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'pending':
                return (
                    <PendingVerifications
                        profiles={pendingProfiles}
                        onApprove={handleApprove}
                        onReject={handleRejectClick}
                        onViewDocument={handleViewDocument}
                        loading={loading}
                    />
                );

            case 'approved':
                return (
                    <ApprovedProfiles
                        profiles={approvedProfiles}
                        onViewDocument={handleViewDocument}
                        loading={loading}
                    />
                );

            case 'rejected':
                return (
                    <RejectedProfiles
                        profiles={rejectedProfiles}
                        onViewDocument={handleViewDocument}
                        loading={loading}
                    />
                );
            case 'users':
                return (
                    <AllUsers
                        onFetchUsers={handleFetchUsers}
                        loading={loading}
                    />
                );
            case 'overview':
            default:
                return <AnalyticsOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-white/90 text-lg">Manage profile verifications and system oversight</p>
                </div>

                {/* Stats - Always visible at top */}
                <AdminStats stats={stats} />

                {/* Tabs */}
                <AdminTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    counts={{
                        pending: stats.pending,
                        approved: stats.approved,
                        rejected: stats.rejected,
                        total: stats.totalUsers
                    }}
                />

                {/* Tab Content */}
                <div className="mt-6">
                    {renderTabContent()}
                </div>

                {/* Reject Dialog */}
                <RejectDialog
                    open={rejectDialog}
                    onClose={() => {
                        setRejectDialog(false);
                        setSelectedProfile(null);
                    }}
                    onConfirm={handleRejectConfirm}
                    profile={selectedProfile}
                    processing={processing}
                />
            </div>
        </div>
    );
}
