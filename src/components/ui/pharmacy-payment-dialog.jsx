import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle, ArrowRight, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paymentAPI } from '@/services/api';

export function PharmacyPaymentDialog({ open, onOpenChange, orderDetails, onPaymentSuccess, onPaymentError }) {
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Load Khalti checkout script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    if (!orderDetails) return null;

    const paymentMethods = [
        {
            id: 'khalti',
            name: 'Khalti',
            logo: 'https://dao578ztqooau.cloudfront.net/static/img/logo1.png',
            description: 'Pay with Khalti wallet',
            bgColor: 'from-purple-500 to-purple-600',
            borderColor: 'border-purple-200',
            hoverColor: 'hover:border-purple-400'
        },
        {
            id: 'esewa',
            name: 'eSewa',
            logo: 'https://esewa.com.np/common/images/esewa_logo.png',
            description: 'Pay with eSewa wallet',
            bgColor: 'from-green-500 to-green-600',
            borderColor: 'border-green-200',
            hoverColor: 'hover:border-green-400'
        }
    ];

    const handleKhaltiPayment = async () => {
        try {
            setIsProcessing(true);

            // Temporarily hide the payment dialog to prevent z-index conflicts
            onOpenChange(false);

            // Generate temporary order ID for payment tracking
            const tempOrderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const khaltiConfig = {
                publicKey: "test_public_key_617c4c6fe77c441d88451ec1408a0c0e",
                productIdentity: tempOrderId,
                productName: `Medicine Order from ${orderDetails.pharmacyName}`,
                productUrl: window.location.href,
                eventHandler: {
                    async onSuccess(payload) {
                        console.log('Khalti payment success:', payload);

                        // Redirect immediately to success page (like consultations)
                        const params = new URLSearchParams({
                            token: payload.token,
                            amount: payload.amount
                        });

                        // Store order data temporarily
                        sessionStorage.setItem('khaltiMedicineOrderData', JSON.stringify(orderDetails));

                        // Immediate redirect - no waiting!
                        window.location.href = `/khalti-medicine-success?${params.toString()}`;
                    },
                    onError: (error) => {
                        console.error('Khalti payment error:', error);
                        onPaymentError('Payment process was interrupted');
                        setIsProcessing(false);
                        onOpenChange(true);
                    },
                    onClose: () => {
                        console.log('Khalti widget closed');
                        setIsProcessing(false);
                        onOpenChange(true);
                    },
                },
                paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
            };

            const checkout = new window.KhaltiCheckout(khaltiConfig);
            checkout.show({ amount: orderDetails.amount * 100 }); // Amount in paisa
        } catch (error) {
            console.error('Error initializing Khalti:', error);
            onPaymentError('Failed to initialize Khalti payment');
            setIsProcessing(false);
            onOpenChange(true);
        }
    };

    const handleEsewaPayment = async () => {
        try {
            setIsProcessing(true);

            // Pass order data instead of orderId
            const response = await paymentAPI.initiateEsewaMedicine(orderDetails);

            if (response.data.success) {
                const esewaData = response.data.data;

                // Create and submit eSewa form
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = esewaData.ESEWA_URL;

                Object.keys(esewaData).forEach(key => {
                    if (key !== 'ESEWA_URL') {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = esewaData[key];
                        form.appendChild(input);
                    }
                });

                document.body.appendChild(form);
                form.submit();
            } else {
                onPaymentError('Failed to initiate eSewa payment');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('eSewa initiation error:', error);
            onPaymentError(error.response?.data?.message || 'Failed to initiate eSewa payment');
            setIsProcessing(false);
        }
    };

    const handlePayment = () => {
        if (!selectedPayment) return;

        if (selectedPayment === 'khalti') {
            handleKhaltiPayment();
        } else if (selectedPayment === 'esewa') {
            handleEsewaPayment();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3 text-2xl">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Pill className="h-5 w-5 text-purple-600" />
                        </div>
                        <span>Select Payment Method</span>
                    </DialogTitle>
                    <DialogDescription className="text-base text-gray-600">
                        Choose your preferred payment method to complete the medicine order
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Pharmacy:</span>
                                <span className="font-medium text-gray-900">{orderDetails.pharmacyName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-medium text-gray-900 font-mono text-xs">{orderDetails.orderId}</span>
                            </div>
                            {orderDetails.medicineCount && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Items:</span>
                                    <span className="font-medium text-gray-900">{orderDetails.medicineCount} medicine(s)</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-3 border-t border-purple-300">
                                <span className="text-gray-900 font-semibold">Total Amount:</span>
                                <span className="text-xl font-bold text-purple-600">NPR {orderDetails.amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => !isProcessing && setSelectedPayment(method.id)}
                                    className={cn(
                                        "relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200",
                                        isProcessing ? "opacity-50 cursor-not-allowed" : "",
                                        selectedPayment === method.id
                                            ? `${method.borderColor} bg-gradient-to-br ${method.bgColor} bg-opacity-5`
                                            : `border-gray-200 ${method.hoverColor} hover:shadow-md`
                                    )}
                                >
                                    {/* Selection Indicator */}
                                    {selectedPayment === method.id && (
                                        <div className="absolute top-3 right-3">
                                            <div className={`w-6 h-6 bg-gradient-to-br ${method.bgColor} rounded-full flex items-center justify-center`}>
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Method Content */}
                                    <div className="space-y-4">
                                        {/* Logo */}
                                        <div className="h-16 flex items-center justify-center bg-white rounded-lg border border-gray-100 p-3">
                                            <img
                                                src={method.logo}
                                                alt={method.name}
                                                className="max-h-12 max-w-full object-contain"
                                            />
                                        </div>

                                        {/* Method Info */}
                                        <div className="text-center">
                                            <h4 className="font-semibold text-gray-900 mb-1">{method.name}</h4>
                                            <p className="text-sm text-gray-600">{method.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-600">
                            <p className="font-medium text-gray-900 mb-1">Secure Payment</p>
                            <p>Your payment information is encrypted and secure. You will be redirected to the payment gateway.</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => !isProcessing && onOpenChange(false)}
                        disabled={isProcessing}
                        className="px-8 py-2 border-gray-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePayment}
                        disabled={!selectedPayment || isProcessing}
                        className="px-8 py-2 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                        {!isProcessing && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
