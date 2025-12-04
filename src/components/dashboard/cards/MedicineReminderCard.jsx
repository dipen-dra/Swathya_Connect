import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pill, Bell, Clock, Edit3, Trash2 } from 'lucide-react';

export function MedicineReminderCard({ reminder, onEdit, onToggle, onDelete }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = () => {
        onDelete(reminder.id);
        setShowDeleteDialog(false);
    };

    return (
        <>
            <Card className={`border transition-all duration-200 ${reminder.isActive ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/30'}`}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${reminder.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Pill className={`h-6 w-6 ${reminder.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-gray-900">{reminder.medicineName}</h4>
                                <p className="text-gray-600">{reminder.dosage} • {reminder.frequency.replace('-', ' ')}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                    <span>Times: {reminder.times.join(', ')}</span>
                                    {reminder.emailReminder && (
                                        <div className="flex items-center space-x-1">
                                            <Bell className="h-3 w-3" />
                                            <span>Email alerts</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <Badge className={`border font-medium ${reminder.isActive
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                {reminder.isActive ? 'Active' : 'Paused'}
                            </Badge>
                            {reminder.nextReminder && reminder.isActive && (
                                <p className="text-xs text-gray-500">
                                    Next: {new Date(reminder.nextReminder).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {reminder.instructions && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500 mb-1">Instructions</p>
                            <p className="text-sm text-gray-700">{reminder.instructions}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                            <p className="text-gray-500 font-medium">Start Date</p>
                            <p className="text-gray-900">{new Date(reminder.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">End Date</p>
                            <p className="text-gray-900">
                                {reminder.endDate ? new Date(reminder.endDate).toLocaleDateString() : 'Ongoing'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Created: {new Date(reminder.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onToggle(reminder.id)}
                                className={reminder.isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}
                            >
                                {reminder.isActive ? 'Pause' : 'Activate'}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(reminder)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowDeleteDialog(true)}
                                className="border-red-200 text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <AlertDialogTitle>Delete Reminder?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Are you sure you want to delete the reminder for <strong>{reminder.medicineName}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
