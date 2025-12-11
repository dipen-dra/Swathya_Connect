import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle as CheckCircleIcon } from 'lucide-react';
import ProfileCard from './ProfileCard';

export default function ApprovedProfiles({ profiles, onViewDocument, loading }) {
    if (loading) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading approved profiles...</p>
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
                        <CheckCircleIcon className="h-16 w-16 text-gray-300" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Profiles</h3>
                            <p className="text-gray-600">Approved profiles will appear here.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Approved Profiles ({profiles.length})</CardTitle>
                <CardDescription>
                    All verified doctors and pharmacies
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {profiles.map((profile) => (
                        <ProfileCard
                            key={profile._id}
                            profile={profile}
                            onViewDocument={onViewDocument}
                            showActions={false}
                            status="approved"
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
