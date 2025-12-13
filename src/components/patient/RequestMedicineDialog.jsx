import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, FileImage, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { medicineOrderAPI } from '@/services/api';

export function RequestMedicineDialog({ open, onOpenChange, pharmacy }) {
    const [prescriptionFile, setPrescriptionFile] = useState(null);
    const [prescriptionPreview, setPrescriptionPreview] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type - accept images and PDFs
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload an image (PNG, JPG, WEBP) or PDF file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setPrescriptionFile(file);

        // Create preview only for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPrescriptionPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            // For PDFs, set preview to null
            setPrescriptionPreview(null);
        }
    };

    const handleRemoveFile = () => {
        setPrescriptionFile(null);
        setPrescriptionPreview(null);
    };

    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setFetchingLocation(true);
        toast.info('Fetching your location...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Use OpenStreetMap Nominatim API for reverse geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    if (data && data.display_name) {
                        setDeliveryAddress(data.display_name);
                        toast.success('Location fetched successfully!');
                    } else {
                        toast.error('Could not fetch address from location');
                    }
                } catch (error) {
                    console.error('Error fetching address:', error);
                    toast.error('Failed to fetch address');
                } finally {
                    setFetchingLocation(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setFetchingLocation(false);

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error('Location permission denied');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error('Location information unavailable');
                        break;
                    case error.TIMEOUT:
                        toast.error('Location request timed out');
                        break;
                    default:
                        toast.error('Failed to get location');
                }
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!prescriptionFile) {
            toast.error('Please upload a prescription');
            return;
        }

        if (!deliveryAddress.trim()) {
            toast.error('Please enter delivery address');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('prescription', prescriptionFile);
            formData.append('pharmacyId', pharmacy.userId);
            formData.append('deliveryAddress', deliveryAddress);
            if (deliveryNotes.trim()) {
                formData.append('deliveryNotes', deliveryNotes);
            }

            const response = await medicineOrderAPI.createOrder(formData);

            if (response.data.success) {
                toast.success('Prescription uploaded successfully! Waiting for pharmacy verification.');
                onOpenChange(false);
                // Reset form
                setPrescriptionFile(null);
                setPrescriptionPreview(null);
                setDeliveryAddress('');
                setDeliveryNotes('');
            }
        } catch (error) {
            console.error('Error creating medicine order:', error);
            toast.error(error.response?.data?.message || 'Failed to upload prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg bg-white">
                <DialogHeader>
                    <DialogTitle>Request Medicine</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Pharmacy Info */}
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-sm text-gray-600">Requesting from:</p>
                        <p className="font-semibold text-gray-900">{pharmacy?.name}</p>
                    </div>

                    {/* Prescription Upload */}
                    <div className="space-y-2">
                        <Label>Prescription Image *</Label>
                        {!prescriptionFile ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*,.pdf,application/pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="prescription-upload"
                                />
                                <label htmlFor="prescription-upload" className="cursor-pointer">
                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Click to upload prescription</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP, PDF (Max 5MB)</p>
                                </label>
                            </div>
                        ) : (
                            <div className="relative border rounded-lg p-4 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
                                >
                                    <X className="h-4 w-4 text-red-600" />
                                </button>
                                <div className="flex items-center space-x-3">
                                    {prescriptionPreview ? (
                                        <img
                                            src={prescriptionPreview}
                                            alt="Prescription preview"
                                            className="h-20 w-20 object-cover rounded"
                                        />
                                    ) : (
                                        <FileImage className="h-20 w-20 text-gray-400" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{prescriptionFile.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {(prescriptionFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={fetchCurrentLocation}
                                disabled={fetchingLocation}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                                <MapPin className="h-4 w-4 mr-1" />
                                {fetchingLocation ? 'Fetching...' : 'Use Current Location'}
                            </Button>
                        </div>
                        <Textarea
                            id="deliveryAddress"
                            placeholder="Enter your complete delivery address"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            rows={3}
                            required
                        />
                    </div>

                    {/* Delivery Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="deliveryNotes">Special Instructions (Optional)</Label>
                        <Textarea
                            id="deliveryNotes"
                            placeholder="Any special instructions for delivery"
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
