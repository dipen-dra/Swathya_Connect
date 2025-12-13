import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { prescriptionsAPI } from '@/services/api';

export default function PrescriptionPreview({ open, onOpenChange, consultationId }) {
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [prescription, setPrescription] = useState(null);

    useEffect(() => {
        if (open && consultationId) {
            fetchPrescription();
        }
    }, [open, consultationId]);

    const fetchPrescription = async () => {
        setLoading(true);
        try {
            const response = await prescriptionsAPI.getByConsultation(consultationId);
            if (response.data.success) {
                setPrescription(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching prescription:', error);
            toast.error('Failed to load prescription');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!prescription) return;

        setDownloading(true);
        try {
            const response = await prescriptionsAPI.downloadPDF(prescription._id);

            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `prescription-${prescription._id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Prescription downloaded successfully!');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download prescription');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <span>Digital Prescription</span>
                    </DialogTitle>
                    <DialogDescription>
                        View and download your prescription
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    </div>
                ) : prescription ? (
                    <div className="space-y-6 py-4">
                        {/* Diagnosis */}
                        {prescription.diagnosis && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Diagnosis</h4>
                                <p className="text-sm text-gray-900">{prescription.diagnosis}</p>
                            </div>
                        )}

                        {/* Medicines */}
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Prescribed Medicines</h4>
                            <div className="space-y-3">
                                {prescription.medicines.map((medicine, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <h5 className="font-semibold text-gray-900">{index + 1}. {medicine.name}</h5>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Dosage:</span>
                                                <span className="ml-2 text-gray-900">{medicine.dosage}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Frequency:</span>
                                                <span className="ml-2 text-gray-900">{medicine.frequency}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="ml-2 text-gray-900">{medicine.duration}</span>
                                            </div>
                                            {medicine.instructions && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-600">Instructions:</span>
                                                    <span className="ml-2 text-gray-900">{medicine.instructions}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Notes */}
                        {prescription.additionalNotes && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Additional Notes</h4>
                                <p className="text-sm text-gray-900">{prescription.additionalNotes}</p>
                            </div>
                        )}

                        {/* Download Button */}
                        <div className="pt-4 border-t">
                            <Button
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No prescription found
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
