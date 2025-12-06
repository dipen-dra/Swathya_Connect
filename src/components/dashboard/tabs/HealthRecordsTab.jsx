import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Heart, FileText, Pill, Plus } from 'lucide-react';
import { MedicineReminderCard } from '../cards/MedicineReminderCard';

export function HealthRecordsTab({
    profile,
    medicineReminders,
    onAddReminder,
    onEditReminder,
    onToggleReminder,
    onDeleteReminder
}) {
    return (
        <div className="space-y-6">
            {/* Basic Health Information */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Basic Health Information</CardTitle>
                    <CardDescription>Your essential health details and medical history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <h4 className="font-semibold text-red-800">Blood Group</h4>
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                                {profile?.bloodGroup || 'Not Set'}
                            </p>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center space-x-2 mb-2">
                                <Heart className="h-5 w-5 text-orange-600" />
                                <h4 className="font-semibold text-orange-800">Allergies</h4>
                            </div>
                            <p className="text-sm text-orange-700">
                                {profile?.allergies || 'None recorded'}
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2 mb-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-800">Medical History</h4>
                            </div>
                            <p className="text-sm text-blue-700">
                                {profile?.medicalHistory || 'No history recorded'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Medicine Reminders Section */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center space-x-2">
                                <Pill className="h-5 w-5 text-blue-600" />
                                <span>Medicine Reminders</span>
                            </CardTitle>
                            <CardDescription>
                                Set daily medicine reminders with email notifications to stay on track with your medication schedule
                            </CardDescription>
                        </div>
                        <Button
                            onClick={onAddReminder}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Reminder
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {medicineReminders.length > 0 ? (
                        <div className="space-y-4">
                            {medicineReminders.map(reminder => (
                                <MedicineReminderCard
                                    key={reminder.id}
                                    reminder={reminder}
                                    onEdit={onEditReminder}
                                    onToggle={onToggleReminder}
                                    onDelete={onDeleteReminder}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Pill className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 font-medium">No medicine reminders set</p>
                            <p className="text-sm text-gray-500 mt-1">Add your daily medicines to get email reminders</p>
                            <Button
                                onClick={onAddReminder}
                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Reminder
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
