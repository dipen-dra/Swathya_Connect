import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { prescriptionsAPI } from '@/services/api';

const FREQUENCY_OPTIONS = [
    'Once daily',
    'Twice daily',
    'Thrice daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
];

export default function PrescriptionDialog({ open, onOpenChange, consultation, doctorProfile, patientProfile }) {
    const [loading, setLoading] = useState(false);
    const [medicines, setMedicines] = useState([
        { name: '', dosage: '', frequency: 'Twice daily', duration: '', instructions: '' }
    ]);
    const [diagnosis, setDiagnosis] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setMedicines([{ name: '', dosage: '', frequency: 'Twice daily', duration: '', instructions: '' }]);
            setDiagnosis('');
            setAdditionalNotes('');
        }
    }, [open]);

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: 'Twice daily', duration: '', instructions: '' }]);
    };

    const removeMedicine = (index) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index));
        }
    };

    const updateMedicine = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const handleSubmit = async () => {
        // Validation
        if (medicines.some(m => !m.name || !m.dosage || !m.duration)) {
            toast.error('Please fill in all medicine details (name, dosage, duration)');
            return;
        }

        setLoading(true);
        try {
            const response = await prescriptionsAPI.create({
                consultationId: consultation._id,
                medicines,
                diagnosis,
                additionalNotes
            });

            if (response.data.success) {
                toast.success('Prescription created successfully!');
                onOpenChange(false);
                // Reload to fetch updated consultation with prescription data
                window.location.reload();
            }
        } catch (error) {
            console.error('Error creating prescription:', error);
            toast.error(error.response?.data?.message || 'Failed to create prescription');
        } finally {
            setLoading(false);
        }
    };

    if (!consultation || !patientProfile) return null;

    const patientAge = patientProfile.dateOfBirth
        ? Math.floor((new Date() - new Date(patientProfile.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : 'N/A';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <span>Create Digital Prescription</span>
                    </DialogTitle>
                    <DialogDescription>
                        Create a digital prescription for this consultation
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Auto-filled Patient & Doctor Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Patient Information</h4>
                            <p className="text-sm"><span className="font-medium">Name:</span> {patientProfile.firstName} {patientProfile.lastName}</p>
                            <p className="text-sm"><span className="font-medium">Age:</span> {patientAge} | <span className="font-medium">Gender:</span> {patientProfile.gender}</p>
                            <p className="text-sm"><span className="font-medium">Date:</span> {new Date(consultation.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Doctor Information</h4>
                            <p className="text-sm"><span className="font-medium">Dr.</span> {doctorProfile?.firstName} {doctorProfile?.lastName}</p>
                            <p className="text-sm"><span className="font-medium">Specialty:</span> {doctorProfile?.specialty || 'General Physician'}</p>
                            <p className="text-sm"><span className="font-medium">License:</span> {doctorProfile?.licenseNumber || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div>
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Textarea
                            id="diagnosis"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Enter diagnosis..."
                            className="mt-2"
                            rows={2}
                        />
                    </div>

                    {/* Medicines */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label>Medicines</Label>
                            <Button
                                type="button"
                                size="sm"
                                onClick={addMedicine}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Medicine
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {medicines.map((medicine, index) => (
                                <div key={index} className="p-4 border-2 border-gray-200 rounded-lg space-y-3 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <h5 className="font-semibold text-sm text-gray-700 flex items-center">
                                            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs flex items-center justify-center mr-2">
                                                {index + 1}
                                            </span>
                                            Medicine {index + 1}
                                        </h5>
                                        {medicines.length > 1 && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => removeMedicine(index)}
                                                className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-colors duration-200"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Medicine Name *</Label>
                                            <Input
                                                value={medicine.name}
                                                onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                                placeholder="e.g., Paracetamol"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Dosage *</Label>
                                            <Input
                                                value={medicine.dosage}
                                                onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                                placeholder="e.g., 500mg"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Frequency *</Label>
                                            <Select
                                                value={medicine.frequency}
                                                onValueChange={(value) => updateMedicine(index, 'frequency', value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FREQUENCY_OPTIONS.map((freq) => (
                                                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs">Duration *</Label>
                                            <Input
                                                value={medicine.duration}
                                                onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                                placeholder="e.g., 7 days"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs">Instructions (Optional)</Label>
                                        <Input
                                            value={medicine.instructions}
                                            onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                            placeholder="e.g., Take after meals"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                        <Textarea
                            id="additionalNotes"
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="Any additional instructions or notes..."
                            className="mt-2"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Prescription'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
