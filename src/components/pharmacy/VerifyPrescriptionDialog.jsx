import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { medicineOrderAPI } from '@/services/api';

export function VerifyPrescriptionDialog({ open, onOpenChange, order, onVerified }) {
    const [medicines, setMedicines] = useState([{
        name: '',
        dosage: '',
        quantity: 1,
        pricePerUnit: 0
    }]);
    const [deliveryCharges, setDeliveryCharges] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPrescription, setShowPrescription] = useState(false);

    const addMedicine = () => {
        setMedicines([...medicines, {
            name: '',
            dosage: '',
            quantity: 1,
            pricePerUnit: 0
        }]);
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

    const calculateSubtotal = () => {
        return medicines.reduce((sum, med) => {
            return sum + (parseFloat(med.quantity) || 0) * (parseFloat(med.pricePerUnit) || 0);
        }, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + (parseFloat(deliveryCharges) || 0);
    };

    const handleVerify = async () => {
        // Validation
        const invalidMedicine = medicines.find(med =>
            !med.name.trim() || !med.dosage.trim() || med.quantity <= 0 || med.pricePerUnit <= 0
        );

        if (invalidMedicine) {
            toast.error('Please fill all medicine details correctly');
            return;
        }

        try {
            setLoading(true);

            const response = await medicineOrderAPI.verifyPrescription(order._id, {
                medicines,
                deliveryCharges: parseFloat(deliveryCharges) || 0
            });

            if (response.data.success) {
                toast.success('Prescription verified and bill sent to patient!');
                onVerified();
                onOpenChange(false);
                // Reset form
                setMedicines([{ name: '', dosage: '', quantity: 1, pricePerUnit: 0 }]);
                setDeliveryCharges(0);
            }
        } catch (error) {
            console.error('Error verifying prescription:', error);
            toast.error(error.response?.data?.message || 'Failed to verify prescription');
        } finally {
            setLoading(false);
        }
    };

    const getPrescriptionUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
    };

    if (!order) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Verify Prescription & Create Bill</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Patient Info */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-gray-900 mb-2">Patient Information</h3>
                            <p className="text-sm text-gray-700">Name: {order.patientId?.fullName}</p>
                            <p className="text-sm text-gray-700">Delivery: {order.deliveryAddress}</p>
                            {order.deliveryNotes && (
                                <p className="text-sm text-gray-600 mt-1">Notes: {order.deliveryNotes}</p>
                            )}
                        </div>

                        {/* Prescription Image */}
                        <div className="space-y-2">
                            <Label>Prescription</Label>
                            <div className="relative border rounded-lg overflow-hidden">
                                <img
                                    src={getPrescriptionUrl(order.prescriptionImage)}
                                    alt="Prescription"
                                    className="w-full h-64 object-contain bg-gray-50 cursor-pointer"
                                    onClick={() => setShowPrescription(true)}
                                />
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="absolute top-2 right-2"
                                    onClick={() => setShowPrescription(true)}
                                >
                                    <ZoomIn className="h-4 w-4 mr-1" />
                                    View Full
                                </Button>
                            </div>
                        </div>

                        {/* Medicines */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Medicines</Label>
                                <Button size="sm" onClick={addMedicine} variant="outline">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Medicine
                                </Button>
                            </div>

                            {medicines.map((medicine, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Medicine {index + 1}</span>
                                        {medicines.length > 1 && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeMedicine(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Medicine Name *</Label>
                                            <Input
                                                placeholder="e.g., Paracetamol"
                                                value={medicine.name}
                                                onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Dosage *</Label>
                                            <Input
                                                placeholder="e.g., 500mg"
                                                value={medicine.dosage}
                                                onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Quantity *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={medicine.quantity}
                                                onChange={(e) => updateMedicine(index, 'quantity', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Price per Unit (NPR) *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={medicine.pricePerUnit}
                                                onChange={(e) => updateMedicine(index, 'pricePerUnit', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-gray-900">
                                            Total: NPR {((medicine.quantity || 0) * (medicine.pricePerUnit || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Delivery Charges */}
                        <div className="space-y-2">
                            <Label>Delivery Charges (NPR)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={deliveryCharges}
                                onChange={(e) => setDeliveryCharges(e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        {/* Bill Summary */}
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
                            <h3 className="font-semibold text-gray-900">Bill Summary</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">NPR {calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery Charges:</span>
                                <span className="font-medium">NPR {(parseFloat(deliveryCharges) || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total:</span>
                                <span className="text-purple-600">NPR {calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleVerify}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Approve & Send Bill'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Full Prescription View Dialog */}
            <Dialog open={showPrescription} onOpenChange={setShowPrescription}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Prescription Image</DialogTitle>
                    </DialogHeader>
                    <img
                        src={getPrescriptionUrl(order.prescriptionImage)}
                        alt="Prescription Full View"
                        className="w-full h-auto"
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
