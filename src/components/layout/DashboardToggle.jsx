import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardToggle() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();



    // Determine current mode based on path
    const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/doctor/dashboard') || location.pathname.includes('/pharmacy/dashboard') || location.pathname.includes('/admin/dashboard') || location.pathname === '/settings';
    const isStore = location.pathname.includes('/store') || location.pathname.includes('/cart') || location.pathname.includes('/patient/checkout');

    // Helper to get dashboard path based on role
    const getDashboardPath = () => {
        if (!user) return '/login';
        switch (user?.role) {
            case 'doctor': return '/doctor/dashboard';
            case 'pharmacy': return '/pharmacy-dashboard';
            case 'admin': return '/admin/dashboard';
            default: return '/dashboard';
        }
    };

    const handleDashboardClick = () => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: location.pathname } } });
            return;
        }
        navigate(getDashboardPath());
    };

    return (
        <div className="bg-gray-100/80 p-1 rounded-full flex items-center shadow-inner border border-gray-200/50">
            <button
                onClick={handleDashboardClick}
                className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ease-out",
                    isDashboard
                        ? "bg-white text-teal-700 shadow-sm ring-1 ring-gray-100"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
            >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
            </button>
            <button
                onClick={() => navigate('/store')}
                className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ease-out",
                    !isDashboard // Default to Store if not on dashboard (e.g. checkout, home)
                        ? "bg-white text-teal-700 shadow-sm ring-1 ring-gray-100"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
            >
                <ShoppingBag className="w-4 h-4" />
                <span>Store</span>
            </button>
        </div>
    );
}
