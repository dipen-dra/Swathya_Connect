import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useConsultations } from '@/contexts/ConsultationContext';
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
    FileText
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConsultationTypeDialog } from '@/components/ui/consultation-type-dialog';
import { PaymentDialog } from '@/components/ui/payment-dialog';
import { PharmacyChat } from '@/components/ui/pharmacy-chat';
import { MedicineReminderDialog } from '@/components/ui/medicine-reminder-dialog';
import { HealthRecordsTab } from '@/components/dashboard/tabs/HealthRecordsTab';
import Header from '@/components/layout/Header';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReminders } from '@/contexts/RemindersContext';
import { doctorsAPI, pharmaciesAPI, statsAPI, consultationsAPI, prescriptionsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import PrescriptionPreview from '@/components/dashboard/PrescriptionPreview';

export function PatientDashboard() {
    const { user, logout } = useAuth();
    const { profile } = useProfile();
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
    const [pendingBooking, setPendingBooking] = useState(null);
    const [pharmacyDialog, setPharmacyDialog] = useState(false);
    const [medicineReminderDialog, setMedicineReminderDialog] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [ratingDialog, setRatingDialog] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [prescriptionDialog, setPrescriptionDialog] = useState(false);
    const [prescriptionConsultationId, setPrescriptionConsultationId] = useState(null);

    // API data states
    const [doctors, setDoctors] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
    const [stats, setStats] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingPharmacies, setLoadingPharmacies] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingConsultations, setLoadingConsultations] = useState(true);

    // Doctor search and filter states
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    const welcomeNotificationShown = useRef(false);

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath; // Already a full URL
        return `http://localhost:5000${imagePath}`; // Prepend backend URL
    };

    // Mock doctors data
    const mockDoctors = [
        {
            id: 'doc_001',
            name: 'Dr. Rajesh Sharma',
            specialty: 'Cardiology',
            experience: 15,
            experienceText: '15 years',
            rating: 4.8,
            consultationFee: 900,
            patients: 1200,
            availability: 'Available',
            isOnline: true,
            description: 'Senior Cardiologist with expertise in interventional cardiology and heart disease prevention.',
            location: 'Kathmandu Medical Center',
            hours: 'Mon-Fri 8AM-5PM',
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_002',
            name: 'Dr. Sita Poudel',
            specialty: 'Dermatology',
            experience: 12,
            experienceText: '12 years',
            rating: 4.9,
            consultationFee: 720,
            patients: 800,
            availability: 'Available',
            isOnline: true,
            description: 'Dermatologist specializing in skin conditions, cosmetic procedures, and hair treatments.',
            location: 'Bir Hospital',
            hours: 'Tue-Sat 10AM-6PM',
            image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_003',
            name: 'Dr. Amit Thapa',
            specialty: 'Orthopedics',
            experience: 18,
            experienceText: '18 years',
            rating: 4.7,
            consultationFee: 1050,
            patients: 950,
            availability: 'Available',
            isOnline: false,
            description: 'Orthopedic surgeon with specialization in joint replacement and sports medicine.',
            location: 'TUTH',
            hours: 'Mon-Wed-Fri 8AM-4PM',
            image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_004',
            name: 'Dr. Priya Maharjan',
            specialty: 'Pediatrics',
            experience: 10,
            experienceText: '10 years',
            rating: 4.9,
            consultationFee: 600,
            patients: 1500,
            availability: 'Available',
            isOnline: true,
            description: 'Pediatrician with expertise in child development and pediatric emergency care.',
            location: 'Kanti Children Hospital',
            hours: 'Mon-Sat 9AM-5PM',
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_005',
            name: 'Dr. Bikash Adhikari',
            specialty: 'Neurology',
            experience: 20,
            experienceText: '20 years',
            rating: 4.9,
            consultationFee: 1200,
            patients: 850,
            availability: 'Available',
            isOnline: true,
            description: 'Neurologist specializing in stroke, epilepsy, and neurodegenerative diseases.',
            location: 'Grande International Hospital',
            hours: 'Mon-Thu 9AM-4PM',
            image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_006',
            name: 'Dr. Anjali Rai',
            specialty: 'Psychiatry',
            experience: 8,
            experienceText: '8 years',
            rating: 4.8,
            consultationFee: 800,
            patients: 650,
            availability: 'Available',
            isOnline: true,
            description: 'Psychiatrist with focus on anxiety, depression, and cognitive behavioral therapy.',
            location: 'Mental Health Center',
            hours: 'Tue-Sat 10AM-6PM',
            image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_007',
            name: 'Dr. Suresh Gurung',
            specialty: 'General Medicine',
            experience: 14,
            experienceText: '14 years',
            rating: 4.7,
            consultationFee: 550,
            patients: 2000,
            availability: 'Available',
            isOnline: true,
            description: 'General Physician with broad experience in treating common medical conditions.',
            location: 'Patan Hospital',
            hours: 'Mon-Sat 8AM-6PM',
            image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_008',
            name: 'Dr. Meera Shrestha',
            specialty: 'Gynecology',
            experience: 16,
            experienceText: '16 years',
            rating: 4.9,
            consultationFee: 850,
            patients: 1100,
            availability: 'Available',
            isOnline: false,
            description: 'Gynecologist and Obstetrician specializing in high-risk pregnancies and women\'s health.',
            location: 'Paropakar Maternity Hospital',
            hours: 'Mon-Fri 9AM-5PM',
            image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_009',
            name: 'Dr. Ramesh Karki',
            specialty: 'ENT',
            experience: 11,
            experienceText: '11 years',
            rating: 4.6,
            consultationFee: 700,
            patients: 900,
            availability: 'Available',
            isOnline: true,
            description: 'ENT specialist treating ear, nose, and throat disorders with modern techniques.',
            location: 'Nepal ENT Hospital',
            hours: 'Tue-Sat 10AM-5PM',
            image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_010',
            name: 'Dr. Sunita Tamang',
            specialty: 'Ophthalmology',
            experience: 13,
            experienceText: '13 years',
            rating: 4.8,
            consultationFee: 750,
            patients: 1300,
            availability: 'Available',
            isOnline: true,
            description: 'Eye specialist with expertise in cataract surgery and laser vision correction.',
            location: 'Tilganga Eye Hospital',
            hours: 'Mon-Fri 8AM-4PM',
            image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_011',
            name: 'Dr. Prakash Bhandari',
            specialty: 'Dentistry',
            experience: 9,
            experienceText: '9 years',
            rating: 4.7,
            consultationFee: 650,
            patients: 1800,
            availability: 'Available',
            isOnline: false,
            description: 'Dentist specializing in cosmetic dentistry, implants, and orthodontics.',
            location: 'Dental Care Center',
            hours: 'Mon-Sat 9AM-6PM',
            image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=400&fit=crop'
        },
        {
            id: 'doc_012',
            name: 'Dr. Kavita Joshi',
            specialty: 'Gastroenterology',
            experience: 17,
            experienceText: '17 years',
            rating: 4.8,
            consultationFee: 950,
            patients: 750,
            availability: 'Available',
            isOnline: true,
            description: 'Gastroenterologist with expertise in digestive disorders and endoscopic procedures.',
            location: 'Norvic International Hospital',
            hours: 'Mon-Wed-Fri 10AM-4PM',
            image: 'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=400&h=400&fit=crop'
        }
    ];


    // Doctors are already filtered by API based on search and specialty
    const sortedDoctors = doctors;

    // Get unique specialties for filter dropdown
    const uniqueSpecialties = ['all', ...new Set(doctors.map(d => d.specialty))];

    // Fetch data from API
    useEffect(() => {
        if (user) {
            fetchDoctors();
            fetchPharmacies();
            // Don't call fetchDashboardStats here - it will be called after consultations load
        }
    }, [user]);

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
            const response = await pharmaciesAPI.getPharmacies();
            setPharmacies(response.data.data);
        } catch (error) {
            console.error('Failed to fetch pharmacies:', error);
        } finally {
            setLoadingPharmacies(false);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            setLoadingStats(true);

            // Calculate stats from consultations data
            if (consultations && consultations.length > 0) {
                console.log('📊 Calculating stats from consultations:', consultations);
                const upcoming = consultations.filter(c => c.status === 'upcoming').length;
                const completed = consultations.filter(c => c.status === 'completed').length;
                const total = consultations.length;
                const totalSpent = consultations
                    .filter(c => c.paymentStatus === 'paid')
                    .reduce((sum, c) => sum + (c.fee || 0), 0);

                console.log('📊 Stats calculated:', { total, upcoming, completed, totalSpent });

                // Calculate percentage changes (mock data for now - you can calculate real changes later)
                const calculateChange = (current) => {
                    if (current === 0) return 0;
                    // Mock: assume 100% growth if we have data
                    return current > 0 ? 100 : 0;
                };

                setStats({
                    totalConsultations: {
                        value: total,
                        change: calculateChange(total),
                        changeText: 'from last month'
                    },
                    upcomingAppointments: {
                        value: upcoming,
                        change: calculateChange(upcoming),
                        changeText: 'from last month'
                    },
                    completedConsultations: {
                        value: completed,
                        change: calculateChange(completed),
                        changeText: 'from last month'
                    },
                    totalSpent: {
                        value: totalSpent,
                        change: calculateChange(totalSpent),
                        changeText: 'from last month'
                    }
                });
            } else {
                console.log('📊 No consultations data, using API fallback');
                // Fallback to API if no consultations loaded yet
                const response = await statsAPI.getDashboardStats();
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            // Set default stats on error
            setStats({
                totalConsultations: { value: 0, change: 0, changeText: 'from last month' },
                upcomingAppointments: { value: 0, change: 0, changeText: 'from last month' },
                completedConsultations: { value: 0, change: 0, changeText: 'from last month' },
                totalSpent: { value: 0, change: 0, changeText: 'from last month' }
            });
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
        }
    }, [consultations.length]); // Only re-run when the length changes

    // Fetch consultations from backend
    const fetchConsultations = async () => {
        try {
            setLoadingConsultations(true);
            const response = await consultationsAPI.getConsultations();
            if (response.data.success) {
                setConsultations(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch consultations:', error);
        } finally {
            setLoadingConsultations(false);
        }
    };

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
    const upcomingConsultations = consultations.filter(c => c.status === 'upcoming');
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
                                    <h4 className="font-semibold text-lg text-gray-900">{consultation.doctorName}</h4>
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

                            {/* Join Button - Only for upcoming */}
                            {consultation.status === 'upcoming' && (
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                                    size="default"
                                >
                                    <ConsultationIcon className="h-4 w-4 mr-2" />
                                    {consultation.type === 'chat' ? 'Join Chat' : 'Join Call'}
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
                                const stat = stats[config.key];
                                if (!stat) {
                                    console.warn(`Missing stat for ${config.key}`, stats);
                                    return null;
                                }

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
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'pharmacy'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Pharmacy Chat
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
                                                            <AvatarImage src={doctor.image} alt={doctor.name} />
                                                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold">
                                                                {doctor.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {doctor.isOnline && (
                                                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-lg text-gray-900">{doctor.name}</h4>
                                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                                            {doctor.specialty}
                                                        </Badge>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                                <span>{doctor.rating}</span>
                                                            </div>
                                                            <span>{doctor.experience} years</span>
                                                            <span>{doctor.patients}+ patients</span>
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
                                    {/* MediCare Pharmacy */}
                                    <Card className="border border-gray-200 hover:shadow-md transition-all duration-200">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    {/* Pharmacy Avatar */}
                                                    <div className="relative">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                            MP
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    </div>

                                                    {/* Pharmacy Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h4 className="font-semibold text-lg text-gray-900">MediCare Pharmacy</h4>
                                                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                                                Online
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                            <div className="flex items-center space-x-1">
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                <span>Kathmandu, Thamel</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="font-medium">4.8</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                                            <div className="flex items-center space-x-1">
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                                </svg>
                                                                <span>0.5 km away</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="h-4 w-4" />
                                                                <span>30-45 mins</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-2">Specialties:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">General Medicine</Badge>
                                                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">Prescription Drugs</Badge>
                                                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">Health Supplements</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-col space-y-2 ml-4">
                                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        Start Chat
                                                    </Button>
                                                    <Button variant="outline" className="border-gray-200">
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Call
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Health Plus Pharmacy */}
                                    <Card className="border border-gray-200 hover:shadow-md transition-all duration-200">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    <div className="relative">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                            HPP
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h4 className="font-semibold text-lg text-gray-900">Health Plus Pharmacy</h4>
                                                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                                                Online
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                            <div className="flex items-center space-x-1">
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                <span>Lalitpur, Patan</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="font-medium">4.6</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                                            <div className="flex items-center space-x-1">
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                                </svg>
                                                                <span>1.2 km away</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="h-4 w-4" />
                                                                <span>45-60 mins</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-2">Specialties:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">Ayurvedic Medicine</Badge>
                                                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">Baby Care</Badge>
                                                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">Diabetic Care</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col space-y-2 ml-4">
                                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        Start Chat
                                                    </Button>
                                                    <Button variant="outline" className="border-gray-200">
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Call
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* City Pharmacy */}
                                    <Card className="border border-gray-200 hover:shadow-md transition-all duration-200">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    <div className="relative">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                            CP
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h4 className="font-semibold text-lg text-gray-900">City Pharmacy</h4>
                                                            <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                                                                Offline
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                            <div className="flex items-center space-x-1">
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                <span>Bhaktapur, Durbar Square</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="font-medium">4.7</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                                            <div className="flex items-center space-x-1">
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                                </svg>
                                                                <span>2.1 km away</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="h-4 w-4" />
                                                                <span>60-75 mins</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-2">Specialties:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">Emergency Medicine</Badge>
                                                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">Surgical Supplies</Badge>
                                                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">Medical Equipment</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col space-y-2 ml-4">
                                                    <Button className="bg-blue-400 hover:bg-blue-500 text-white" disabled>
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        Start Chat
                                                    </Button>
                                                    <Button variant="outline" className="border-gray-200">
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Call
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
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
                            </div>
                        </div>
                    )}

                    {/* Health Records Tab */}
                    {activeTab === 'health-records' && (
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
                    )}

                    {/* Pharmacy Tab */}
                    {activeTab === 'pharmacy' && (
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Pharmacy Services</CardTitle>
                                <CardDescription>Order medicines and consult with pharmacists</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Button
                                        onClick={() => setPharmacyDialog(true)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Chat with Pharmacist
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
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

                                <Card className="border border-gray-200 hover:shadow-md transition-all cursor-pointer">
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
                    )}
                </div>

                {/* Dialogs */}
                <ConsultationTypeDialog
                    open={consultationDialog}
                    onOpenChange={setConsultationDialog}
                    doctor={selectedDoctor}
                    onConfirm={async (bookingData) => {
                        try {
                            // Create consultation in database first
                            const consultationData = {
                                doctorId: selectedDoctor._id,
                                date: bookingData.date,
                                time: bookingData.time,
                                type: bookingData.type,
                                reason: bookingData.reason,
                                fee: bookingData.fee
                            };

                            const response = await consultationsAPI.bookConsultation(consultationData);

                            if (response.data.success) {
                                const createdConsultation = response.data.data;

                                // Store booking data with actual consultation ID
                                setPendingBooking({
                                    ...bookingData,
                                    doctorName: selectedDoctor?.name,
                                    consultationId: createdConsultation._id,
                                    fee: createdConsultation.fee
                                });

                                setConsultationDialog(false);
                                setPaymentDialog(true);
                            }
                        } catch (error) {
                            console.error('Failed to create consultation:', error);
                            addNotification({
                                type: 'error',
                                title: 'Booking Failed',
                                message: 'Failed to create consultation. Please try again.'
                            });
                        }
                    }}
                />

                <PaymentDialog
                    open={paymentDialog}
                    onOpenChange={setPaymentDialog}
                    bookingDetails={pendingBooking}
                    onPaymentSuccess={async (paymentMethod, consultationData) => {
                        try {
                            // Refresh consultations list
                            await fetchConsultations();

                            setPaymentDialog(false);
                            setPendingBooking(null);

                            // Show success message
                            addNotification({
                                type: 'success',
                                title: 'Payment Successful!',
                                message: `Your consultation with ${pendingBooking?.doctorName} has been booked and paid via ${paymentMethod}.`
                            });
                        } catch (error) {
                            console.error('Error after payment success:', error);
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

                <PharmacyChat
                    open={pharmacyDialog}
                    onOpenChange={setPharmacyDialog}
                />

                <MedicineReminderDialog
                    open={medicineReminderDialog}
                    onOpenChange={setMedicineReminderDialog}
                    onSave={handleSaveMedicineReminder}
                    editingReminder={editingReminder}
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
            </div >
        </div >
    );
}

export default PatientDashboard;
