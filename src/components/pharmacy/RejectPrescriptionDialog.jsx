import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { medicineOrderAPI } from '@/services/api';

export function RejectPrescriptionDialog({ open, onOpenChange, order, onRejected }) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReject = async () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            setLoading(true);

            const response = await medicineOrderAPI.rejectPrescription(order._id, reason);

            if (response.data.success) {
                toast.success('Prescription rejected');
                onRejected();
                onOpenChange(false);
                setReason('');
            }
        } catch (error) {
            console.error('Error rejecting prescription:', error);
            toast.error(error.response?.data?.message || 'Failed to reject prescription');
        } finally {
            setLoading(false);
        }
    };

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Reject Prescription</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-sm text-red-800">
                            You are about to reject the prescription from <strong>{order.patientId?.fullName}</strong>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Reason for Rejection *</Label>
                        <Textarea
                            placeholder="Please provide a clear reason for rejection..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            required
                        />
                        <p className="text-xs text-gray-500">
                            This reason will be shown to the patient
                        </p>
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                setReason('');
                            }}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? 'Rejecting...' : 'Reject Prescription'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
