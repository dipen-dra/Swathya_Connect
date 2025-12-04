import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Clock, Plus, X, Bell, CheckCircle } from 'lucide-react';

export function MedicineReminderDialog({
    open,
    onOpenChange,
    onSave,
    editingReminder
}) {
    const [medicineName, setMedicineName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [times, setTimes] = useState(['']);
    const [instructions, setInstructions] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [emailReminder, setEmailReminder] = useState(true);
    const [beforeMealMinutes, setBeforeMealMinutes] = useState(30);

    const frequencyOptions = [
        { value: 'daily', label: 'Once daily' },
        { value: 'twice-daily', label: 'Twice daily' },
        { value: 'three-times', label: 'Three times daily' },
        { value: 'four-times', label: 'Four times daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'as-needed', label: 'As needed' }
    ];

    useEffect(() => {
        if (editingReminder) {
            setMedicineName(editingReminder.medicineName);
            setDosage(editingReminder.dosage);
            setFrequency(editingReminder.frequency);
            setTimes(editingReminder.times);
            setInstructions(editingReminder.instructions || '');
            setStartDate(editingReminder.startDate);
            setEndDate(editingReminder.endDate || '');
            setEmailReminder(editingReminder.emailReminder);
            setBeforeMealMinutes(editingReminder.beforeMealMinutes);
        } else {
            resetForm();
        }
    }, [editingReminder, open]);

    const handleSave = () => {
        const reminderData = {
            id: editingReminder?.id || `reminder_${Date.now()}`,
            medicineName,
            dosage,
            frequency,
            times: times.filter(t => t.trim()),
            instructions,
            startDate,
            endDate: endDate || null,
            emailReminder,
            beforeMealMinutes,
            isActive: true,
            createdAt: editingReminder?.createdAt || new Date().toISOString(),
            nextReminder: calculateNextReminder()
        };

        onSave(reminderData);
    };

    const calculateNextReminder = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const firstTime = times.filter(t => t.trim())[0];

        if (firstTime) {
            const reminderTime = new Date(`${today}T${firstTime}:00`);
            if (emailReminder) {
                reminderTime.setMinutes(reminderTime.getMinutes() - beforeMealMinutes);
            }

            if (reminderTime <= now) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }

            return reminderTime.toISOString();
        }

        return new Date().toISOString();
    };

    const addTimeSlot = () => {
        setTimes([...times, '']);
    };

    const removeTimeSlot = (index) => {
        if (times.length > 1) {
            setTimes(times.filter((_, i) => i !== index));
        }
    };

    const updateTime = (index, value) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setTimes(newTimes);
    };

    const resetForm = () => {
        setMedicineName('');
        setDosage('');
        setFrequency('daily');
        setTimes(['']);
        setInstructions('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setEmailReminder(true);
        setBeforeMealMinutes(30);
    };

    const getTimeSlotsByFrequency = () => {
        switch (frequency) {
            case 'twice-daily':
                return 2;
            case 'three-times':
                return 3;
            case 'four-times':
                return 4;
            default:
                return times.length;
        }
    };

    useEffect(() => {
        const requiredSlots = getTimeSlotsByFrequency();
        if (frequency !== 'daily' && frequency !== 'weekly' && frequency !== 'as-needed') {
            const newTimes = Array(requiredSlots).fill('').map((_, i) => times[i] || '');
            setTimes(newTimes);
        }
    }, [frequency]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Pill className="h-5 w-5 text-blue-600" />
                        <span>{editingReminder ? 'Edit Medicine Reminder' : 'Add Medicine Reminder'}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Set up daily medicine reminders with email notifications to help you stay on track with your medication schedule.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Medicine Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="medicineName">Medicine Name *</Label>
                            <Input
                                id="medicineName"
                                placeholder="e.g., Omeprazole, Paracetamol"
                                value={medicineName}
                                onChange={(e) => setMedicineName(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="dosage">Dosage *</Label>
                            <Input
                                id="dosage"
                                placeholder="e.g., 20mg, 1 tablet, 5ml"
                                value={dosage}
                                onChange={(e) => setDosage(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Frequency Selection */}
                    <div>
                        <Label>Frequency *</Label>
                        <Select value={frequency} onValueChange={setFrequency}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {frequencyOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Time Slots */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label>Reminder Times *</Label>
                            {(frequency === 'daily' || frequency === 'weekly' || frequency === 'as-needed') && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={addTimeSlot}
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Time
                                </Button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {times.map((time, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <Input
                                        type="time"
                                        value={time}
                                        onChange={(e) => updateTime(index, e.target.value)}
                                        className="flex-1"
                                    />
                                    {times.length > 1 && (frequency === 'daily' || frequency === 'weekly' || frequency === 'as-needed') && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => removeTimeSlot(index)}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate">End Date (Optional)</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1"
                                min={startDate}
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <Label htmlFor="instructions">Special Instructions</Label>
                        <Textarea
                            id="instructions"
                            placeholder="e.g., Take with food, Take on empty stomach, Avoid alcohol"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="mt-1"
                            rows={3}
                        />
                    </div>

                    {/* Email Reminder Settings */}
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Bell className="h-4 w-4 text-blue-600" />
                                <Label htmlFor="emailReminder" className="font-medium">Email Reminders</Label>
                            </div>
                            <Switch
                                id="emailReminder"
                                checked={emailReminder}
                                onCheckedChange={setEmailReminder}
                            />
                        </div>

                        {emailReminder && (
                            <div>
                                <Label htmlFor="beforeMealMinutes">Send reminder (minutes before meal time)</Label>
                                <Select
                                    value={beforeMealMinutes.toString()}
                                    onValueChange={(value) => setBeforeMealMinutes(parseInt(value))}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="15">15 minutes before</SelectItem>
                                        <SelectItem value="30">30 minutes before</SelectItem>
                                        <SelectItem value="60">1 hour before</SelectItem>
                                        <SelectItem value="120">2 hours before</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {medicineName && dosage && times.some(t => t) && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-800">Reminder Preview</span>
                            </div>
                            <p className="text-sm text-green-700">
                                <strong>{medicineName}</strong> ({dosage}) - {frequency.replace('-', ' ')} at{' '}
                                {times.filter(t => t).join(', ')}
                                {emailReminder && ` with email reminders ${beforeMealMinutes} minutes before`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            if (!editingReminder) resetForm();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!medicineName.trim() || !dosage.trim() || !times.some(t => t.trim())}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {editingReminder ? 'Update Reminder' : 'Save Reminder'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
