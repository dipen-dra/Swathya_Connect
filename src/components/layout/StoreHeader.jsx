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
    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

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
        return `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8080"}${imagePath}`;
    };

    return (
        <header className={`fixed z-50 transition-all duration-700 w-full ${
            scrolled ? "top-4 px-4" : "top-0 px-0"
        }`}>
            <div className={`mx-auto transition-all duration-700 ${
                scrolled 
                    ? "max-w-7xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100/50 py-2" 
                    : "max-w-full bg-white border-b border-gray-100 py-3"
            }`}>
                <div className="flex flex-col">
                    {/* Main Header Row */}
                    <div className="container mx-auto flex h-14 items-center justify-between px-6 gap-4 md:gap-8">
                        {/* Left Section: Logo & Title */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <img
                                src={Logo}
                                alt="Swasthya Connect"
                                className={`transition-all duration-700 ${scrolled ? "h-8" : "h-9"} object-contain cursor-pointer`}
                                onClick={() => navigate('/')}
                            />
                            <div className="h-6 w-px bg-gray-200 hidden xl:block"></div>
                            <span className="font-bold text-gray-700 hidden xl:block text-lg whitespace-nowrap">Swasthya Connect Store</span>
                        </div>

                        {/* Middle Section: Search Bar (Desktop) */}
                        <div className="hidden md:flex flex-1 max-w-2xl relative group items-center">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Search medicines, categories, or brands..."
                                className="pl-10 pr-10 h-10 bg-gray-50 border-gray-100 focus:bg-white focus:border-teal-500 transition-all rounded-xl w-full text-sm shadow-sm hover:shadow-md focus:shadow-md"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>

                        {/* Right Section: Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {/* Dashboard Toggle - Only for Patients */}
                            {user?.role === 'patient' && (
                                <div className="hidden md:block mr-2">
                                    <DashboardToggle />
                                </div>
                            )}

                            <Button
                                variant="ghost"
                                onClick={() => navigate('/home')}
                                className="hidden lg:flex text-gray-600 hover:text-teal-600 font-medium"
                            >
                                Home
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="relative rounded-xl border-gray-200 hover:bg-gray-50 hover:text-teal-600 transition-colors shadow-sm"
                                onClick={() => navigate('/cart')}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>

                            {user?.role === 'patient' && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setShowRequestMedicine(true)}
                                    className="hidden lg:flex bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 transition-all active:scale-95"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Prescription
                                </Button>
                            )}

                            {user ? (
                                <DropdownMenu onOpenChange={setIsDropdownOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center space-x-2 px-2 py-1.5 h-auto rounded-xl hover:bg-gray-100 transition-colors">
                                            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                                                <AvatarImage src={getImageUrl(profile?.profileImage)} />
                                                <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-blue-500 text-white text-xs">
                                                    {(profile?.firstName?.[0] || user?.name?.[0] || 'U')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="hidden sm:flex flex-col items-start text-xs">
                                                <span className="font-semibold text-gray-700">
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
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 px-6 h-10 transition-all active:scale-95"
                                >
                                    Get Started
                                </Button>
                            )}
                        </div>
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
