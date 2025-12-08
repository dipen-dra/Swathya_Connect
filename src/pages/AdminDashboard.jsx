import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Users, FileText, Loader2 } from 'lucide-react';
import { adminAPI } from '@/services/api';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, profilesRes] = await Promise.all([
                adminAPI.getVerificationStats(),
                adminAPI.getPendingProfiles()
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            if (profilesRes.data.success) {
                setPendingProfiles(profilesRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (profileId) => {
        try {
            setProcessing(true);
            const response = await adminAPI.approveProfile(profileId);

            if (response.data.success) {
                toast.success('Doctor profile approved successfully!');
                fetchData(); // Refresh data
            }
        } catch (error) {
            console.error('Error approving profile:', error);
            toast.error(error.response?.data?.message || 'Failed to approve profile');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            setProcessing(true);
            const response = await adminAPI.rejectProfile(selectedProfile._id, rejectionReason);

            if (response.data.success) {
                toast.success('Profile rejected');
                setRejectDialog(false);
                setRejectionReason('');
                setSelectedProfile(null);
                fetchData(); // Refresh data
            }
        } catch (error) {
            console.error('Error rejecting profile:', error);
            toast.error(error.response?.data?.message || 'Failed to reject profile');
        } finally {
            setProcessing(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-white/90">Manage doctor profile verifications</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Rejected</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Profiles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Doctor Profiles ({pendingProfiles.length})</CardTitle>
                        <CardDescription>Review and approve doctor registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : pendingProfiles.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>No pending profiles to review</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingProfiles.map((profile) => (
                                    <Card key={profile._id} className="border-2">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage src={getImageUrl(profile.profileImage)} />
                                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                                                            {profile.firstName?.[0]}{profile.lastName?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">
                                                            Dr. {profile.firstName} {profile.lastName}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{profile.specialty}</p>
                                                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                                            <div>
                                                                <span className="text-gray-600">License:</span>
                                                                <span className="ml-2 font-medium">{profile.licenseNumber}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Experience:</span>
                                                                <span className="ml-2 font-medium">{profile.yearsOfExperience} years</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Fee:</span>
                                                                <span className="ml-2 font-medium">NPR {profile.consultationFee}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Email:</span>
                                                                <span className="ml-2 font-medium">{profile.userId?.email}</span>
                                                            </div>
                                                        </div>
                                                        {profile.documents && profile.documents.length > 0 && (
                                                            <div className="mt-3">
                                                                <Badge variant="outline" className="text-xs">
                                                                    <FileText className="h-3 w-3 mr-1" />
                                                                    {profile.documents.length} documents uploaded
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        {profile.submittedAt && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Submitted: {new Date(profile.submittedAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col space-y-2 ml-4">
                                                    <Button
                                                        onClick={() => handleApprove(profile._id)}
                                                        disabled={processing}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedProfile(profile);
                                                            setRejectDialog(true);
                                                        }}
                                                        disabled={processing}
                                                        variant="outline"
                                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Reject Dialog */}
                <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
                    <DialogContent className="bg-white">
                        <DialogHeader>
                            <DialogTitle>Reject Profile</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this profile
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="reason">Rejection Reason *</Label>
                                <Textarea
                                    id="reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g., License number verification failed, incomplete documents..."
                                    className="mt-2"
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRejectDialog(false);
                                    setRejectionReason('');
                                    setSelectedProfile(null);
                                }}
                                className="flex-1"
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReject}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                disabled={processing}
                            >
                                {processing ? 'Rejecting...' : 'Reject Profile'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
