import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function KhaltiSuccess() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('success');
    const [message, setMessage] = useState('Payment successful! Your consultation has been booked.');
    const hasShownToast = useRef(false); // Prevent duplicate toast

    useEffect(() => {
        // Prevent duplicate toast (React StrictMode runs effects twice in dev)
        if (!hasShownToast.current) {
            toast.success('Khalti payment completed successfully!');
            hasShownToast.current = true;
        }

        // Redirect to consultations after 3 seconds
        const timer = setTimeout(() => {
            navigate('/dashboard/consultations');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const handleReturnToDashboard = () => {
        navigate('/dashboard/consultations');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center animate-scale-in">
                        <CheckCircle className="h-10 w-10 text-purple-600" />
                    </div>
                </div>

                {/* Status Message */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-purple-900 mb-2">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600">
                        {message}
                    </p>
                </div>

                {/* Success Details */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-purple-800 text-center">
                        Redirecting to your consultations in 3 seconds...
                    </p>
                </div>

                {/* Action Button */}
                <div className="space-y-3">
                    <button
                        onClick={handleReturnToDashboard}
                        className="w-full py-3 px-4 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                        View My Consultations
                    </button>
                </div>

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
