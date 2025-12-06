import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, Phone, MessageCircle, Calendar as CalendarIcon, Clock, CreditCard, Stethoscope, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConsultationTypeDialog({ open, onOpenChange, doctor, onConfirm }) {
    const [selectedType, setSelectedType] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');

    if (!doctor) return null;

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath; // Already a full URL
        return `http://localhost:5000${imagePath}`; // Prepend backend URL
    };

    const consultationTypes = [
        {
            id: 'video',
            name: 'Video',
            subtitle: 'Consultation',
            icon: Video,
            price: doctor.consultationFee,
            duration: '30 minutes',
            description: 'Face-to-face video call with the doctor',
            features: ['HD Video Call', 'Screen Sharing', 'Recording Available']
        },
        {
            id: 'audio',
            name: 'Audio',
            subtitle: 'Consultation',
            icon: Phone,
            price: Math.round(doctor.consultationFee * 0.8),
            duration: '25 minutes',
            description: 'Voice call consultation with the doctor',
            features: ['Clear Audio Call', 'Call Recording', 'Follow-up Notes']
        },
        {
            id: 'chat',
            name: 'Text',
            subtitle: 'Consultation',
            icon: MessageCircle,
            price: Math.round(doctor.consultationFee * 0.6),
            duration: '24 hours',
            description: 'Text-based consultation over 24 hours',
            features: ['Instant Messaging', 'Photo Sharing', 'Prescription Upload']
        }
    ];

    const timeSlots = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
    ];

    // Generate next 30 days for date selection
    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                })
            });
        }
        return dates;
    };

    const availableDates = getAvailableDates();

    const handleConfirm = () => {
        if (!selectedType || !selectedDate || !selectedTime || !reason.trim()) {
            return;
        }

        const selectedConsultationType = consultationTypes.find(type => type.id === selectedType);

        onConfirm({
            type: selectedType,
            date: selectedDate,
            time: selectedTime,
            reason: reason.trim(),
            fee: selectedConsultationType?.price || 0
        });

        // Reset form
        setSelectedType('');
        setSelectedDate('');
        setSelectedTime('');
        setReason('');
    };

    const selectedConsultationType = consultationTypes.find(type => type.id === selectedType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <span>Book Consultation with {doctor.name}</span>
                    </DialogTitle>
                    <DialogDescription className="text-base text-gray-600">
                        Choose your preferred consultation method and schedule your appointment
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Doctor Information */}
                        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border border-purple-200">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                                    <AvatarImage src={getImageUrl(doctor.image)} alt={doctor.name} />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-2xl">
                                        {doctor.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                                    <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                        <span>{doctor.experience} years experience</span>
                                        <span>•</span>
                                        <span>Rating: {doctor.rating}/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Consultation Types */}
                        <div>
                            <h3 className="text-base font-semibold mb-4 flex items-center space-x-2 text-gray-700">
                                <Video className="h-5 w-5 text-blue-600" />
                                <span>Select Consultation Type</span>
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {consultationTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = selectedType === type.id;
                                    return (
                                        <div
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={cn(
                                                "p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white",
                                                isSelected
                                                    ? "border-blue-500 shadow-lg"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                                            )}
                                        >
                                            <div className="text-center space-y-3">
                                                <div className={cn(
                                                    "w-14 h-14 mx-auto rounded-lg flex items-center justify-center",
                                                    isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                                                )}>
                                                    <Icon className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-base text-gray-900">{type.name}</h4>
                                                    <h4 className="font-semibold text-base text-gray-900">{type.subtitle}</h4>
                                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{type.description}</p>
                                                </div>
                                                <div className="space-y-1 pt-2">
                                                    <div className="text-2xl font-bold text-blue-600">NPR {type.price}</div>
                                                    <div className="text-xs text-gray-500">{type.duration}</div>
                                                </div>
                                                <div className="space-y-1 pt-2 border-t border-gray-100">
                                                    {type.features.map((feature, index) => (
                                                        <div key={index} className="text-xs text-gray-600 flex items-center justify-center">
                                                            <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                                                            {feature}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Date and Time Selection */}
                        {selectedType && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700">Select Date</span>
                                    </div>
                                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                                        <SelectTrigger className="h-11 bg-white border-gray-200">
                                            <SelectValue placeholder="Choose a date" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {availableDates.map((date) => (
                                                <SelectItem key={date.value} value={date.value}>
                                                    {date.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700">Select Time</span>
                                    </div>
                                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                                        <SelectTrigger className="h-11 bg-white border-gray-200">
                                            <SelectValue placeholder="Choose time slot" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Reason for Consultation */}
                        {selectedType && (
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <MessageCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-semibold text-gray-700">Reason for Consultation</span>
                                </div>
                                <Textarea
                                    placeholder="Please describe your symptoms or reason for consultation..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="min-h-[100px] resize-none bg-white border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column - Booking Summary */}
                    <div>
                        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 sticky top-0">
                            <h3 className="text-base font-semibold mb-4 flex items-center space-x-2 text-gray-700">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <span>Booking Summary</span>
                            </h3>

                            {selectedConsultationType ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-sm text-gray-600">Consultation Type</span>
                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                            {selectedConsultationType.name} {selectedConsultationType.subtitle}
                                        </Badge>
                                    </div>

                                    {selectedDate && (
                                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                            <span className="text-sm text-gray-600">Date</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(selectedDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}

                                    {selectedTime && (
                                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                            <span className="text-sm text-gray-600">Time</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedTime}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="text-sm text-gray-600">Duration</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedConsultationType.duration}</span>
                                    </div>

                                    <div className="flex items-center justify-between py-3 bg-blue-50 rounded-lg px-4 mt-4">
                                        <span className="font-semibold text-gray-900">Total Fee</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            NPR {selectedConsultationType.price}
                                        </span>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <h4 className="font-medium text-gray-900 text-sm">What's Included:</h4>
                                        <ul className="space-y-2">
                                            {selectedConsultationType.features.map((feature, index) => (
                                                <li key={index} className="flex items-center text-xs text-gray-600">
                                                    <CheckCircle className="h-3 w-3 text-blue-600 mr-2 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Video className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm text-gray-500">
                                        Select a consultation type to see booking details
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-8 py-2 border-gray-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedType || !selectedDate || !selectedTime || !reason.trim()}
                        className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Confirm Booking
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
