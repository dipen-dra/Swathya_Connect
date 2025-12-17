import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useConsultations } from '@/contexts/ConsultationContext';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Calendar,
    Clock,
    MapPin,
    Star,
    Search,
    Stethoscope,
    Phone,
    Mail,
    CreditCard,
    Video,
    CheckCircle,
    Check,
    Timer,
    Filter,
    SortAsc,
    Activity,
    TrendingUp,
    Heart,
    Shield,
    Award,
    Users,
    MessageCircle,
    User,
    Settings,
    LogOut,
    Bell,
    Pill,
    Plus,
    Edit3,
    Trash2,
    AlertCircle,
    FileText,
    Download
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ChatConsultationDialog from '@/components/ChatConsultationDialog';
import AudioConsultationDialog from '@/components/AudioConsultationDialog';
import { Textarea } from '@/components/ui/textarea';
import { ConsultationTypeDialog } from '@/components/ui/consultation-type-dialog';
import { PaymentDialog } from '@/components/ui/payment-dialog';
import { PharmacyPaymentDialog } from '@/components/ui/pharmacy-payment-dialog';
import { PharmacyChat } from '@/components/ui/pharmacy-chat';
import { MedicineReminderDialog } from '@/components/ui/medicine-reminder-dialog';
import { RequestMedicineDialog } from '@/components/patient/RequestMedicineDialog';
import { HealthRecordsTab } from '@/components/dashboard/tabs/HealthRecordsTab';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { doctorsAPI, consultationsAPI, statsAPI, pharmaciesAPI, chatAPI, medicineOrderAPI } from '@/services/api';
import Header from '@/components/layout/Header';
import { useReminders } from '@/contexts/RemindersContext';
import { prescriptionsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import PrescriptionPreview from '@/components/dashboard/PrescriptionPreview';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export function PatientDashboard() {
    const { user, logout } = useAuth();
    const { profile } = useProfile();
    const { socket, connected } = useSocket();
    const { addNotification } = useNotifications();
    const { reminders, createReminder, updateReminder, deleteReminder, toggleReminder } = useReminders();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Determine active tab from URL
    const getTabFromPath = (pathname) => {
        if (pathname.includes('/doctors')) return 'doctors';
        if (pathname.includes('/consultations')) return 'consultations';
        if (pathname.includes('/pharmacy')) return 'pharmacy';
        if (pathname.includes('/medicine-orders')) return 'medicine-orders';
        if (pathname.includes('/profile')) return 'profile';
        if (pathname.includes('/health-records')) return 'health-records';
        return 'doctors'; // default tab
    };

    const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

    // Update activeTab when URL changes
    useEffect(() => {
        setActiveTab(getTabFromPath(location.pathname));
    }, [location.pathname]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [consultationDialog, setConsultationDialog] = useState(false);
    const [paymentDialog, setPaymentDialog] = useState(false);
    const [pharmacyPaymentDialog, setPharmacyPaymentDialog] = useState(false);
    const [pendingBooking, setPendingBooking] = useState(null);
    const [pharmacyDialog, setPharmacyDialog] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [chats, setChats] = useState([]); // Store all patient chats
    const [medicineReminderDialog, setMedicineReminderDialog] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [requestMedicineDialog, setRequestMedicineDialog] = useState(false);
    const [selectedPharmacyForMedicine, setSelectedPharmacyForMedicine] = useState(null);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [ratingDialog, setRatingDialog] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [prescriptionDialog, setPrescriptionDialog] = useState(false);
    const [prescriptionConsultationId, setPrescriptionConsultationId] = useState(null);
    const [medicineOrders, setMedicineOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderDetailsDialog, setOrderDetailsDialog] = useState(false);
    const [selectedMedicineOrder, setSelectedMedicineOrder] = useState(null);
    const [chatDialogOpen, setChatDialogOpen] = useState(false);
    const [chatConsultationId, setChatConsultationId] = useState(null);
    const [audioDialogOpen, setAudioDialogOpen] = useState(false);
    const [audioConsultationId, setAudioConsultationId] = useState(null);
    const [audioConsultationData, setAudioConsultationData] = useState(null);

    // API data states
    const [doctors, setDoctors] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
    const [stats, setStats] = useState({
        totalConsultations: 0,
        upcomingConsultations: 0,
        completedConsultations: 0
    });
    const [consultations, setConsultations] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingPharmacies, setLoadingPharmacies] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingConsultations, setLoadingConsultations] = useState(true);

    // Fetch chats for unread indicators
    const fetchChats = async () => {
        try {
            const response = await chatAPI.getChats();
            setChats(response.data.chats || []);
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    const fetchMedicineOrders = async () => {
        try {
            setLoadingOrders(true);
            const response = await medicineOrderAPI.getPatientOrders();
            if (response.data.success) {
                setMedicineOrders(response.data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching medicine orders:', error);
            toast.error('Failed to load medicine orders');
        } finally {
            setLoadingOrders(false);
        }
    };

    // Doctor search and filter states
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    const welcomeNotificationShown = useRef(false);

    // Helper function to get full image URL

    // Get unique specialties for filter dropdown
    const uniqueSpecialties = ['all', ...new Set(doctors.map(d => d.specialty))];

    // Doctors are already filtered by API based on search and specialty
    const sortedDoctors = doctors;

    // Fetch data from API
    useEffect(() => {
        if (user) {
            fetchDoctors();
            fetchPharmacies();
            fetchConsultations();
            fetchChats(); // Fetch chats for unread indicators
        }
    }, [user]);

    // Listen for real-time chat updates via Socket.IO
    useEffect(() => {
        if (!socket || !connected) return;

        const handleMessageReceived = (message) => {
            console.log('📩 New message received in patient dashboard:', message);
            // Refresh chats to update unread counts
            fetchChats();
        };

        const handleChatUpdated = (data) => {
            console.log('💬 Chat updated in patient dashboard:', data);
            // Refresh chats to update unread counts
            fetchChats();
        };

        socket.on('message:received', handleMessageReceived);
        socket.on('chat:updated', handleChatUpdated);

        return () => {
            socket.off('message:received', handleMessageReceived);
            socket.off('chat:updated', handleChatUpdated);
        };
    }, [socket, connected]);

    // Fetch medicine orders when on medicine-orders tab
    useEffect(() => {
        if (activeTab === 'medicine-orders') {
            fetchMedicineOrders();
        }
    }, [activeTab]);

    const fetchConsultations = async () => {
        try {
            setLoadingConsultations(true);
            const response = await consultationsAPI.getConsultations();
            if (response.data.success) {
                setConsultations(response.data.data);
                // Stats will be calculated by the useEffect that watches consultations
            }
        } catch (error) {
            console.error('Failed to fetch consultations:', error);
            // Set empty stats on error
            setStats({
                totalConsultations: { value: 0, change: 0, changeText: 'No data yet' },
                upcomingAppointments: { value: 0, change: 0, changeText: 'No data yet' },
                completedConsultations: { value: 0, change: 0, changeText: 'No data yet' },
                totalSpent: { value: 0, change: 0, changeText: 'No data yet' }
            });
            setLoadingStats(false);
        } finally {
            setLoadingConsultations(false);
        }
    };


    const fetchDoctors = async () => {
        try {
            setLoadingDoctors(true);
            const response = await doctorsAPI.getDoctors({
                specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
                search: doctorSearchTerm || undefined
            });
            setDoctors(response.data.data);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const fetchPharmacies = async () => {
        try {
            setLoadingPharmacies(true);

            // Get user's location from profile or use Kathmandu default
            const userLat = profile?.latitude || 27.7172;
            const userLon = profile?.longitude || 85.3240;

            const response = await pharmaciesAPI.getPharmacies({
                userLat,
                userLon
            });

            if (response.data.success) {
                setPharmacies(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching pharmacies:', error);
            toast.error('Failed to load pharmacies');
            setPharmacies([]);
        } finally {
            setLoadingPharmacies(false);
        }
    };

    const fetchDashboardStats = async () => {
        setLoadingStats(true);

        // Always fetch stats from API to include both consultations and medicine orders
        try {
            const response = await statsAPI.getDashboardStats();
            setStats(response.data.data);
            console.log('📊 Stats fetched from API:', response.data.data);
        } catch (apiError) {
            console.error('API stats fetch failed:', apiError);
            // Fallback: calculate from consultations only if API fails
            if (consultations && consultations.length > 0) {
                const upcoming = consultations.filter(c => c.status === 'upcoming' || c.status === 'scheduled' || c.status === 'pending').length;
                const completed = consultations.filter(c => c.status === 'completed').length;
                const total = consultations.length;
                const totalSpent = consultations
                    .filter(c => c.paymentStatus === 'paid')
                    .reduce((sum, c) => sum + (c.fee || 0), 0);

                setStats({
                    totalConsultations: { value: total, change: 0, changeText: 'from last month' },
                    upcomingAppointments: { value: upcoming, change: 0, changeText: 'from last month' },
                    completedConsultations: { value: completed, change: 0, changeText: 'from last month' },
                    totalSpent: { value: totalSpent, change: 0, changeText: 'from last month' }
                });
            } else {
                // Set default stats
                setStats({
                    totalConsultations: { value: 0, change: 0, changeText: 'from last month' },
                    upcomingAppointments: { value: 0, change: 0, changeText: 'from last month' },
                    completedConsultations: { value: 0, change: 0, changeText: 'from last month' },
                    totalSpent: { value: 0, change: 0, changeText: 'from last month' }
                });
            }
        } finally {
            setLoadingStats(false);
        }
    };

    // Re-fetch doctors when search/filter changes
    useEffect(() => {
        if (user) {
            fetchDoctors();
        }
    }, [selectedSpecialty, doctorSearchTerm]);

    useEffect(() => {
        if (user && profile && !welcomeNotificationShown.current) {
            welcomeNotificationShown.current = true;
            addNotification({
                title: 'Welcome to your dashboard',
                message: `Hello ${profile.firstName || user.name}, welcome back!`,
                type: 'info',
            });
        }
    }, [user?.id, profile?.firstName, addNotification]);

    // Fetch consultations on mount
    useEffect(() => {
        if (user) {
            fetchConsultations();
        }
    }, [user]);

    // Recalculate stats when consultations change
    useEffect(() => {
        if (consultations && consultations.length > 0) {
            console.log('🔄 Consultations loaded, recalculating stats...');
            fetchDashboardStats();
        } else if (consultations && consultations.length === 0) {
            // If consultations array is empty (not undefined), set stats to 0
            console.log('📊 No consultations found, setting stats to 0');
            setStats({
                totalConsultations: { value: 0, change: 0, changeText: 'from last month' },
                upcomingAppointments: { value: 0, change: 0, changeText: 'from last month' },
                completedConsultations: { value: 0, change: 0, changeText: 'from last month' },
                totalSpent: { value: 0, change: 0, changeText: 'from last month' }
            });
            setLoadingStats(false); // Stop loading state
        }
    }, [consultations.length]); // Only re-run when the length changes


    const handleBookConsultation = useCallback((doctor) => {
        setSelectedDoctor(doctor);
        setConsultationDialog(true);
    }, []);

    const handleConsultationConfirm = useCallback((bookingData) => {
        addNotification({
            title: 'Consultation Booked',
            message: `Your ${bookingData.type} consultation with ${selectedDoctor.name} has been booked for ${bookingData.date} at ${bookingData.time}.`,
            type: 'success',
        });
        setConsultationDialog(false);
        setSelectedDoctor(null);
    }, [selectedDoctor, addNotification]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            addNotification({
                title: 'Logged out successfully',
                message: 'You have been safely logged out.',
                type: 'success',
            });
        } catch (error) {
            addNotification({
                title: 'Logout failed',
                message: 'Failed to logout. Please try again.',
                type: 'error',
            });
        }
    };

    const handleSaveMedicineReminder = async (reminderData) => {
        try {
            console.log('💊 PatientDashboard: Saving medicine reminder...', reminderData);
            if (editingReminder) {
                console.log('💊 PatientDashboard: Updating existing reminder:', editingReminder._id);
                await updateReminder(editingReminder._id, reminderData);
            } else {
                console.log('💊 PatientDashboard: Creating new reminder');
                const newReminder = await createReminder(reminderData);
                console.log('✅ PatientDashboard: Reminder created successfully:', newReminder);
            }
            setMedicineReminderDialog(false);
            setEditingReminder(null);
            console.log('✅ PatientDashboard: Dialog closed, reminder should now appear in list');
        } catch (error) {
            console.error('❌ PatientDashboard: Failed to save reminder:', error);
        }
    };

    const handleSubmitRating = async () => {
        if (!selectedConsultation || rating === 0) {
            toast({
                title: "Rating required",
                description: "Please select a rating",
                variant: "destructive"
            });
            return;
        }

        const token = localStorage.getItem('token');
        console.log('🔑 Token from localStorage:', token);
        console.log('🔑 Token type:', typeof token);
        console.log('🔑 All localStorage keys:', Object.keys(localStorage));

        if (!token || token === 'undefined') {
            toast({
                title: "Authentication required",
                description: "Please log in again to rate consultations",
                variant: "destructive"
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/consultations/${selectedConsultation._id}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating,
                    review: review.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success!",
                    description: "Rating submitted successfully"
                });

                // Update local consultation data
                setConsultations(prev => prev.map(c =>
                    c._id === selectedConsultation._id
                        ? { ...c, rating, review, ratedAt: new Date() }
                        : c
                ));

                // Reset and close dialog
                setRatingDialog(false);
                setSelectedConsultation(null);
                setRating(0);
                setReview('');
            } else {
                throw new Error(data.message || 'Failed to submit rating');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast({
                title: "Error",
                description: error.message || 'Failed to submit rating. Please try again.',
                variant: "destructive"
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Filter consultations by status
    // Show both 'upcoming' (pending approval) and 'approved' (doctor approved) in upcoming section
    const upcomingConsultations = consultations.filter(c =>
        c.status === 'upcoming' || c.status === 'approved'
    );
    const completedConsultations = consultations.filter(c => c.status === 'completed');
    const sortedConsultations = [...consultations].sort((a, b) => new Date(b.date) - new Date(a.date));

    const getConsultationTypeIcon = (type) => {
        switch (type) {
            case 'video': return Video;
            case 'audio': return Phone;
            case 'chat': return MessageCircle;
            default: return Video;
        }
    };

    // Helper function to check if patient can join consultation (10 min before to 1 hour after)
    const canJoinConsultation = (consultation) => {
        if (!consultation.date || !consultation.time) return false;

        try {
            // Handle both ISO date strings and formatted dates
            const dateStr = consultation.date.includes('T')
                ? consultation.date.split('T')[0]
                : consultation.date;
            const consultationDateTime = new Date(`${dateStr} ${consultation.time}`);

            if (isNaN(consultationDateTime.getTime())) {
                console.error('Invalid date:', consultation.date, consultation.time);
                return false;
            }

            const now = new Date();
            const diffMinutes = (consultationDateTime - now) / 1000 / 60;

            // Can join 10 minutes before to 60 minutes after scheduled time
            return diffMinutes <= 10 && diffMinutes >= -60;
        } catch (error) {
            console.error('Error parsing consultation date:', error);
            return false;
        }
    };

    // Helper function to get minutes until consultation can be joined
    const getMinutesUntil = (consultation) => {
        if (!consultation.date || !consultation.time) return 0;

        try {
            // Handle both ISO date strings and formatted dates
            const dateStr = consultation.date.includes('T')
                ? consultation.date.split('T')[0]
                : consultation.date;
            const consultationDateTime = new Date(`${dateStr} ${consultation.time}`);

            if (isNaN(consultationDateTime.getTime())) {
                console.error('Invalid date for minutes calc:', consultation.date, consultation.time);
                return 0;
            }

            const now = new Date();
            const diffMinutes = Math.ceil((consultationDateTime - now) / 1000 / 60);

            return Math.max(0, diffMinutes - 10); // Subtract 10 because can join 10 min early
        } catch (error) {
            console.error('Error calculating minutes until:', error);
            return 0;
        }
    };

    const renderConsultationCard = (consultation) => {
        const ConsultationIcon = getConsultationTypeIcon(consultation.type);
        const getConsultationTypeLabel = (type) => {
            if (type === 'video') return 'Video Consultation';
            if (type === 'audio') return 'Audio Consultation';
            if (type === 'chat') return 'Chat Consultation';
            return type;
        };

        const getConsultationTypeColor = (type) => {
            if (type === 'video') return 'text-blue-600';
            if (type === 'audio') return 'text-green-600';
            if (type === 'chat') return 'text-purple-600';
            return 'text-gray-600';
        };

        return (
            <Card key={consultation.id} className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                            {/* Doctor Avatar */}
                            <Avatar className="h-14 w-14 border-2 border-blue-100">
                                <AvatarImage src={getImageUrl(consultation.doctorImage)} alt={consultation.doctorName} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-lg">
                                    {consultation.doctorName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>

                            {/* Doctor Info and Details */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-semibold text-lg text-gray-900">{consultation.doctorName}</h4>
                                        {/* Show Live badge for approved consultations that can be joined */}
                                        {consultation.status === 'approved' && canJoinConsultation(consultation) && (
                                            <Badge className="bg-green-100 text-green-700 border-green-300 animate-pulse">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 inline-block"></span>
                                                Live
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{consultation.specialty}</p>
                                    <div className={`flex items-center space-x-1 mt-1 ${getConsultationTypeColor(consultation.type)}`}>
                                        <ConsultationIcon className="h-4 w-4" />
                                        <span className="text-sm font-medium">{getConsultationTypeLabel(consultation.type)}</span>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-700">Date & Time</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(consultation.date).toLocaleDateString('en-US', {
                                            month: 'numeric',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })} at {consultation.time}
                                    </p>
                                </div>

                                {/* Consultation Purpose/Reason */}
                                {consultation.reason && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-700">
                                            {consultation.status === 'completed' ? 'Consultation Purpose' : 'Consultation Purpose'}
                                        </p>
                                        <p className="text-sm text-gray-600">{consultation.reason}</p>
                                    </div>
                                )}

                                {/* Doctor's Notes - Only for completed */}
                                {consultation.status === 'completed' && consultation.notes && (
                                    <div className="space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-sm font-medium text-gray-700">Doctor's Notes</p>
                                        <p className="text-sm text-gray-600">{consultation.notes}</p>
                                    </div>
                                )}

                                {/* Rating - Only for completed */}
                                {consultation.status === 'completed' && consultation.rating && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < consultation.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Status and Fee */}
                        <div className="flex flex-col items-end space-y-3 ml-4">
                            <Badge
                                className={`${consultation.status === 'completed'
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : 'bg-blue-100 text-blue-700 border-blue-200'
                                    } border font-medium px-3 py-1`}
                            >
                                {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                            </Badge>

                            <div className="text-right">
                                <p className="text-sm text-gray-600">Consultation Fee</p>
                                <p className="text-lg font-bold text-blue-600">NPR {consultation.fee}</p>
                            </div>

                            {/* Join Consultation Button - Only for approved consultations */}
                            {consultation.status === 'approved' && (
                                <Button
                                    disabled={!canJoinConsultation(consultation)}
                                    onClick={() => {
                                        if (canJoinConsultation(consultation)) {
                                            // Check consultation type and open appropriate dialog
                                            if (consultation.type === 'audio' || consultation.type === 'video') {
                                                // Open audio call dialog for audio/video consultations
                                                setAudioConsultationId(consultation._id);
                                                setAudioConsultationData({
                                                    doctorName: consultation.doctorName,
                                                    doctorImage: consultation.doctorImage
                                                });
                                                setAudioDialogOpen(true);
                                            } else {
                                                // Open chat dialog for chat consultations
                                                setChatConsultationId(consultation._id);
                                                setChatDialogOpen(true);
                                            }
                                        }
                                    }}
                                    className={`${canJoinConsultation(consultation)
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        } mt-2`}
                                    size="default"
                                >
                                    {canJoinConsultation(consultation) ? (
                                        <>
                                            <ConsultationIcon className="h-4 w-4 mr-2" />
                                            Join Consultation
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="h-4 w-4 mr-2" />
                                            Available in {getMinutesUntil(consultation)} min
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Rate Button - Only for completed without rating */}
                            {consultation.status === 'completed' && !consultation.rating && (
                                <Button
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white mt-2 shadow-sm"
                                    size="default"
                                    onClick={() => {
                                        setSelectedConsultation(consultation);
                                        setRatingDialog(true);
                                    }}
                                >
                                    <Star className="h-4 w-4 mr-2" />
                                    Rate Doctor
                                </Button>
                            )}

                            {/* Prescription Badge and Button - Only for completed */}
                            {consultation.status === 'completed' && consultation.prescriptionId && (
                                <Button
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white mt-2 shadow-sm"
                                    size="default"
                                    onClick={() => {
                                        setPrescriptionConsultationId(consultation._id);
                                        setPrescriptionDialog(true);
                                    }}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Prescription
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderMedicineReminderCard = (reminder) => {
        return (
            <Card key={reminder.id} className={`border transition-all duration-200 ${reminder.isActive ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/30'
                }`}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${reminder.isActive ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                <Pill className={`h-6 w-6 ${reminder.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-gray-900">{reminder.medicineName}</h4>
                                <p className="text-gray-600">{reminder.dosage} • {reminder.frequency.replace('-', ' ')}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                    <span>Times: {reminder.times.join(', ')}</span>
                                    {reminder.emailReminder && (
                                        <div className="flex items-center space-x-1">
                                            <Bell className="h-3 w-3" />
                                            <span>Email alerts</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <Badge className={`border font-medium ${reminder.isActive
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                {reminder.isActive ? 'Active' : 'Paused'}
                            </Badge>
                            {reminder.nextReminder && reminder.isActive && (
                                <p className="text-xs text-gray-500">
                                    Next: {new Date(reminder.nextReminder).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {reminder.instructions && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500 mb-1">Instructions</p>
                            <p className="text-sm text-gray-700">{reminder.instructions}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                            <p className="text-gray-500 font-medium">Start Date</p>
                            <p className="text-gray-900">{new Date(reminder.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">End Date</p>
                            <p className="text-gray-900">
                                {reminder.endDate ? new Date(reminder.endDate).toLocaleDateString() : 'Ongoing'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Created: {new Date(reminder.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleReminderStatus(reminder.id)}
                                className={reminder.isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}
                            >
                                {reminder.isActive ? 'Pause' : 'Activate'}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditReminder(reminder)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteReminder(reminder.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto p-6 space-y-8">
                {/* Welcome Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/20"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Heart className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        Welcome back, {profile?.firstName || user?.name}!
                                    </h1>
                                    <p className="text-white/90 text-base">
                                        Manage your health consultations and medical records
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-white/90">
                                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                    <Shield className="h-4 w-4" />
                                    <span className="font-medium">Verified Platform</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                    <Stethoscope className="h-4 w-4" />
                                    <span className="font-medium">500+ Doctors</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                    <Users className="h-4 w-4" />
                                    <span className="font-medium">10K+ Patients</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16 border-4 border-white/30 shadow-lg">
                                <AvatarImage src={profile?.profileImage} />
                                <AvatarFallback className="text-blue-600 font-semibold text-xl bg-white">
                                    {(profile?.firstName?.[0] || user?.name?.[0] || 'U')}
                                    {(profile?.lastName?.[0] || user?.name?.split(' ')[1]?.[0] || 'S')}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {loadingStats ? (
                        // Loading skeleton
                        [1, 2, 3, 4].map((i) => (
                            <Card key={i} className="border-0 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : stats ? (
                        // Display stats from API - MGX Design
                        (() => {
                            const statsToDisplay = [
                                { key: 'totalConsultations', icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50', title: 'Total Consultations' },
                                { key: 'upcomingAppointments', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50', title: 'Upcoming Appointments' },
                                { key: 'completedConsultations', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', title: 'Completed Consultations' },
                                { key: 'totalSpent', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', title: 'Total Spent' }
                            ];

                            return statsToDisplay.map((config, index) => {
                                // Use default values if stat is missing
                                const stat = stats[config.key] || { value: 0, change: 0, changeText: 'No data yet' };

                                const Icon = config.icon;
                                const displayValue = config.key === 'totalSpent'
                                    ? `NPR ${(stat.value || 0).toLocaleString()}`
                                    : (stat.value !== undefined ? stat.value : 0);

                                return (
                                    <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                                        <CardContent className="p-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-600">{config.title}</p>
                                                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900">{displayValue}</h3>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                        {stat.change !== 0 && (
                                                            <>
                                                                <TrendingUp className={`h-3 w-3 mr-1 ${stat.change > 0 ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
                                                                <span className={stat.change > 0 ? 'text-green-600' : 'text-red-600'}>
                                                                    {stat.change > 0 ? '+' : ''}{stat.change}%
                                                                </span>
                                                                <span className="ml-1">{stat.changeText}</span>
                                                            </>
                                                        )}
                                                        {stat.change === 0 && <span>{stat.changeText}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            });
                        })()
                    ) : (
                        // Display default values when not logged in
                        [
                            { key: 'totalConsultations', icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50', title: 'Total Consultations', value: 0 },
                            { key: 'upcomingAppointments', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50', title: 'Upcoming Appointments', value: 0 },
                            { key: 'completedConsultations', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', title: 'Completed Consultations', value: 0 },
                            { key: 'totalSpent', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', title: 'Total Spent', value: 'NPR 0' }
                        ].map((config, index) => {
                            const Icon = config.icon;

                            return (
                                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                                    <CardContent className="p-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-600">{config.title}</p>
                                                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                                    <Icon className={`h-5 w-5 ${config.color}`} />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">{config.value}</h3>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Old stats mapping code removed */}
                <div className="hidden">
                    {/* This section is hidden and will be removed */}
                    {stats && Array.isArray(stats) && stats.map((stat, index) => (
                        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                        <div className="flex items-center space-x-1 text-xs mt-1">
                                            <TrendingUp className="h-3 w-3 text-green-600" />
                                            <span className="text-green-600 font-medium">{stat.change}</span>
                                            <span className="text-gray-500">{stat.changeText}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search and Filter */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search consultations, doctors, or conditions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 border-gray-200"
                                />
                            </div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full md:w-48 h-11 border-gray-200">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="date">Sort by Date</SelectItem>
                                    <SelectItem value="doctor">Sort by Doctor</SelectItem>
                                    <SelectItem value="fee">Sort by Fee</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-full md:w-48 h-11 border-gray-200">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => navigate('/dashboard/doctors')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'doctors'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Find Doctors
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/consultations')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'consultations'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                My Consultations
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/pharmacy')}
                                className={`inline-flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'pharmacy'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Pharmacy Chat
                                {(() => {
                                    // Calculate total unread messages from all pharmacy chats
                                    const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
                                    return totalUnread > 0 ? (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {totalUnread}
                                        </span>
                                    ) : null;
                                })()}
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/medicine-orders')}
                                className={`inline-flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'medicine-orders'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Medicine Orders
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/profile')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Profile & Settings
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/health-records')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'health-records'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Health Records
                            </button>
                        </nav>
                    </div>

                    {/* Consultations Tab */}
                    {activeTab === 'consultations' && (
                        <div className="space-y-6">
                            {/* Upcoming Consultations */}
                            {upcomingConsultations.length > 0 && (
                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Upcoming Consultations
                                                <span className="ml-2 text-sm font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                                                    {upcomingConsultations.length}
                                                </span>
                                            </h3>
                                            <p className="text-sm text-gray-600">Your scheduled appointments and upcoming consultations</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {upcomingConsultations.map(renderConsultationCard)}
                                    </div>
                                </div>
                            )}

                            {/* Completed Consultations / Consultation History */}
                            {completedConsultations.length > 0 && (
                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Consultation History
                                                <span className="ml-2 text-sm font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                    {completedConsultations.length}
                                                </span>
                                            </h3>
                                            <p className="text-sm text-gray-600">Your past consultations and medical records</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {completedConsultations.map(renderConsultationCard)}
                                    </div>
                                </div>
                            )}

                            {sortedConsultations.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                    <Stethoscope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 font-medium">No consultations found</p>
                                    <p className="text-sm text-gray-500 mt-1">Book your first consultation with our expert doctors</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Doctors Tab */}
                    {activeTab === 'doctors' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Search className="h-5 w-5 text-gray-400" />
                                    <h3 className="text-lg font-semibold">Find Verified Doctors</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Search for doctors by name or specialty. Choose video, audio, or chat consultations.
                                </p>

                                <div className="flex items-center space-x-4">
                                    <Input
                                        placeholder="Search doctors or specialties..."
                                        className="flex-1 border-gray-200"
                                        value={doctorSearchTerm}
                                        onChange={(e) => setDoctorSearchTerm(e.target.value)}
                                    />
                                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                                        <SelectTrigger className="w-48 bg-white border-gray-200">
                                            <SelectValue placeholder="Select specialty" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="all">All Specialties</SelectItem>
                                            {uniqueSpecialties.filter(s => s !== 'all').map(specialty => (
                                                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sortedDoctors.map((doctor) => (
                                    <Card key={doctor.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                {/* Doctor Header */}
                                                <div className="flex items-start space-x-4">
                                                    <div className="relative">
                                                        <Avatar className="h-16 w-16">
                                                            <AvatarImage src={getImageUrl(doctor.image)} alt={doctor.name} />
                                                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold">
                                                                {doctor.name ? doctor.name.split(' ').map(n => n[0]).join('') : 'DR'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {doctor.isOnline && (
                                                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-lg text-gray-900">Dr. {doctor.name}</h4>
                                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                                            {doctor.specialty}
                                                        </Badge>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                                <span>{doctor.rating}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Activity className="h-4 w-4" />
                                                                <span>{doctor.experience} years</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Users className="h-4 w-4" />
                                                                <span>{doctor.patients}+ patients</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {doctor.description}
                                                </p>

                                                {/* Location and Hours */}
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{doctor.location}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{doctor.hours}</span>
                                                    </div>
                                                </div>

                                                {/* Consultation Types */}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Available Consultation Types:</p>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                                                            <Video className="h-3 w-3 mr-1" />
                                                            Video Call
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                                                            <Phone className="h-3 w-3 mr-1" />
                                                            Audio Call
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                                                            <MessageCircle className="h-3 w-3 mr-1" />
                                                            Text Chat
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Price and Book Button */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                    <div>
                                                        <p className="text-lg font-bold text-green-600">From NPR {Math.round(doctor.consultationFee * 0.6)}</p>
                                                        <p className="text-xs text-gray-500">Starting price for chat</p>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleBookConsultation(doctor)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        Book Consultation
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {sortedDoctors.length === 0 && (
                                <div className="text-center py-12">
                                    <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 font-medium">No doctors found</p>
                                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pharmacy Chat Tab */}
                    {activeTab === 'pharmacy' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-900">Available Pharmacies</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-6">
                                    Connect with verified pharmacies for medicine consultation and delivery
                                </p>

                                {/* Pharmacy Cards */}
                                <div className="space-y-4">
                                    {loadingPharmacies ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-600">Loading pharmacies...</span>
                                        </div>
                                    ) : pharmacies.length > 0 ? (
                                        pharmacies.map((pharmacy, index) => {
                                            const initials = pharmacy.name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 3);
                                            const gradients = ['from-teal-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-blue-500 to-indigo-500', 'from-orange-500 to-red-500'];
                                            const gradient = gradients[index % gradients.length];

                                            return (
                                                <Card key={pharmacy.id} className="border border-gray-200 hover:shadow-md transition-all duration-200">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start space-x-4 flex-1">
                                                                <div className="relative">
                                                                    <Avatar className="h-14 w-14">
                                                                        <AvatarImage src={pharmacy.profileImage ? `http://localhost:5000${pharmacy.profileImage}` : undefined} />
                                                                        <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-bold text-lg`}>
                                                                            {initials}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                        <Check className="h-3 w-3 text-white" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <h4 className="font-semibold text-lg text-gray-900">{pharmacy.name}</h4>
                                                                        {pharmacy.isOpen && (
                                                                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Online</Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                                        <div className="flex items-center space-x-1">
                                                                            <MapPin className="h-4 w-4" />
                                                                            <span>{pharmacy.city}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                                                        <div className="flex items-center space-x-1">
                                                                            <TrendingUp className="h-4 w-4" />
                                                                            <span>{pharmacy.distance} km away</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-1">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>{pharmacy.deliveryTime}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-600 mb-2">Specialties:</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {pharmacy.specialties.map((specialty, idx) => (
                                                                                <Badge key={idx} variant="outline" className="text-xs border-gray-300 text-gray-700">{specialty}</Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col space-y-2 ml-4">
                                                                <Button
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white relative"
                                                                    onClick={() => {
                                                                        console.log('🏥 Pharmacy selected:', pharmacy);
                                                                        console.log('🆔 Pharmacy userId:', pharmacy.userId);
                                                                        console.log('🆔 Pharmacy userId._id:', pharmacy.userId?._id);
                                                                        setSelectedPharmacy(pharmacy);
                                                                        setPharmacyDialog(true);
                                                                    }}
                                                                >
                                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                                    Chat
                                                                    {(() => {
                                                                        // Find chat with this pharmacy for unread count
                                                                        const existingChat = chats.find(
                                                                            chat => chat.pharmacy?._id === pharmacy.userId
                                                                        );
                                                                        const unreadCount = existingChat?.unreadCount || 0;

                                                                        return unreadCount > 0 ? (
                                                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                                                {unreadCount}
                                                                            </span>
                                                                        ) : null;
                                                                    })()}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="border-gray-200"
                                                                    onClick={() => {
                                                                        setSelectedPharmacyForMedicine(pharmacy);
                                                                        setRequestMedicineDialog(true);
                                                                    }}
                                                                >
                                                                    <Pill className="h-4 w-4 mr-2" />
                                                                    Request Medicine
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Verified Pharmacies Found</h3>
                                            <p className="text-gray-600">There are currently no verified pharmacies in your area.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Info Note */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start space-x-3">
                                        <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Location-based filtering</p>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Pharmacies are sorted by distance from your location. Update your location in Profile & Settings for more accurate results.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div >
                        </div >
                    )
                    }

                    {/* Health Records Tab */}
                    {
                        activeTab === 'health-records' && (
                            <HealthRecordsTab
                                profile={profile}
                                medicineReminders={reminders}
                                onAddReminder={() => setMedicineReminderDialog(true)}
                                onEditReminder={(reminder) => {
                                    setEditingReminder(reminder);
                                    setMedicineReminderDialog(true);
                                }}
                                onToggleReminder={(id) => toggleReminder(id)}
                                onDeleteReminder={(id) => deleteReminder(id)}
                            />
                        )
                    }

                    {/* Medicine Orders Tab */}
                    {activeTab === 'medicine-orders' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Medicine Orders</h2>
                                <p className="text-sm text-gray-600 mt-1">Track your medicine orders and prescriptions</p>
                            </div>

                            {loadingOrders ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                    <span className="ml-3 text-gray-600">Loading orders...</span>
                                </div>
                            ) : medicineOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {medicineOrders.map((order) => (
                                        <Card key={order._id} className="border border-gray-200">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="font-semibold text-gray-900">
                                                                Order #{order._id.slice(-6)}
                                                            </h3>
                                                            <Badge className={
                                                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                    order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                        order.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-700' :
                                                                            order.status === 'paid' || order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                                                                'bg-yellow-100 text-yellow-700'
                                                            }>
                                                                {order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            Pharmacy: {order.pharmacyId?.fullName || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                        {order.totalAmount > 0 && (
                                                            <p className="text-sm font-semibold text-gray-900 mt-2">
                                                                Total: NPR {order.totalAmount}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col space-y-2">
                                                        {order.status === 'awaiting_payment' && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                                                onClick={() => {
                                                                    setPendingBooking({
                                                                        type: 'medicine_order',
                                                                        orderId: order._id,
                                                                        amount: order.totalAmount,
                                                                        pharmacyName: order.pharmacyId?.fullName,
                                                                        medicineCount: order.medicines?.length,
                                                                        orderDetails: order
                                                                    });
                                                                    setPharmacyPaymentDialog(true);
                                                                }}
                                                            >
                                                                Pay Now
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedMedicineOrder(order);
                                                                setOrderDetailsDialog(true);
                                                            }}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border border-gray-200">
                                    <CardContent className="p-12 text-center">
                                        <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medicine Orders Yet</h3>
                                        <p className="text-gray-600 mb-4">
                                            You haven't requested any medicines yet. Visit the Pharmacy Chat tab to request medicines.
                                        </p>
                                        <Button onClick={() => navigate('/dashboard/pharmacy')} className="bg-purple-600 hover:bg-purple-700">
                                            Browse Pharmacies
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div >
                    )}

                    {/* Profile Tab */}
                    {
                        activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Header */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Profile & Settings</h2>
                                    <p className="text-sm text-gray-600 mt-1">Manage your account and preferences</p>
                                </div>

                                {/* Profile Card */}
                                <Card className="border border-gray-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarImage src={getImageUrl(profile?.profileImage)} />
                                                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl font-bold">
                                                        {(profile?.firstName?.[0] || user?.name?.[0] || 'P')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : (user?.name || 'patient')}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">Patient</p>
                                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-600 border-blue-200">
                                                Verified Patient
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="border border-gray-200 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/profile')}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <User className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">Edit Profile</h4>
                                                    <p className="text-sm text-gray-600">Update your information</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-gray-200 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/settings')}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Settings className="h-6 w-6 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">Settings</h4>
                                                    <p className="text-sm text-gray-600">Preferences & privacy</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sign Out */}
                                <Card className="border border-red-200 hover:shadow-md transition-all cursor-pointer" onClick={() => setShowLogoutDialog(true)}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-center space-x-2 text-red-600">
                                            <LogOut className="h-5 w-5" />
                                            <span className="font-medium">Sign Out</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    }
                </div >

                {/* Dialogs */}
                < ConsultationTypeDialog
                    open={consultationDialog}
                    onOpenChange={setConsultationDialog}
                    doctor={selectedDoctor}
                    onConfirm={async (bookingData) => {
                        try {
                            // Don't create consultation yet - just store booking data
                            // Consultation will be created after successful payment
                            setPendingBooking({
                                ...bookingData,
                                doctorName: selectedDoctor?.name,
                                doctorId: selectedDoctor.userId || selectedDoctor._id,
                                fee: bookingData.fee
                            });

                            setConsultationDialog(false);
                            setPaymentDialog(true);
                        } catch (error) {
                            console.error('Failed to prepare booking:', error);
                            addNotification({
                                type: 'error',
                                title: 'Booking Failed',
                                message: 'Failed to prepare booking. Please try again.'
                            });
                        }
                    }}
                />

                <PaymentDialog
                    open={paymentDialog}
                    onOpenChange={(isOpen) => {
                        // Just close the dialog and clear pending booking
                        // No need to cancel consultation since it doesn't exist yet
                        if (!isOpen) {
                            setPendingBooking(null);
                        }
                        setPaymentDialog(isOpen);
                    }}
                    bookingDetails={pendingBooking}
                    onPaymentSuccess={async (paymentMethod, consultationData) => {
                        try {
                            // Check if this is a medicine order or consultation
                            if (pendingBooking?.type === 'medicine_order') {
                                // Handle medicine order payment - call confirmPayment API
                                const transactionId = consultationData?.transactionId || `TXN-${Date.now()}`;

                                await medicineOrderAPI.confirmPayment(pendingBooking.orderId, {
                                    paymentMethod,
                                    transactionId
                                });

                                // Refresh orders to show updated status
                                await fetchMedicineOrders();

                                setPaymentDialog(false);
                                setPendingBooking(null);

                                // Show success message
                                addNotification({
                                    type: 'success',
                                    title: 'Payment Successful!',
                                    message: `Your medicine order payment of NPR ${pendingBooking.amount} has been processed via ${paymentMethod}. The pharmacy will start preparing your order.`
                                });

                                toast.success('Payment successful! Order is being prepared.');
                            } else {
                                // Handle consultation payment
                                await fetchConsultations();

                                setPaymentDialog(false);
                                setPendingBooking(null);

                                // Show success message
                                addNotification({
                                    type: 'success',
                                    title: 'Booking Confirmed!',
                                    message: `Your consultation with ${pendingBooking?.doctorName} has been successfully booked and paid via ${paymentMethod}.`
                                });
                            }
                        } catch (error) {
                            console.error('Error after payment success:', error);
                            addNotification({
                                type: 'error',
                                title: 'Error',
                                message: 'Payment was successful but failed to refresh consultations. Please refresh the page.'
                            });
                        }
                    }}
                    onPaymentError={async (errorMessage) => {
                        // Delete the consultation on payment error
                        if (pendingBooking?.consultationId) {
                            try {
                                await consultationsAPI.cancelConsultation(pendingBooking.consultationId);
                                console.log('Cancelled consultation due to payment error');
                            } catch (error) {
                                // Ignore 404 errors (already deleted)
                                if (error.response?.status !== 404) {
                                    console.error('Failed to cancel consultation:', error);
                                }
                            }
                        }

                        // Close dialog and clear state
                        setPaymentDialog(false);
                        setPendingBooking(null);

                        addNotification({
                            type: 'error',
                            title: 'Payment Failed',
                            message: errorMessage || 'Payment could not be processed. Please try again.'
                        });
                    }}
                />

                {/* Pharmacy Payment Dialog */}
                <PharmacyPaymentDialog
                    open={pharmacyPaymentDialog}
                    onOpenChange={(isOpen) => {
                        setPharmacyPaymentDialog(isOpen);
                        if (!isOpen) {
                            setPendingBooking(null);
                        }
                    }}
                    orderDetails={pendingBooking}
                    onPaymentSuccess={async (paymentMethod, paymentData) => {
                        try {
                            // Handle medicine order payment
                            const transactionId = paymentData?.paymentToken || `TXN-${Date.now()}`;

                            await medicineOrderAPI.confirmPayment(pendingBooking.orderId, {
                                paymentMethod,
                                transactionId
                            });

                            // Refresh orders to show updated status
                            await fetchMedicineOrders();

                            setPharmacyPaymentDialog(false);
                            setPendingBooking(null);

                            // Show success message
                            addNotification({
                                type: 'success',
                                title: 'Payment Successful!',
                                message: `Your medicine order payment of NPR ${pendingBooking.amount} has been processed via ${paymentMethod}. The pharmacy will start preparing your order.`
                            });
                        } catch (error) {
                            console.error('Error after payment success:', error);
                            addNotification({
                                type: 'error',
                                title: 'Error',
                                message: 'Payment was successful but failed to update order status. Please contact support.'
                            });
                        }
                    }}
                    onPaymentError={(errorMessage) => {
                        addNotification({
                            type: 'error',
                            title: 'Payment Failed',
                            message: errorMessage || 'Payment could not be processed. Please try again.'
                        });
                    }}
                />

                < PharmacyChat
                    open={pharmacyDialog}
                    onOpenChange={setPharmacyDialog}
                    pharmacyId={selectedPharmacy?.userId}
                    pharmacyName={selectedPharmacy?.name}
                    pharmacyImage={selectedPharmacy?.profileImage}
                />

                <MedicineReminderDialog
                    open={medicineReminderDialog}
                    onOpenChange={setMedicineReminderDialog}
                    onSave={handleSaveMedicineReminder}
                    editingReminder={editingReminder}
                />

                <RequestMedicineDialog
                    open={requestMedicineDialog}
                    onOpenChange={setRequestMedicineDialog}
                    pharmacy={selectedPharmacyForMedicine}
                />

                {/* Rating Dialog */}
                <Dialog open={ratingDialog} onOpenChange={setRatingDialog}>
                    <DialogContent className="sm:max-w-md bg-white">
                        <DialogHeader>
                            <DialogTitle>Rate Your Consultation</DialogTitle>
                            <DialogDescription>
                                How was your consultation with {selectedConsultation?.doctorName}?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Star Rating */}
                            <div className="space-y-3">
                                <Label className="text-center block">Rating</Label>
                                <div className="flex items-center justify-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-12 w-12 ${star <= rating
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="text-center text-sm font-medium text-gray-700">
                                        {rating} {rating === 1 ? 'star' : 'stars'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRatingDialog(false);
                                    setRating(0);
                                    setReview('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitRating}
                                disabled={rating === 0}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                            >
                                Submit Rating
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Logout Confirmation Dialog */}
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

                {/* Prescription Preview Dialog */}
                <PrescriptionPreview
                    open={prescriptionDialog}
                    onOpenChange={setPrescriptionDialog}
                    consultationId={prescriptionConsultationId}
                />

                {/* Medicine Order Details Dialog */}
                <Dialog open={orderDetailsDialog} onOpenChange={setOrderDetailsDialog}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
                        <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                        </DialogHeader>

                        {selectedMedicineOrder && (
                            <div className="space-y-6 py-4">
                                {/* Order Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Order ID</p>
                                        <p className="font-semibold">{selectedMedicineOrder._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedMedicineOrder.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                                            selectedMedicineOrder.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-800' :
                                                selectedMedicineOrder.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                                                    selectedMedicineOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedMedicineOrder.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Pharmacy</p>
                                        <p className="font-semibold">{selectedMedicineOrder.pharmacyId?.fullName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Order Date</p>
                                        <p className="font-semibold">{new Date(selectedMedicineOrder.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Prescription */}
                                {selectedMedicineOrder.prescriptionImage && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Prescription</h4>
                                        {selectedMedicineOrder.prescriptionImage.toLowerCase().endsWith('.pdf') ? (
                                            <div className="border rounded-lg p-6 bg-gray-50 text-center">
                                                <FileText className="h-16 w-16 mx-auto text-purple-600 mb-3" />
                                                <p className="text-sm text-gray-600 mb-3">PDF Prescription Document</p>
                                                <a
                                                    href={selectedMedicineOrder.prescriptionImage.startsWith('http') ? selectedMedicineOrder.prescriptionImage : `http://localhost:5000${selectedMedicineOrder.prescriptionImage}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download Prescription
                                                </a>
                                            </div>
                                        ) : (
                                            <img
                                                src={selectedMedicineOrder.prescriptionImage.startsWith('http') ? selectedMedicineOrder.prescriptionImage : `http://localhost:5000${selectedMedicineOrder.prescriptionImage}`}
                                                alt="Prescription"
                                                className="max-w-full h-auto rounded-lg border"
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Medicines */}
                                {selectedMedicineOrder.medicines && selectedMedicineOrder.medicines.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Medicines</h4>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Medicine</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Dosage</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {selectedMedicineOrder.medicines.map((med, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-4 py-2 text-sm">{med.name}</td>
                                                            <td className="px-4 py-2 text-sm">{med.dosage}</td>
                                                            <td className="px-4 py-2 text-sm">{med.quantity}</td>
                                                            <td className="px-4 py-2 text-sm">NPR {med.pricePerUnit}</td>
                                                            <td className="px-4 py-2 text-sm font-semibold">NPR {med.pricePerUnit * med.quantity}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Bill Summary */}
                                {selectedMedicineOrder.totalAmount > 0 && (
                                    <div className="border-t pt-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-semibold">NPR {selectedMedicineOrder.subtotal || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Delivery Charges</span>
                                                <span className="font-semibold">NPR {selectedMedicineOrder.deliveryCharges || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                                <span>Total Amount</span>
                                                <span className="text-purple-600">NPR {selectedMedicineOrder.totalAmount}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Address */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedMedicineOrder.deliveryAddress}</p>
                                </div>

                                {/* Delivery Notes */}
                                {selectedMedicineOrder.deliveryNotes && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Delivery Notes</h4>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedMedicineOrder.deliveryNotes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Chat Consultation Dialog */}
                {chatDialogOpen && chatConsultationId && (
                    <ChatConsultationDialog
                        consultationId={chatConsultationId}
                        open={chatDialogOpen}
                        onClose={() => {
                            setChatDialogOpen(false);
                            setChatConsultationId(null);
                            // Refresh consultations
                            fetchConsultations();
                        }}
                    />
                )}

                {/* Audio Consultation Dialog */}
                {audioDialogOpen && audioConsultationId && (
                    <AudioConsultationDialog
                        open={audioDialogOpen}
                        onOpenChange={(isOpen) => {
                            setAudioDialogOpen(isOpen);
                            if (!isOpen) {
                                setAudioConsultationId(null);
                                setAudioConsultationData(null);
                                // Refresh consultations
                                fetchConsultations();
                            }
                        }}
                        consultationId={audioConsultationId}
                        userRole="patient"
                        otherUser={{
                            name: audioConsultationData?.doctorName,
                            image: audioConsultationData?.doctorImage
                        }}
                    />
                )}
            </div >
        </div >
    );
}

export default PatientDashboard;
