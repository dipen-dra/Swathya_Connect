import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import ProfileCard from './ProfileCard';

export default function PendingVerifications({ profiles, onApprove, onReject, onViewDocument, loading }) {
    if (loading) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading pending profiles...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!profiles || profiles.length === 0) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <CheckCircle className="h-16 w-16 text-gray-300" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                            <p className="text-gray-600">No pending profiles to review at the moment.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Verifications ({profiles.length})</CardTitle>
                <CardDescription>
                    Review and approve doctor and pharmacy registrations
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {profiles.map((profile) => (
                        <ProfileCard
                            key={profile._id}
                            profile={profile}
                            onApprove={onApprove}
                            onReject={onReject}
                            onViewDocument={onViewDocument}
                            showActions={true}
                            status="pending"
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
