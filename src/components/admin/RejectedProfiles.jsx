import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, XCircle } from 'lucide-react';
import ProfileCard from './ProfileCard';

export default function RejectedProfiles({ profiles, onViewDocument, loading }) {
    if (loading) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading rejected profiles...</p>
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
                        <XCircle className="h-16 w-16 text-gray-300" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rejected Profiles</h3>
                            <p className="text-gray-600">Rejected profiles will appear here.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rejected Profiles ({profiles.length})</CardTitle>
                <CardDescription>
                    Profiles that did not meet verification requirements
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
                            status="rejected"
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
