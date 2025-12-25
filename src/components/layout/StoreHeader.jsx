import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DashboardToggle } from '@/components/layout/DashboardToggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    User,
    Settings,
    LogOut,
    Shield,
    Activity,
    ChevronDown,
    Search,
    ShoppingCart,
    Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import Logo from '@/assets/swasthyalogo.png';
import { RequestMedicineDialog } from '@/components/patient/RequestMedicineDialog';

export function StoreHeader({ cartCount, onSearchChange, searchValue }) {
    const { user, logout } = useAuth();
    const { profile } = useProfile();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showRequestMedicine, setShowRequestMedicine] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'patient': return <User className="h-4 w-4" />;
            case 'doctor': return <Activity className="h-4 w-4" />;
            case 'pharmacy': return <Shield className="h-4 w-4" />;
            case 'admin': return <Settings className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'patient': return 'bg-blue-100 text-blue-800';
            case 'doctor': return 'bg-green-100 text-green-800';
            case 'pharmacy': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100 shadow-sm">
            <div className="flex flex-col">
                {/* Top Row: Logo, Toggle, Actions */}
                <div className="container mx-auto flex h-16 items-center justify-between px-6 relative">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <img
                            src={Logo}
                            alt="Swasthya Connect"
                            className="w-auto h-10 object-contain cursor-pointer"
                            onClick={() => navigate('/')}
                        />
                        <div className="h-6 w-px bg-gray-200 hidden lg:block"></div>
                        <span className="font-bold text-gray-700 hidden lg:block text-lg">Swasthya Connect Store</span>
                    </div>

                    {/* Dashboard <-> Store Toggle (Absolutely Centered) - Only for Patients */}
                    {user?.role === 'patient' && (
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                            <DashboardToggle />
                        </div>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="relative rounded-xl border-gray-200 hover:bg-gray-50 hover:text-teal-600 transition-colors"
                            onClick={() => navigate('/cart')}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Button>

                        {/* Upload Prescription Button (Patients Only) */}
                        {user?.role === 'patient' && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setShowRequestMedicine(true)}
                                className="hidden lg:flex bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/20 rounded-full px-6 transition-all duration-300 transform hover:scale-105 font-medium"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Prescription
                            </Button>
                        )}

                        {user ? (
                            <DropdownMenu onOpenChange={setIsDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-2 px-2 py-1.5 h-auto rounded-xl hover:bg-gray-100">
                                        <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                                            <AvatarImage src={getImageUrl(profile?.profileImage)} />
                                            <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-blue-500 text-white text-xs">
                                                {(profile?.firstName?.[0] || user?.name?.[0] || 'U')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:flex flex-col items-start text-xs">
                                            <span className="font-medium text-gray-700">
                                                {profile?.firstName || user?.name?.split(' ')[0] || 'User'}
                                            </span>
                                        </div>
                                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 mt-2">
                                    <DropdownMenuLabel className="text-gray-900 font-semibold px-3 py-2">My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                    <DropdownMenuItem onClick={() => navigate(user.role === 'patient' ? '/dashboard/profile' : `/${user.role}/dashboard`)} className="cursor-pointer rounded-xl px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-teal-600 font-medium transition-colors focus:bg-gray-50 focus:text-teal-600">
                                        <User className="mr-3 h-4 w-4" /> Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/dashboard/medicine-orders')} className="cursor-pointer rounded-xl px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-teal-600 font-medium transition-colors focus:bg-gray-50 focus:text-teal-600">
                                        <Activity className="mr-3 h-4 w-4" /> My Orders
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                    <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-xl px-3 py-2.5 font-medium transition-colors">
                                        <LogOut className="mr-3 h-4 w-4" /> Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20"
                            >
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Search Bar */}
                <div className="container mx-auto px-6 pb-4">
                    <div className="max-w-3xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search medicines, categories, or brands..."
                            className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 transition-all rounded-xl w-full"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Sign Out Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut className="h-6 w-6 text-red-600" />
                            </div>
                            <AlertDialogTitle>Sign out?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Are you sure you want to sign out? You'll need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
                            Sign Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <RequestMedicineDialog
                open={showRequestMedicine}
                onOpenChange={setShowRequestMedicine}
            />
        </header>
    );
}
