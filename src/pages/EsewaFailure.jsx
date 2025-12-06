import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function EsewaFailure() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                </div>

                {/* Error Message */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-red-900 mb-2">
                        Payment Failed
                    </h1>
                    <p className="text-gray-600">
                        Your payment could not be processed. This could be due to insufficient balance,
                        cancellation, or a technical issue.
                    </p>
                </div>

                {/* Error Details */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-red-900 mb-2">What happened?</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                        <li>• Payment was cancelled or declined</li>
                        <li>• No amount has been deducted</li>
                        <li>• Your consultation was not booked</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/dashboard/doctors')}
                        className="w-full py-3 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center space-x-2"
                    >
                        <RefreshCw className="h-5 w-5" />
                        <span>Try Again</span>
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 px-4 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Return to Dashboard</span>
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                        Need help? Contact our support team
                    </p>
                </div>

                {/* Payment Method Badge */}
                <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm text-gray-500">Payment attempted via</span>
                        <img
                            src="https://esewa.com.np/common/images/esewa_logo.png"
                            alt="eSewa"
                            className="h-6"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
