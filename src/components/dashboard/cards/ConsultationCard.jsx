import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Video, Phone, MessageCircle, Star } from 'lucide-react';

const getConsultationTypeIcon = (type) => {
    switch (type) {
        case 'video': return Video;
        case 'audio': return Phone;
        case 'chat': return MessageCircle;
        default: return Video;
    }
};

const getConsultationTypeLabel = (type) => {
    if (type === 'video') return 'Video Consultation';
    if (type === 'audio') return 'Audio Consultation';
    if (type === 'chat') return 'Chat Consultation';
    return type;
};

const getConsultationTypeColor = (type) => {
    if (type === 'video') return 'text-blue-600';
    if (type === 'audio') return 'text-green-600';
    if (type === 'chat') return 'text-purple-600';
    return 'text-gray-600';
};

export function ConsultationCard({ consultation }) {
    const ConsultationIcon = getConsultationTypeIcon(consultation.type);

    return (
        <Card className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                        {/* Doctor Avatar */}
                        <Avatar className="h-14 w-14 border-2 border-blue-100">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-lg">
                                {consultation.doctorName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>

                        {/* Doctor Info and Details */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <h4 className="font-semibold text-lg text-gray-900">{consultation.doctorName}</h4>
                                <p className="text-sm text-gray-600">{consultation.specialty}</p>
                                <div className={`flex items-center space-x-1 mt-1 ${getConsultationTypeColor(consultation.type)}`}>
                                    <ConsultationIcon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{getConsultationTypeLabel(consultation.type)}</span>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700">Date & Time</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(consultation.date).toLocaleDateString('en-US', {
                                        month: 'numeric',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })} at {consultation.time}
                                </p>
                            </div>

                            {/* Consultation Purpose/Reason */}
                            {consultation.reason && (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-700">Consultation Purpose</p>
                                    <p className="text-sm text-gray-600">{consultation.reason}</p>
                                </div>
                            )}

                            {/* Doctor's Notes - Only for completed */}
                            {consultation.status === 'completed' && consultation.notes && (
                                <div className="space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm font-medium text-gray-700">Doctor's Notes</p>
                                    <p className="text-sm text-gray-600">{consultation.notes}</p>
                                </div>
                            )}

                            {/* Rating - Only for completed */}
                            {consultation.status === 'completed' && consultation.rating && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < consultation.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Status and Fee */}
                    <div className="flex flex-col items-end space-y-3 ml-4">
                        <Badge
                            className={`${consultation.status === 'completed'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                                } border font-medium px-3 py-1`}
                        >
                            {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </Badge>

                        <div className="text-right">
                            <p className="text-sm text-gray-600">Consultation Fee</p>
                            <p className="text-lg font-bold text-blue-600">NPR {consultation.fee}</p>
                        </div>

                        {/* Join Button - Only for upcoming */}
                        {consultation.status === 'upcoming' && (
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                                size="default"
                            >
                                <ConsultationIcon className="h-4 w-4 mr-2" />
                                {consultation.type === 'chat' ? 'Join Chat' : 'Join Call'}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
