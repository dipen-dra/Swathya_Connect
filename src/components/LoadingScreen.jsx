import React from 'react';
import Logo from '@/assets/swasthyalogo.png';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Loading content */}
            <div className="relative z-10 flex flex-col items-center space-y-8">
                {/* Logo with pulse animation */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 animate-ping"></div>
                    <img
                        src={Logo}
                        alt="Swasthya Connect"
                        className="relative h-32 w-auto object-contain animate-pulse-slow"
                    />
                </div>

                {/* App name */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
                        Swasthya Connect
                    </h1>
                    <p className="text-gray-600 text-sm animate-fade-in animation-delay-500">
                        Healthcare at your fingertips
                    </p>
                </div>

                {/* Loading spinner */}
                <div className="flex items-center space-x-2 animate-fade-in animation-delay-1000">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce animation-delay-400"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
