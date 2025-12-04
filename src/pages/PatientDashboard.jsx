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
import { ConsultationTypeDialog } from '@/components/ui/consultation-type-dialog';
import { PharmacyChat } from '@/components/ui/pharmacy-chat';
import { MedicineReminderDialog } from '@/components/ui/medicine-reminder-dialog';
import Header from '@/components/layout/Header';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
    const { user, logout } = useAuth();
    const { profile } = useProfile();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('doctors');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [consultationDialog, setConsultationDialog] = useState(false);
    const [pharmacyDialog, setPharmacyDialog] = useState(false);
    const [medicineReminderDialog, setMedicineReminderDialog] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);

    // Doctor search and filter states
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    const welcomeNotificationShown = useRef(false);

    // Mock medicine reminders state
    const [medicineReminders, setMedicineReminders] = useState([
        {
            id: 'reminder_001',
            medicineName: 'Omeprazole',
            dosage: '20mg',
            frequency: 'daily',
            times: ['07:00'],
            instructions: 'Take before breakfast on empty stomach',
            startDate: '2025-01-01',
            endDate: '2025-03-01',
            emailReminder: true,
            beforeMealMinutes: 30,
            isActive: true,
            createdAt: '2025-01-01T00:00:00Z',
            nextReminder: '2025-01-16T06:30:00Z'
        },
        {
            id: 'reminder_002',
            medicineName: 'Metformin',
            dosage: '500mg',
            frequency: 'twice-daily',
            times: ['08:00', '20:00'],
            instructions: 'Take with meals to reduce stomach upset',
            startDate: '2024-12-01',
            endDate: null,
            emailReminder: true,
            beforeMealMinutes: 15,
            isActive: true,
            createdAt: '2024-12-01T00:00:00Z',
            nextReminder: '2025-01-16T07:45:00Z'
        },
        {
            id: 'reminder_003',
            medicineName: 'Vitamin D3',
            dosage: '1000 IU',
            frequency: 'daily',
            times: ['09:00'],
            instructions: 'Take with breakfast for better absorption',
            startDate: '2025-01-10',
            endDate: null,
            emailReminder: true,
            beforeMealMinutes: 30,
            isActive: true,
            createdAt: '2025-01-10T00:00:00Z',
            nextReminder: '2025-01-16T08:30:00Z'
        }
    ]);

    // Mock consultations data
    const mockConsultations = [
        // Upcoming consultations
        {
            id: 'cons_001',
            doctorName: 'Dr. Rajesh Kumar',
            specialty: 'Cardiologist',
            date: '2025-01-18',
            time: '10:00 AM',
            type: 'video',
            status: 'upcoming',
            fee: 1500,
            reason: 'Regular heart checkup and blood pressure monitoring',
            rating: null,
            notes: null,
            prescription: null
        },
        {
            id: 'cons_002',
            doctorName: 'Dr. Priya Sharma',
            specialty: 'Dermatologist',
            date: '2025-01-20',
            time: '2:30 PM',
            type: 'audio',
            status: 'upcoming',
            fee: 1200,
            reason: 'Follow-up for skin condition treatment',
            rating: null,
            notes: null,
            prescription: null
        },
        {
            id: 'cons_003',
            doctorName: 'Dr. Amit Thapa',
            specialty: 'Orthopedic',
            date: '2025-01-22',
            time: '11:00 AM',
            type: 'chat',
            status: 'upcoming',
            fee: 900,
            reason: 'Knee pain consultation and physiotherapy advice',
            rating: null,
            notes: null,
            prescription: null
        },

        // Completed consultations
        {
            id: 'cons_004',
            doctorName: 'Dr. Rajesh Kumar',
            specialty: 'Cardiologist',
            date: '2025-01-10',
            time: '3:00 PM',
            type: 'video',
            status: 'completed',
            fee: 1500,
            reason: 'Chest pain and shortness of breath',
            rating: 5,
            notes: 'Patient shows good recovery. Blood pressure is stable. Continue current medication.',
            prescription: 'Amlodipine 5mg daily, Atorvastatin 20mg at bedtime'
        },
        {
            id: 'cons_005',
            doctorName: 'Dr. Sunita Maharjan',
            specialty: 'General Physician',
            date: '2025-01-08',
            time: '1:00 PM',
            type: 'video',
            status: 'completed',
            fee: 1000,
            reason: 'Fever and cold symptoms',
            rating: 4,
            notes: 'Viral infection. Rest and hydration recommended. Symptoms should improve in 3-5 days.',
            prescription: 'Paracetamol 500mg as needed, Vitamin C supplements'
        },
        {
            id: 'cons_006',
            doctorName: 'Dr. Priya Sharma',
            specialty: 'Dermatologist',
            date: '2025-01-05',
            time: '4:00 PM',
            type: 'audio',
            status: 'completed',
            fee: 1200,
            reason: 'Skin rash and itching',
            rating: 5,
            notes: 'Allergic reaction to new soap. Switched to hypoallergenic products. Rash improving.',
            prescription: 'Hydrocortisone cream 1%, Cetirizine 10mg daily'
        },
        {
            id: 'cons_007',
            doctorName: 'Dr. Krishna Poudel',
            specialty: 'Gastroenterologist',
            date: '2025-01-03',
            time: '10:30 AM',
            type: 'video',
            status: 'completed',
            fee: 1800,
            reason: 'Stomach pain and acidity',
            rating: 5,
            notes: 'Gastritis due to irregular eating habits. Dietary changes recommended.',
            prescription: 'Omeprazole 20mg before breakfast, Sucralfate syrup'
        },
        {
            id: 'cons_008',
            doctorName: 'Dr. Amit Thapa',
            specialty: 'Orthopedic',
            date: '2024-12-28',
            time: '11:00 AM',
            type: 'chat',
            status: 'completed',
            fee: 900,
            reason: 'Back pain after exercise',
            rating: 4,
            notes: 'Muscle strain. Rest and physiotherapy recommended. Avoid heavy lifting.',
            prescription: 'Ibuprofen 400mg twice daily, Hot/cold compress'
        },
        {
            id: 'cons_009',
            doctorName: 'Dr. Maya Gurung',
            specialty: 'Gynecologist',
            date: '2024-12-25',
            time: '2:00 PM',
            type: 'video',
            status: 'completed',
            fee: 1500,
            reason: 'Routine checkup and consultation',
            rating: 5,
            notes: 'Regular checkup completed. All parameters normal. Continue healthy lifestyle.',
            prescription: 'Folic acid supplements, Iron tablets'
        },
        {
            id: 'cons_010',
            doctorName: 'Dr. Rajesh Kumar',
            specialty: 'Cardiologist',
            date: '2024-12-20',
            time: '9:00 AM',
            type: 'video',
            status: 'completed',
            fee: 1500,
            reason: 'Follow-up for hypertension',
            rating: 5,
            notes: 'Blood pressure well controlled. Continue current medication regimen.',
            prescription: 'Amlodipine 5mg daily, lifestyle modifications'
        },
        {
            id: 'cons_011',
            doctorName: 'Dr. Binod Shrestha',
            specialty: 'Neurologist',
            date: '2024-12-15',
            time: '3:30 PM',
            type: 'audio',
            status: 'completed',
            fee: 2000,
            reason: 'Headache and dizziness',
            rating: 4,
            notes: 'Tension headache due to stress. Relaxation techniques recommended.',
            prescription: 'Paracetamol as needed, stress management techniques'
        },
        {
            id: 'cons_012',
            doctorName: 'Dr. Sunita Maharjan',
            specialty: 'General Physician',
            date: '2024-12-10',
            time: '11:30 AM',
            type: 'video',
            status: 'completed',
            fee: 1000,
            reason: 'Annual health checkup',
            rating: 5,
            notes: 'Comprehensive health checkup completed. All vitals normal. Maintain current lifestyle.',
            prescription: 'Multivitamin supplements, regular exercise'
        },
        {
            id: 'cons_013',
            doctorName: 'Dr. Priya Sharma',
            specialty: 'Dermatologist',
            date: '2024-12-05',
            time: '1:30 PM',
            type: 'chat',
            status: 'completed',
            fee: 1200,
            reason: 'Acne treatment follow-up',
            rating: 5,
            notes: 'Acne showing significant improvement. Continue current treatment for 2 more months.',
            prescription: 'Tretinoin cream, Clindamycin gel'
        }
    ];

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

    // Filter and sort consultations
    const filteredConsultations = mockConsultations.filter(consultation => {
        const matchesSearch = consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consultation.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consultation.reason.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const sortedConsultations = [...filteredConsultations].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            case 'doctor':
                return a.doctorName.localeCompare(b.doctorName);
            case 'fee':
                return b.fee - a.fee;
            default:
                return 0;
        }
    });

    // Separate upcoming and completed consultations
    const upcomingConsultations = sortedConsultations.filter(c => c.status === 'upcoming');
    const completedConsultations = sortedConsultations.filter(c => c.status === 'completed');

    // Filter and sort doctors
    const filteredDoctors = mockDoctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
            doctor.description.toLowerCase().includes(doctorSearchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
        return matchesSearch && matchesSpecialty;
    });

    const sortedDoctors = [...filteredDoctors].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'rating':
                return b.rating - a.rating;
            case 'fee':
                return a.consultationFee - b.consultationFee;
            case 'experience':
                return b.experience - a.experience;
            case 'date': // Default to name for doctors
            case 'doctor':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    // Get unique specialties for filter dropdown
    const uniqueSpecialties = ['all', ...new Set(mockDoctors.map(d => d.specialty))];

    // Calculate total spending
    const totalSpent = mockConsultations
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + c.fee, 0);

    const stats = [
        {
            title: 'Total Consultations',
            value: 14,
            icon: Activity,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            change: '+3%',
            changeText: 'from last month'
        },
        {
            title: 'Upcoming Appointments',
            value: 3,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            change: '+3',
            changeText: 'from last month'
        },
        {
            title: 'Completed Consultations',
            value: 11,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: '+2',
            changeText: 'from last month'
        },
        {
            title: 'Total Spent',
            value: 'NPR 15,500',
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            change: '+15%',
            changeText: 'from last month'
        },
    ];

    useEffect(() => {
        if (user && profile && !welcomeNotificationShown.current) {
            welcomeNotificationShown.current = true;
            addNotification({
                title: 'Welcome to your dashboard',
                message: `Hello ${profile.firstName || user.name}, you have ${upcomingConsultations.length} upcoming consultations.`,
                type: 'info',
            });
        }
    }, [user?.id, profile?.firstName, addNotification, upcomingConsultations.length]);

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

    const handleSaveMedicineReminder = (reminderData) => {
        if (editingReminder) {
            setMedicineReminders(prev => prev.map(r => r.id === reminderData.id ? reminderData : r));
            addNotification({
                title: 'Reminder Updated',
                message: `Medicine reminder for ${reminderData.medicineName} has been updated.`,
                type: 'success',
            });
        } else {
            setMedicineReminders(prev => [...prev, reminderData]);
            addNotification({
                title: 'Reminder Added',
                message: `Medicine reminder for ${reminderData.medicineName} has been set. You'll receive email notifications at scheduled times.`,
                type: 'success',
            });
        }
        setMedicineReminderDialog(false);
        setEditingReminder(null);
    };

    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setMedicineReminderDialog(true);
    };

    const handleDeleteReminder = (reminderId) => {
        const reminder = medicineReminders.find(r => r.id === reminderId);
        setMedicineReminders(prev => prev.filter(r => r.id !== reminderId));
        addNotification({
            title: 'Reminder Deleted',
            message: `Medicine reminder for ${reminder?.medicineName} has been removed.`,
            type: 'success',
        });
    };

    const toggleReminderStatus = (reminderId) => {
        setMedicineReminders(prev => prev.map(r =>
            r.id === reminderId ? { ...r, isActive: !r.isActive } : r
        ));
        const reminder = medicineReminders.find(r => r.id === reminderId);
        addNotification({
            title: reminder?.isActive ? 'Reminder Paused' : 'Reminder Activated',
            message: `Medicine reminder for ${reminder?.medicineName} has been ${reminder?.isActive ? 'paused' : 'activated'}.`,
            type: 'info',
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

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
                    {stats.map((stat, index) => (
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
                                onClick={() => setActiveTab('doctors')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'doctors'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Find Doctors
                            </button>
                            <button
                                onClick={() => setActiveTab('consultations')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'consultations'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                My Consultations
                            </button>
                            <button
                                onClick={() => setActiveTab('pharmacy')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'pharmacy'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Pharmacy Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Profile & Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('health-records')}
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
                                        className="flex-1"
                                        value={doctorSearchTerm}
                                        onChange={(e) => setDoctorSearchTerm(e.target.value)}
                                    />
                                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                                        <SelectTrigger className="w-48 bg-white">
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
                                                        <p className="text-lg font-bold text-green-600">From NPR {doctor.consultationFee}</p>
                                                        <p className="text-xs text-gray-500">Starting price for chat</p>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleBookConsultation(doctor)}
                                                        disabled={doctor.availability !== 'Available'}
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

                    {/* Health Records Tab */}
                    {activeTab === 'health-records' && (
                        <div className="space-y-6">
                            {/* Basic Health Information */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Basic Health Information</CardTitle>
                                    <CardDescription>Your essential health details and medical history</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <AlertCircle className="h-5 w-5 text-red-600" />
                                                <h4 className="font-semibold text-red-800">Blood Group</h4>
                                            </div>
                                            <p className="text-2xl font-bold text-red-600">O+</p>
                                        </div>

                                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Heart className="h-5 w-5 text-orange-600" />
                                                <h4 className="font-semibold text-orange-800">Allergies</h4>
                                            </div>
                                            <p className="text-sm text-orange-700">Penicillin, Shellfish</p>
                                        </div>

                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                <h4 className="font-semibold text-blue-800">Medical History</h4>
                                            </div>
                                            <p className="text-sm text-blue-700">Hypertension, Diabetes</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Medicine Reminders Section */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center space-x-2">
                                                <Pill className="h-5 w-5 text-blue-600" />
                                                <span>Medicine Reminders</span>
                                            </CardTitle>
                                            <CardDescription>
                                                Set daily medicine reminders with email notifications to stay on track with your medication schedule
                                            </CardDescription>
                                        </div>
                                        <Button
                                            onClick={() => setMedicineReminderDialog(true)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Reminder
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {medicineReminders.length > 0 ? (
                                        <div className="space-y-4">
                                            {medicineReminders.map(renderMedicineReminderCard)}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Pill className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 font-medium">No medicine reminders set</p>
                                            <p className="text-sm text-gray-500 mt-1">Add your daily medicines to get email reminders</p>
                                            <Button
                                                onClick={() => setMedicineReminderDialog(true)}
                                                className="mt-4 bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Your First Reminder
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
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
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Profile & Settings</CardTitle>
                                <CardDescription>Manage your account and preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={profile?.profileImage} />
                                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold">
                                            {(profile?.firstName?.[0] || user?.name?.[0] || 'U')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : user?.name}
                                        </h3>
                                        <p className="text-gray-600">{profile?.dateOfBirth ? `Born ${profile.dateOfBirth}` : 'Patient'}</p>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                        Verified Patient
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => navigate('/profile')}
                                        className="h-16 bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center justify-center space-x-3"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Edit Profile</p>
                                            <p className="text-sm text-gray-600">Update your information</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-16 border-2 border-gray-200 hover:bg-gray-50 flex items-center justify-center space-x-3"
                                    >
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Settings className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-700">Settings</p>
                                            <p className="text-sm text-gray-600">Preferences & privacy</p>
                                        </div>
                                    </Button>
                                </div>

                                <div className="pt-6 border-t border-gray-200">
                                    <Button
                                        onClick={handleLogout}
                                        variant="outline"
                                        className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Dialogs */}
                <ConsultationTypeDialog
                    open={consultationDialog}
                    onOpenChange={setConsultationDialog}
                    doctor={selectedDoctor}
                    onConfirm={handleConsultationConfirm}
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
            </div>
        </div>
    );
}
