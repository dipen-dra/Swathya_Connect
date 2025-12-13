import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin } from 'lucide-react';

export function PatientProfileDialog({ open, onOpenChange, patient }) {
    if (!patient) return null;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white">
                <DialogHeader className="border-b border-gray-100 pb-4">
                    <DialogTitle>Patient Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Avatar and Name with Gradient Background */}
                    <div className="relative -mx-6 -mt-6 pt-6 pb-8 bg-gradient-to-br from-purple-50 to-blue-50">
                        <div className="flex flex-col items-center space-y-3">
                            <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                                <AvatarImage src={getImageUrl(patient.image)} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                                    {patient.name?.charAt(0) || 'P'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900">{patient.name || 'Unknown Patient'}</h3>
                                <Badge variant="outline" className="mt-2 bg-white">Patient</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4 px-1">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Information</h4>

                        {patient.email && (
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex-shrink-0">
                                    <Mail className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">Email</p>
                                    <p className="text-sm text-gray-900 truncate">{patient.email}</p>
                                </div>
                            </div>
                        )}

                        {patient.phone && (
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex-shrink-0">
                                    <Phone className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                                    <p className="text-sm text-gray-900">{patient.phone}</p>
                                </div>
                            </div>
                        )}

                        {patient.address && (
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex-shrink-0">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">Address</p>
                                    <p className="text-sm text-gray-900">{patient.address}</p>
                                </div>
                            </div>
                        )}

                        {/* Show message if no additional info */}
                        {!patient.phone && !patient.address && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No additional information available
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
