import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, FileText } from 'lucide-react';

export default function DocumentRejectDialog({ open, onClose, onConfirm, document, processing }) {
    const [rejectionReason, setRejectionReason] = React.useState('');
    const [error, setError] = React.useState('');

    const handleSubmit = () => {
        if (!rejectionReason.trim()) {
            setError('Please provide a rejection reason');
            return;
        }
        setError('');
        onConfirm(rejectionReason);
        setRejectionReason('');
    };

    const handleClose = () => {
        setRejectionReason('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span>Reject Document</span>
                    </DialogTitle>
                    <DialogDescription>
                        {document && (
                            <div className="flex items-center space-x-2 mt-1">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="font-semibold text-gray-700">{document.documentName || 'Professional Document'}</span>
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="doc-reason" className="text-sm font-medium">
                            Why is this document being rejected? <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="doc-reason"
                            value={rejectionReason}
                            onChange={(e) => {
                                setRejectionReason(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., Image is blurry, expired license, wrong document type..."
                            className="mt-2"
                            rows={4}
                            disabled={processing}
                        />
                        {error && (
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        )}
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        disabled={processing}
                    >
                        {processing ? 'Rejecting...' : 'Reject Document'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
