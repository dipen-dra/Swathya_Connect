import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            <div className="max-w-xl w-full text-center relative z-10 space-y-8">
                {/* 404 Illustration Area */}
                <div className="relative inline-block mb-6">
                    <h1 className="text-[180px] md:text-[240px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-teal-400/20 to-blue-500/20 select-none tracking-tighter">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/60 transform rotate-[-5deg] hover:rotate-0 transition-all duration-500 hover:scale-110 hover:shadow-teal-500/20 group">
                            <AlertCircle className="w-20 h-20 text-teal-500 group-hover:text-teal-600 transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-gray-500 max-w-sm mx-auto leading-relaxed font-medium">
                        The page you are looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="h-14 px-8 rounded-2xl border-2 border-gray-100 hover:border-teal-100 hover:bg-teal-50/50 text-gray-600 font-bold transition-all text-base"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Go Back
                    </Button>

                    <Button
                        onClick={() => navigate('/')}
                        className="h-14 px-8 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1 transition-all text-base"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Back to Home
                    </Button>
                </div>

                <div className="pt-16 flex justify-center gap-8 text-sm font-medium text-gray-400 border-t border-gray-100 mt-16 max-w-xs mx-auto">
                    <button onClick={() => navigate('/contact')} className="hover:text-teal-600 transition-colors hover:underline decoration-2 underline-offset-4">Support</button>
                    <button onClick={() => navigate('/store')} className="hover:text-teal-600 transition-colors hover:underline decoration-2 underline-offset-4">Store</button>
                    <button onClick={() => navigate('/login')} className="hover:text-teal-600 transition-colors hover:underline decoration-2 underline-offset-4">Login</button>
                </div>
            </div>
        </div>
    );
}
