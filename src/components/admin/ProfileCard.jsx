import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, Eye, Calendar } from 'lucide-react';

export default function ProfileCard({ profile, onApprove, onReject, onViewDocument, showActions = true, status = 'pending' }) {
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    const isDoctor = profile.userId?.role === 'doctor' || profile.specialty;
    const isPharmacy = profile.userId?.role === 'pharmacy' || profile.pharmacyLicenseNumber;

    const getInitials = () => {
        const first = profile.firstName?.[0] || '';
        const last = profile.lastName?.[0] || '';
        return (first + last).toUpperCase() || 'U';
    };

    const getStatusBadge = () => {
        const badges = {
            pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
            approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200' },
            rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' }
        };
        return badges[status] || badges.pending;
    };

    const statusBadge = getStatusBadge();

    return (
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                        {/* Avatar */}
                        <Avatar className="h-16 w-16 border-2 border-gray-200">
                            <AvatarImage src={getImageUrl(profile.profileImage)} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg font-semibold">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-lg text-gray-900">
                                    {isDoctor && 'Dr. '}{profile.firstName} {profile.lastName}
                                </h3>
                                <Badge variant="outline" className={statusBadge.color}>
                                    {statusBadge.label}
                                </Badge>
                            </div>

                            {/* Role-specific info */}
                            {isDoctor && (
                                <p className="text-sm text-gray-600 mb-3">{profile.specialty}</p>
                            )}
                            {isPharmacy && (
                                <p className="text-sm text-gray-600 mb-3">Pharmacy</p>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {isDoctor && (
                                    <>
                                        <div>
                                            <span className="text-gray-600">License:</span>
                                            <span className="ml-2 font-medium">{profile.licenseNumber || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Experience:</span>
                                            <span className="ml-2 font-medium">{profile.yearsOfExperience || 0} years</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Fee:</span>
                                            <span className="ml-2 font-medium">NPR {profile.consultationFee || 0}</span>
                                        </div>
                                    </>
                                )}
                                {isPharmacy && (
                                    <>
                                        <div>
                                            <span className="text-gray-600">License:</span>
                                            <span className="ml-2 font-medium">{profile.pharmacyLicenseNumber || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">PAN:</span>
                                            <span className="ml-2 font-medium">{profile.panNumber || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">City:</span>
                                            <span className="ml-2 font-medium">{profile.city || 'N/A'}</span>
                                        </div>
                                    </>
                                )}
                                <div className="col-span-2">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="ml-2 font-medium">{profile.userId?.email || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Documents Badge */}
                            {profile.verificationDocument && (
                                <div className="mt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewDocument && onViewDocument(profile.verificationDocument)}
                                        className="text-xs"
                                    >
                                        <FileText className="h-3 w-3 mr-1" />
                                        View Verification Document
                                    </Button>
                                </div>
                            )}

                            {/* Submission Date */}
                            {profile.submittedAt && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>Submitted: {new Date(profile.submittedAt).toLocaleDateString()}</span>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {status === 'rejected' && profile.rejectionReason && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-xs font-medium text-red-900 mb-1">Rejection Reason:</p>
                                    <p className="text-sm text-red-700">{profile.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {showActions && status === 'pending' && (
                        <div className="flex flex-col space-y-2 ml-4">
                            <Button
                                onClick={() => onApprove(profile._id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                onClick={() => onReject(profile)}
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                size="sm"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
