import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentAPI } from '@/services/api';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';

export default function KhaltiMedicineSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment...');
    const hasVerified = useRef(false); // Prevent duplicate verification calls

    useEffect(() => {
        const verifyPayment = async () => {
            // Prevent duplicate calls (React StrictMode runs effects twice in dev)
            if (hasVerified.current) return;
            hasVerified.current = true;

            try {
                const token = searchParams.get('token');
                const amount = searchParams.get('amount');
                const orderData = JSON.parse(sessionStorage.getItem('khaltiMedicineOrderData') || '{}');

                if (!token || !amount) {
                    setStatus('error');
                    setMessage('Invalid payment data received');
                    return;
                }

                // Clear session storage
                sessionStorage.removeItem('khaltiMedicineOrderData');

                // Call backend to verify payment
                const response = await paymentAPI.verifyKhaltiMedicine(token, amount, orderData);

                if (response.data.success) {
                    setStatus('success');
                    setMessage('Payment successful! Your medicine order has been placed.');

                    // Show success toast
                    toast.success('Khalti payment completed successfully!');

                    // Add notification
                    addNotification({
                        type: 'success',
                        title: 'Order Placed!',
                        message: 'Your medicine order has been successfully placed and paid via Khalti.'
                    });

                    // Redirect to dashboard after 3 seconds
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Payment verification failed');
                    toast.error('Payment verification failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage(error.response?.data?.message || 'An error occurred while verifying payment');
                toast.error('Payment verification failed');
            }
        };

        verifyPayment();
    }, [searchParams, navigate, addNotification]);

    const handleReturnToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Status Icon */}
                <div className="flex justify-center mb-6">
                    {status === 'verifying' && (
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center animate-scale-in">
                            <CheckCircle className="h-10 w-10 text-purple-600" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                    )}
                </div>

                {/* Status Message */}
                <div className="text-center mb-8">
                    <h1 className={`text-2xl font-bold mb-2 ${status === 'verifying' ? 'text-purple-900' :
                            status === 'success' ? 'text-purple-900' :
                                'text-red-900'
                        }`}>
                        {status === 'verifying' && 'Verifying Payment'}
                        {status === 'success' && 'Order Placed Successfully!'}
                        {status === 'error' && 'Payment Failed'}
                    </h1>
                    <p className="text-gray-600">
                        {message}
                    </p>
                </div>

                {/* Progress Indicator for Verifying */}
                {status === 'verifying' && (
                    <div className="mb-6">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                )}

                {/* Success Details */}
                {status === 'success' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-purple-800 text-center">
                            Redirecting to your dashboard in 3 seconds...
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                {status !== 'verifying' && (
                    <div className="space-y-3">
                        <button
                            onClick={handleReturnToDashboard}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${status === 'success'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {status === 'success' ? 'View Dashboard' : 'Return to Dashboard'}
                        </button>
                    </div>
                )}

                {/* Payment Method Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm text-gray-500">Paid via</span>
                        <img
                            src="https://dao578ztqooau.cloudfront.net/static/img/logo1.png"
                            alt="Khalti"
                            className="h-6"
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}
