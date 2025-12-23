import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useNotifications } from '@/contexts/NotificationContext';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
    User,
    Settings,
    LogOut,
    Bell,
    Shield,
    Activity,
    ChevronDown,
    Heart,
    Check,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/swasthyalogo.png';

export default function Header() {
    const { user, logout } = useAuth();
    const { profile } = useProfile();
    const { unreadCount, notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    const handleLogout = async () => {
        setShowLogoutDialog(false);
        await logout();
        toast.success('Signed out successfully');
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

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath; // Already a full URL
        return `http://localhost:5000${imagePath}`; // Prepend backend URL
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                    <img
                        src={Logo}
                        alt="Swasthya Connect Logo"
                        className="w-auto h-16 object-contain cursor-pointer"
                        onClick={() => navigate('/')}
                    />
                </div>

                {/* Dashboard <-> Store Toggle - Only for Patients */}
                {user?.role === 'patient' && (
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                        <DashboardToggle />
                    </div>
                )}

                {/* User Actions */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-0 mt-2 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                <div className="flex items-center space-x-3 text-sm">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAllAsRead();
                                            }}
                                            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Mark all read</span>
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearAll();
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-gray-500">
                                        <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                        <p className="font-medium">No notifications yet</p>
                                        <p className="text-xs mt-1">We'll notify you when something arrives</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 pr-3">
                                                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {getTimeAgo(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {!notification.read && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markAsRead(notification.id);
                                                                }}
                                                                className="text-green-600 hover:text-green-700"
                                                                title="Mark as read"
                                                            >
                                                                <Check className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                            className="text-red-500 hover:text-red-600"
                                                            title="Delete"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu onOpenChange={setIsDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 h-auto">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={getImageUrl(profile?.profileImage)} />
                                    <AvatarFallback className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                        {(profile?.firstName?.[0] || user?.name?.[0] || 'P')}
                                        {(profile?.lastName?.[0] || user?.name?.split(' ')[1]?.[0] || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium">
                                        {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : (user?.name || 'patient')}
                                    </span>
                                    <Badge variant="secondary" className={`text-xs ${getRoleColor(user?.role || 'patient')} border-0`}>
                                        <span className="flex items-center space-x-1">
                                            {getRoleIcon(user?.role || 'patient')}
                                            <span className="capitalize">{user?.role || 'Patient'}</span>
                                        </span>
                                    </Badge>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" alignOffset={-10} className="w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 mt-2">
                            <DropdownMenuLabel className="text-gray-900 font-semibold px-3 py-2">My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100 my-1" />
                            <DropdownMenuItem
                                onClick={() => {
                                    // Admin exception - show coming soon toast
                                    if (user?.role === 'admin') {
                                        toast.info('Coming Soon', {
                                            description: 'Admin profile settings are under development'
                                        });
                                        return;
                                    }

                                    // Navigate based on user role
                                    if (user?.role === 'doctor') {
                                        navigate('/doctor/dashboard'); // Doctor dashboard has profile tab
                                    } else if (user?.role === 'pharmacy') {
                                        navigate('/pharmacy-dashboard');
                                    } else {
                                        navigate('/dashboard/profile'); // Patient profile
                                    }
                                }}

                                className="cursor-pointer rounded-xl px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-teal-600 font-medium transition-colors focus:bg-gray-50 focus:text-teal-600"
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile Settings</span>
                            </DropdownMenuItem>

                            {/* Hide Account Settings for admin */}
                            {user?.role !== 'admin' && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => navigate('/settings')}
                                        className="cursor-pointer rounded-xl px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-teal-600 font-medium transition-colors focus:bg-gray-50 focus:text-teal-600"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Account Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                </>
                            )}

                            {/* Show separator for admin before Sign Out */}
                            {user?.role === 'admin' && <DropdownMenuSeparator className="bg-gray-100 my-1" />}

                            <DropdownMenuItem
                                onClick={() => setShowLogoutDialog(true)}
                                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 rounded-xl px-3 py-2.5 font-medium transition-colors"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
        </header >
    );
}
