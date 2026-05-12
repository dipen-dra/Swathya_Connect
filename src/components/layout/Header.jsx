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
    X,
    Upload,
    Moon,
    Sun,
    CheckCircle2,
    Info,
    AlertTriangle,
    AlertCircle,
    Trash2,
    BellOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/swasthyalogo.png';
import { RequestMedicineDialog } from '@/components/patient/RequestMedicineDialog';

export default function Header() {
    const { user, logout } = useAuth();
    const { profile } = useProfile();
    const { unreadCount, notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [showRequestMedicine, setShowRequestMedicine] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

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
        return `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8080"}${imagePath}`; // Prepend backend URL
    };

    return (
        <header className={`fixed z-50 transition-all duration-700 w-full ${scrolled ? "top-4 px-4" : "top-0 px-0"
            }`}>
            <div className={`mx-auto transition-all duration-700 ${scrolled
                ? "max-w-7xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100/50 py-1"
                : "max-w-full bg-white border-b border-gray-100 py-3"
                }`}>
                <div className="container mx-auto flex h-14 items-center justify-between px-6">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <img
                            src={Logo}
                            alt="Swasthya Connect Logo"
                            className={`transition-all duration-700 ${scrolled ? "h-12" : "h-16"} object-contain cursor-pointer`}
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
                        {/* Upload Prescription Button - visible on desktop (Patients Only) */}
                        {user?.role === 'patient' && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setShowRequestMedicine(true)}
                                className="hidden lg:flex bg-teal-600 hover:bg-teal-700 text-white mr-4"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Prescription
                            </Button>
                        )}


                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative hidden lg:flex hover:bg-gray-100 transition-colors duration-200">
                                    <Bell className="h-5 w-5 text-gray-600" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 border-2 border-white animate-pulse">
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 mt-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                                {/* Header */}
                                <div className="px-5 py-4 border-b bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-bold text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <Badge className="bg-blue-600 text-white border-0 h-5 px-1.5 min-w-[20px] justify-center">
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs font-semibold">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAllAsRead();
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 transition-colors flex items-center"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                    Mark all read
                                                </button>
                                            )}
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearAll();
                                                    }}
                                                    className="text-gray-500 hover:text-red-600 transition-colors flex items-center"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                    Clear all
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Notifications List */}
                                <div className="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                    {notifications.length === 0 ? (
                                        <div className="py-16 px-6 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <BellOff className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-1">No notifications yet</h4>
                                            <p className="text-sm text-gray-500">We'll let you know when there's an update for you.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {notifications.map((notification) => {
                                                // Determine icon and color based on notification type
                                                let Icon = Bell;
                                                let iconColor = "text-blue-500 bg-blue-50";
                                                
                                                if (notification.type === 'success' || notification.title?.toLowerCase().includes('approved') || notification.title?.toLowerCase().includes('success')) {
                                                    Icon = CheckCircle2;
                                                    iconColor = "text-green-500 bg-green-50";
                                                } else if (notification.type === 'warning') {
                                                    Icon = AlertTriangle;
                                                    iconColor = "text-amber-500 bg-amber-50";
                                                } else if (notification.type === 'error' || notification.title?.toLowerCase().includes('failed') || notification.title?.toLowerCase().includes('cancelled')) {
                                                    Icon = AlertCircle;
                                                    iconColor = "text-red-500 bg-red-50";
                                                } else {
                                                    Icon = Info;
                                                    iconColor = "text-blue-500 bg-blue-50";
                                                }

                                                return (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => {
                                                            markAsRead(notification.id);
                                                            if (notification.actionUrl) {
                                                                navigate(notification.actionUrl);
                                                            }
                                                        }}
                                                        className={`group relative p-5 transition-all duration-200 cursor-pointer ${!notification.read ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${iconColor} transition-transform group-hover:scale-110`}>
                                                                <Icon className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h4 className={`text-sm font-bold truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                        {notification.title}
                                                                    </h4>
                                                                    <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap ml-2">
                                                                        {getTimeAgo(notification.createdAt)}
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                                    {notification.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Floating Actions on Hover */}
                                                        <div className="absolute top-4 right-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        markAsRead(notification.id);
                                                                    }}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                                    title="Mark as read"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteNotification(notification.id);
                                                                }}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                                title="Delete"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* Unread dot */}
                                                        {!notification.read && (
                                                            <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-blue-600"></div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                
                                {notifications.length > 5 && (
                                    <div className="p-3 border-t text-center">
                                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                            View all notifications
                                        </button>
                                    </div>
                                )}
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
                            <DropdownMenuContent align="end" alignOffset={-10} className="w-64">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
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
                                            navigate('/pharmacy-dashboard/profile');
                                        } else {
                                            navigate('/dashboard/profile'); // Patient profile
                                        }
                                    }}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile Settings</span>
                                </DropdownMenuItem>

                                {/* Hide Account Settings for admin */}
                                {user?.role !== 'admin' && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => navigate('/settings')}
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Account Settings</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}

                                {/* Show separator for admin before Sign Out */}
                                {user?.role === 'admin' && <DropdownMenuSeparator />}

                                <DropdownMenuItem
                                    onClick={() => setShowLogoutDialog(true)}
                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
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

                <RequestMedicineDialog
                    open={showRequestMedicine}
                    onOpenChange={setShowRequestMedicine}
                />
            </div>
        </header>
    );
}
