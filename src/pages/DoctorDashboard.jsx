import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Calendar,
    Clock,
    Star,
    Search,
    Stethoscope,
    Phone,
    Video,
    CheckCircle,
    TrendingUp,
    Shield,
    Award,
    Users,
    MessageCircle,
    User,
    Settings,
    LogOut,
    X,
    Check,
    AlertCircle,
    DollarSign,
    FileText,
    Eye,
    Calendar as CalendarIcon,
    Upload,
    Download,
    Edit3,
    Trash2,
    Plus,
    CheckCircle2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/layout/Header';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { documentsAPI, prescriptionsAPI, profileAPI, consultationsAPI } from '@/services/api';
import DoctorDocuments from '@/components/dashboard/DoctorDocuments';
import PrescriptionDialog from '@/components/dashboard/PrescriptionDialog';

export default function DoctorDashboard() {
    console.log('🏥 DoctorDashboard component is rendering!');

    const { user, logout } = useAuth();
    const { profile } = useProfile();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const { tab } = useParams();

    // Set active tab based on URL parameter, default to 'requests'
    const [activeTab, setActiveTab] = useState(tab || 'requests');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionDialog, setActionDialog] = useState(false);
    const [actionType, setActionType] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [documentDialog, setDocumentDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [prescriptionDialog, setPrescriptionDialog] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);

    // Verification fees state
    const [verificationFees, setVerificationFees] = useState({
        chatFee: '',
        audioFee: '',
        videoFee: '',
        workplace: '',
        availabilityDays: [],
        availabilityTime: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // API data states
    const [consultations, setConsultations] = useState([]);
    const [loadingConsultations, setLoadingConsultations] = useState(true);

    const welcomeNotificationShown = useRef(false);

    // Fetch consultations from backend
    useEffect(() => {
        if (user) {
            fetchConsultations();
        }
    }, [user]);

    const fetchConsultations = async () => {
        try {
            setLoadingConsultations(true);
            const response = await consultationsAPI.getConsultations();
            if (response.data.success) {
                setConsultations(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch consultations:', error);
            toast.error('Failed to load consultations');
        } finally {
            setLoadingConsultations(false);
        }
    };

    // Filter requests based on search and status
    const filteredRequests = consultations.filter(request => {
        const patientName = request.patientId?.name || '';
        const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (request.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        return matchesSearch && matchesStatus;
    });



    //     // API data states
    //     const [consultations, setConsultations] = useState([]);
    //     const [loadingConsultations, setLoadingConsultations] = useState(true);

    //     const welcomeNotificationShown = useRef(false);

    //     // Filter requests based on search and status
    //     const filteredRequests = consultations.filter(request => {
    //         const patientName = request.patientId?.name || '';
    //         const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //             (request.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    //         const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    //         return matchesSearch && matchesStatus;
    //     });


    //     id: 'req_001',
    //         patientName: 'Ramesh Sharma',
    //             patientId: 'pat_001',
    //                 age: 45,
    //                     gender: 'Male',
    //                         consultationType: 'video',
    //                             requestedDate: '2025-01-16',
    //                                 requestedTime: '10:00 AM',
    //                                     reason: 'Experiencing chest pain and shortness of breath for the past 2 days. Need urgent consultation.',
    //                                         fee: 1500,
    //                                             status: 'pending',
    //                                                 submittedAt: '2025-01-14T09:30:00Z',
    //                                                     patientHistory: 'Previous heart condition, diabetes',
    //                                                         contactNumber: '+977-9841234567',
    //                                                             emergencyContact: '+977-9851234567'
    // },
    // {
    //     id: 'req_002',
    //         patientName: 'Sita Poudel',
    //             patientId: 'pat_002',
    //                 age: 32,
    //                     gender: 'Female',
    //                         consultationType: 'audio',
    //                             requestedDate: '2025-01-17',
    //                                 requestedTime: '2:30 PM',
    //                                     reason: 'Follow-up consultation for skin condition treatment. Rash is improving but need to discuss next steps.',
    //                                         fee: 1200,
    //                                             status: 'pending',
    //                                                 submittedAt: '2025-01-14T11:15:00Z',
    //                                                     patientHistory: 'Allergic to penicillin, previous eczema treatment',
    //                                                         contactNumber: '+977-9851234568',
    //                                                             emergencyContact: '+977-9861234568'
    // },
    // {
    //     id: 'req_003',
    //         patientName: 'Binod Thapa',
    //             patientId: 'pat_003',
    //                 age: 28,
    //                     gender: 'Male',
    //                         consultationType: 'chat',
    //                             requestedDate: '2025-01-18',
    //                                 requestedTime: '11:00 AM',
    //                                     reason: 'Knee pain after sports injury. Need advice on treatment and physiotherapy options.',
    //                                         fee: 900,
    //                                             status: 'pending',
    //                                                 submittedAt: '2025-01-14T14:20:00Z',
    //                                                     patientHistory: 'Athletic, no major medical history',
    //                                                         contactNumber: '+977-9861234569',
    //                                                             emergencyContact: '+977-9871234569'
    // },

    // // Approved Requests
    // {
    //     id: 'req_004',
    //         patientName: 'Maya Gurung',
    //             patientId: 'pat_004',
    //                 age: 38,
    //                     gender: 'Female',
    //                         consultationType: 'video',
    //                             requestedDate: '2025-01-15',
    //                                 requestedTime: '3:00 PM',
    //                                     reason: 'Regular checkup and blood pressure monitoring.',
    //                                         fee: 1500,
    //                                             status: 'approved',
    //                                                 submittedAt: '2025-01-13T16:45:00Z',
    //                                                     approvedAt: '2025-01-13T18:00:00Z',
    //                                                         patientHistory: 'Hypertension, regular medication',
    //                                                             contactNumber: '+977-9871234570',
    //                                                                 emergencyContact: '+977-9881234570',
    //                                                                     consultationLink: 'https://meet.example.com/maya-consultation',
    //                                                                         paymentStatus: 'paid'
    // },
    // {
    //     id: 'req_005',
    //         patientName: 'Arjun Rai',
    //             patientId: 'pat_005',
    //                 age: 52,
    //                     gender: 'Male',
    //                         consultationType: 'audio',
    //                             requestedDate: '2025-01-16',
    //                                 requestedTime: '9:30 AM',
    //                                     reason: 'Diabetes management consultation and medication review.',
    //                                         fee: 1200,
    //                                             status: 'approved',
    //                                                 submittedAt: '2025-01-13T10:30:00Z',
    //                                                     approvedAt: '2025-01-13T12:00:00Z',
    //                                                         patientHistory: 'Type 2 diabetes, cholesterol issues',
    //                                                             contactNumber: '+977-9881234571',
    //                                                                 emergencyContact: '+977-9891234571',
    //                                                                     consultationLink: 'https://meet.example.com/arjun-consultation',
    //                                                                         paymentStatus: 'paid'
    // },

    // // Completed Consultations
    // {
    //     id: 'req_006',
    //         patientName: 'Sunita Magar',
    //             patientId: 'pat_006',
    //                 age: 29,
    //                     gender: 'Female',
    //                         consultationType: 'video',
    //                             requestedDate: '2025-01-12',
    //                                 requestedTime: '1:00 PM',
    //                                     reason: 'Pregnancy consultation and routine checkup.',
    //                                         fee: 1500,
    //                                             status: 'completed',
    //                                                 submittedAt: '2025-01-11T09:00:00Z',
    //                                                     approvedAt: '2025-01-11T10:30:00Z',
    //                                                         completedAt: '2025-01-12T13:30:00Z',
    //                                                             patientHistory: 'First pregnancy, no complications',
    //                                                                 contactNumber: '+977-9891234572',
    //                                                                     emergencyContact: '+977-9801234572',
    //                                                                         consultationNotes: 'Patient is healthy. Prescribed prenatal vitamins. Next checkup in 4 weeks.',
    //                                                                             prescription: 'Folic acid 400mcg daily, Iron supplements',
    //                                                                                 paymentStatus: 'paid',
    //                                                                                     rating: 5
    // },
    // {
    //     id: 'req_007',
    //         patientName: 'Deepak Tamang',
    //             patientId: 'pat_007',
    //                 age: 41,
    //                     gender: 'Male',
    //                         consultationType: 'chat',
    //                             requestedDate: '2025-01-11',
    //                                 requestedTime: '10:30 AM',
    //                                     reason: 'Follow-up for hypertension medication adjustment.',
    //                                         fee: 900,
    //                                             status: 'completed',
    //                                                 submittedAt: '2025-01-10T14:15:00Z',
    //                                                     approvedAt: '2025-01-10T15:00:00Z',
    //                                                         completedAt: '2025-01-11T11:00:00Z',
    //                                                             patientHistory: 'Hypertension, family history of heart disease',
    //                                                                 contactNumber: '+977-9801234573',
    //                                                                     emergencyContact: '+977-9811234573',
    //                                                                         consultationNotes: 'Blood pressure well controlled. Continue current medication.',
    //                                                                             prescription: 'Amlodipine 5mg daily, lifestyle modifications',
    //                                                                                 paymentStatus: 'paid',
    //                                                                                     rating: 4
    // },
    // {
    //     id: 'req_008',
    //         patientName: 'Priya Maharjan',
    //             patientId: 'pat_008',
    //                 age: 35,
    //                     gender: 'Female',
    //                         consultationType: 'video',
    //                             requestedDate: '2025-01-10',
    //                                 requestedTime: '4:00 PM',
    //                                     reason: 'Child vaccination consultation and health checkup.',
    //                                         fee: 1000,
    //                                             status: 'completed',
    //                                                 submittedAt: '2025-01-09T11:30:00Z',
    //                                                     approvedAt: '2025-01-09T13:00:00Z',
    //                                                         completedAt: '2025-01-10T16:30:00Z',
    //                                                             patientHistory: 'Mother of 2 children, regular checkups',
    //                                                                 contactNumber: '+977-9811234574',
    //                                                                     emergencyContact: '+977-9821234574',
    //                                                                         consultationNotes: 'Child is healthy. Vaccination schedule discussed. No concerns.',
    //                                                                             prescription: 'Continue regular diet, next vaccination in 2 months',
    //                                                                                 paymentStatus: 'paid',
    //                                                                                     rating: 5
    // },

    // // Rejected Request
    // {
    //     id: 'req_009',
    //         patientName: 'Laxmi Shrestha',
    //             patientId: 'pat_009',
    //                 age: 35,
    //                     gender: 'Female',
    //                         consultationType: 'video',
    //                             requestedDate: '2025-01-13',
    //                                 requestedTime: '4:00 PM',
    //                                     reason: 'Severe headache and vision problems for past week.',
    //                                         fee: 1500,
    //                                             status: 'rejected',
    //                                                 submittedAt: '2025-01-12T11:30:00Z',
    //                                                     rejectedAt: '2025-01-12T13:00:00Z',
    //                                                         rejectionReason: 'This condition requires immediate in-person examination. Please visit the emergency department.',
    //                                                             patientHistory: 'Migraine history, recent stress',
    //                                                                 contactNumber: '+977-9811234574',
    //                                                                     emergencyContact: '+977-9821234574'
    // }
    //     ];

    // // Mock doctor documents
    // const [doctorDocuments, setDoctorDocuments] = useState([
    //     {
    //         id: 'doc_001',
    //         name: 'Medical License',
    //         type: 'license',
    //         fileName: 'medical_license.pdf',
    //         uploadDate: '2024-01-15',
    //         status: 'verified',
    //         expiryDate: '2026-01-15',
    //         description: 'Nepal Medical Council License'
    //     },
    //     {
    //         id: 'doc_002',
    //         name: 'MBBS Degree Certificate',
    //         type: 'degree',
    //         fileName: 'mbbs_certificate.pdf',
    //         uploadDate: '2024-01-15',
    //         status: 'verified',
    //         expiryDate: null,
    //         description: 'Bachelor of Medicine and Bachelor of Surgery'
    //     },
    //     {
    //         id: 'doc_003',
    //         name: 'Cardiology Specialization',
    //         type: 'specialization',
    //         fileName: 'cardiology_cert.pdf',
    //         uploadDate: '2024-01-15',
    //         status: 'verified',
    //         expiryDate: null,
    //         description: 'Post-graduate specialization in Cardiology'
    //     },
    //     {
    //         id: 'doc_004',
    //         name: 'Professional Indemnity Insurance',
    //         type: 'insurance',
    //         fileName: 'insurance_policy.pdf',
    //         uploadDate: '2024-06-01',
    //         status: 'pending',
    //         expiryDate: '2025-06-01',
    //         description: 'Medical malpractice insurance coverage'
    //     }
    // ]);

    // // Filter requests based on search and status
    // const filteredRequests = mockConsultationRequests.filter(request => {
    //     const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    //     const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    //     return matchesSearch && matchesStatus;
    // });

    // Separate requests by status
    const pendingRequests = filteredRequests.filter(r => r.status === 'upcoming');
    const approvedRequests = filteredRequests.filter(r => r.status === 'approved');
    const completedRequests = filteredRequests.filter(r => r.status === 'completed');
    const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected');

    // Calculate statistics from real data
    console.log('📊 Doctor Dashboard - All consultations:', consultations);
    console.log('📊 Completed consultations:', consultations.filter(r => r.status === 'completed'));

    // Calculate earnings from completed consultations (payment status might not be set yet)
    const totalEarnings = consultations
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.fee || 0), 0);

    console.log('💰 Total Earnings calculated:', totalEarnings);

    const today = new Date().toISOString().split('T')[0];
    const todayConsultations = consultations
        .filter(r => {
            const consultDate = new Date(r.date).toISOString().split('T')[0];
            return consultDate === today && (r.status === 'upcoming' || r.status === 'completed');
        })
        .length;


    // Calculate percentage changes (mock for now - can be enhanced with historical data)
    const calculateChange = (current) => {
        if (current === 0) return 0;
        // Mock: assume some growth if we have data
        return current > 0 ? Math.min(100, current * 10) : 0;
    };

    const stats = [
        {
            title: 'Pending Requests',
            value: pendingRequests.length,
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            change: calculateChange(pendingRequests.length),
            changeText: 'from last month'
        },
        {
            title: 'Today\'s Consultations',
            value: todayConsultations,
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            change: calculateChange(todayConsultations),
            changeText: 'from yesterday'
        },
        {
            title: 'Total Completed',
            value: completedRequests.length,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: calculateChange(completedRequests.length),
            changeText: 'from last month'
        },
        {
            title: 'Total Earnings',
            value: `NPR ${totalEarnings.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            change: calculateChange(totalEarnings / 1000),
            changeText: 'from last month'
        }
    ];

    useEffect(() => {
        if (user && profile && !welcomeNotificationShown.current) {
            welcomeNotificationShown.current = true;
            addNotification({
                title: 'Welcome to your dashboard',
                message: `Hello Dr. ${profile.firstName || user.name}, you have ${pendingRequests.length} pending consultation requests.`,
                type: 'info',
            });
        }
    }, [user?.id, profile?.firstName, addNotification, pendingRequests.length]);

    // Sync activeTab with URL parameter
    useEffect(() => {
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [tab]);

    // Initialize verification fees from profile
    useEffect(() => {
        if (profile) {
            setVerificationFees({
                chatFee: profile.chatFee || '',
                audioFee: profile.audioFee || '',
                videoFee: profile.videoFee || '',
                workplace: profile.workplace || '',
                availabilityDays: profile.availabilityDays || [],
                availabilityTime: profile.availabilityTime || ''
            });
        }
    }, [profile]);

    // Handle tab change and update URL
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        navigate(`/doctor/dashboard/${newTab}`);
    };

    // Handle fee input changes
    const handleFeeChange = (e) => {
        const { name, value } = e.target;
        setVerificationFees(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle availability day toggle
    const handleAvailabilityDayToggle = (day) => {
        setVerificationFees(prev => ({
            ...prev,
            availabilityDays: prev.availabilityDays.includes(day)
                ? prev.availabilityDays.filter(d => d !== day)
                : [...prev.availabilityDays, day]
        }));
    };

    // Handle verification submission
    const handleSubmitVerification = async () => {
        // Validate all fees are filled
        if (!verificationFees.chatFee || !verificationFees.audioFee || !verificationFees.videoFee) {
            toast.error('Please fill in all consultation fees');
            return;
        }

        // Validate availability fields
        if (!verificationFees.workplace || verificationFees.availabilityDays.length === 0 || !verificationFees.availabilityTime) {
            toast.error('Please fill in all availability details', {
                description: 'Workplace, availability days, and time are required'
            });
            return;
        }

        // Validate profile completeness
        if (!profile?.firstName || !profile?.lastName || !profile?.specialty ||
            !profile?.licenseNumber || !profile?.yearsOfExperience) {
            toast.error('Please complete your profile first', {
                description: 'Go to Profile & Documents tab to complete your information'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // First update the fees and availability
            await profileAPI.updateProfile({
                chatFee: parseInt(verificationFees.chatFee),
                audioFee: parseInt(verificationFees.audioFee),
                videoFee: parseInt(verificationFees.videoFee),
                workplace: verificationFees.workplace,
                availabilityDays: verificationFees.availabilityDays,
                availabilityTime: verificationFees.availabilityTime
            });

            // Then submit for review
            const response = await profileAPI.submitForReview();
            if (response.data.success) {
                toast.success('Profile submitted for review!', {
                    description: 'Admin will review your profile within 24-48 hours'
                });
                window.location.reload();
            }
        } catch (error) {
            console.error('Error submitting for review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproveRequest = useCallback((request) => {
        setSelectedRequest(request);
        setActionType('approve');
        setActionDialog(true);
    }, []);

    const handleRejectRequest = useCallback((request) => {
        setSelectedRequest(request);
        setActionType('reject');
        setActionDialog(true);
    }, []);

    const handleConfirmAction = useCallback(async () => {
        if (!selectedRequest) return;

        if (actionType === 'approve') {
            try {
                // Call approve API
                const response = await fetch(`http://localhost:5000/api/consultations/${selectedRequest._id}/approve`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    addNotification({
                        title: 'Consultation Approved',
                        message: `Consultation with ${selectedRequest.patientId?.name || 'patient'} has been approved.`,
                        type: 'success',
                    });
                    // Refresh consultations list
                    await fetchConsultations();
                } else {
                    throw new Error(data.message || 'Failed to approve consultation');
                }
            } catch (error) {
                console.error('Error approving consultation:', error);
                addNotification({
                    title: 'Error',
                    message: error.message || 'Failed to approve consultation. Please try again.',
                    type: 'error',
                });
                return;
            }
        } else if (actionType === 'reject') {
            if (!rejectionReason.trim()) {
                addNotification({
                    title: 'Rejection reason required',
                    message: 'Please provide a reason for rejecting the consultation.',
                    type: 'error',
                });
                return;
            }

            try {
                // Call rejection API
                const response = await fetch(`http://localhost:5000/api/consultations/${selectedRequest.id}/reject`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        rejectionReason: rejectionReason
                    })
                });

                const data = await response.json();

                if (data.success) {
                    addNotification({
                        title: 'Consultation Rejected',
                        message: `Consultation rejected. Patient has been notified via email and refund is being processed.`,
                        type: 'success',
                    });
                    // Refresh consultations list
                    await fetchConsultations();
                } else {
                    throw new Error(data.message || 'Failed to reject consultation');
                }
            } catch (error) {
                console.error('Error rejecting consultation:', error);
                addNotification({
                    title: 'Error',
                    message: error.message || 'Failed to reject consultation. Please try again.',
                    type: 'error',
                });
                return;
            }
        }

        setActionDialog(false);
        setSelectedRequest(null);
        setActionType('');
        setRejectionReason('');
    }, [selectedRequest, actionType, rejectionReason, addNotification]);

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

    const handleDocumentUpload = () => {
        // Simulate document upload
        const newDoc = {
            id: `doc_${Date.now()}`,
            name: 'New Document',
            type: 'other',
            fileName: 'new_document.pdf',
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            expiryDate: null,
            description: 'Newly uploaded document'
        };
        setDoctorDocuments([...doctorDocuments, newDoc]);
        addNotification({
            title: 'Document Uploaded',
            message: 'Your document has been uploaded and is pending verification.',
            type: 'success',
        });
    };

    const handleDocumentDelete = (docId) => {
        setDoctorDocuments(doctorDocuments.filter(doc => doc.id !== docId));
        addNotification({
            title: 'Document Deleted',
            message: 'Document has been removed successfully.',
            type: 'success',
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'verified': return 'bg-green-100 text-green-800 border-green-200';
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

    const renderRequestCard = (request) => {
        const ConsultationIcon = getConsultationTypeIcon(request.type);

        // Helper function to convert 12-hour time to 24-hour format
        const convertTo24Hour = (time12h) => {
            const [time, modifier] = time12h.split(' ');
            let [hours, minutes] = time.split(':');

            if (hours === '12') {
                hours = '00';
            }
            if (modifier === 'PM') {
                hours = parseInt(hours, 10) + 12;
            }

            return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
        };

        // Calculate if consultation is urgent (within 30 minutes)
        const isUrgent = () => {
            try {
                const now = new Date();
                const time24 = convertTo24Hour(request.time);
                const consultationDateTime = new Date(`${request.date}T${time24}`);
                const timeDiff = consultationDateTime - now;
                const minutesUntil = Math.floor(timeDiff / (1000 * 60));

                // Show urgent if within 30 minutes and consultation hasn't passed
                return minutesUntil <= 30 && minutesUntil > 0;
            } catch (error) {
                // Fallback to keyword-based detection if date parsing fails
                return request.reason.toLowerCase().includes('urgent') ||
                    request.reason.toLowerCase().includes('severe') ||
                    request.reason.toLowerCase().includes('pain');
            }
        };

        const urgent = isUrgent();

        return (
            <Card key={request.id} className={`border hover:shadow-md transition-all duration-200 ${urgent ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                }`}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                                {request.patientId?.profileImage && (
                                    <AvatarImage
                                        src={`http://localhost:5000${request.patientId.profileImage}`}
                                        alt={request.patientId?.fullName || request.patientId?.name}
                                    />
                                )}
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                                    {(request.patientId?.fullName || request.patientId?.name || 'P').split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-lg text-gray-900">{request.patientId?.fullName || request.patientId?.name || 'Unknown Patient'}</h4>
                                    {urgent && (
                                        <Badge className="bg-red-100 text-red-800 border-red-200">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Urgent
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                    <span>{request.patientId?.email || 'No email'}</span>
                                    <div className="flex items-center space-x-1">
                                        <ConsultationIcon className="h-3 w-3" />
                                        <span className="capitalize">{request.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <Badge className={`${getStatusColor(request.status)} border font-medium`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                            <p className="text-lg font-bold text-blue-600">NPR {request.fee}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Requested Date & Time</p>
                            <p className="text-gray-900">
                                {new Date(request.date).toLocaleDateString()} at {request.time}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Submitted</p>
                            <p className="text-gray-900">
                                {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Reason for Consultation</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                    </div>

                    {request.patientHistory && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">Patient History</p>
                            <p className="text-sm text-gray-700">{request.patientHistory}</p>
                        </div>
                    )}

                    {request.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason</p>
                            <p className="text-sm text-red-700">{request.rejectionReason}</p>
                        </div>
                    )}

                    {/* Show prescription details ONLY if prescription exists */}
                    {request.status === 'completed' && request.prescriptionId && request.prescriptionData && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-800 mb-1">Consultation Notes</p>
                            <p className="text-sm text-green-700">{request.prescriptionData.diagnosis || 'No diagnosis provided'}</p>

                            {request.prescriptionData.medicines && request.prescriptionData.medicines.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-green-800">Prescription</p>
                                    <div className="text-sm text-green-700">
                                        {request.prescriptionData.medicines.map((med, idx) => (
                                            <div key={idx} className="mt-1">
                                                {med.name} - {med.dosage}, {med.frequency}, {med.duration}
                                                {med.instructions && ` (${med.instructions})`}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{request.patientId?.phone || 'N/A'}</span>
                        </div>

                        <div className="flex space-x-2">
                            {request.status === 'upcoming' && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRejectRequest(request)}
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleApproveRequest(request)}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Approve
                                    </Button>
                                </>
                            )}

                            {request.status === 'approved' && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        // If consultation link exists, open it, otherwise show a message
                                        if (request.consultationLink) {
                                            window.open(request.consultationLink, '_blank');
                                        } else {
                                            toast.info('Consultation link will be available closer to the scheduled time');
                                        }
                                    }}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm"
                                >
                                    <ConsultationIcon className="h-3 w-3 mr-1" />
                                    Start Consultation
                                </Button>
                            )}

                            {request.status === 'completed' && request.rating && (
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm text-gray-600">Rating:</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < request.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Centered Create Prescription Button - Only for completed without prescription */}
                    {request.status === 'completed' && !request.prescriptionId && (
                        <div className="flex justify-center pt-4 mt-4 border-t border-gray-200">
                            <Button
                                onClick={() => {
                                    setSelectedConsultation(request);
                                    setPrescriptionDialog(true);
                                }}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Create Prescription
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto p-6 space-y-8">
                {/* Welcome Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/20"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Stethoscope className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        Welcome back, Dr. {profile?.firstName || user?.name}!
                                    </h1>
                                    <p className="text-white/90 text-lg font-medium">
                                        Manage your consultations and patient requests
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-white/90">
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-4 w-4" />
                                    <span className="font-medium">Verified Doctor</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Award className="h-4 w-4" />
                                    <span className="font-medium">15+ Years Experience</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span className="font-medium">1200+ Patients</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16 border-4 border-white/30 shadow-lg">
                                <AvatarImage src={getImageUrl(profile?.profileImage)} />
                                <AvatarFallback className="text-green-600 font-semibold text-xl bg-white">
                                    {(profile?.firstName?.[0] || user?.name?.[0] || 'D')}
                                    {(profile?.lastName?.[0] || user?.name?.split(' ')[1]?.[0] || 'R')}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>

                {/* Quick Link to Verification Tab for Pending/Rejected Doctors */}
                {(profile?.verificationStatus === 'pending' || profile?.verificationStatus === 'rejected') && (
                    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-900">
                                            {profile?.submittedForReview ? 'Profile Under Review' : 'Complete Verification'}
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            {profile?.submittedForReview ? 'Check verification status' : 'Set fees and submit for review'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleTabChange('verification')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Go to Verification
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        {stat.change !== undefined && (
                                            <div className="flex items-center space-x-1 text-xs">
                                                <TrendingUp className={`h-3 w-3 ${stat.change > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                                                <span className={`font-medium ${stat.change > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {stat.change > 0 ? '+' : ''}{stat.change}%
                                                </span>
                                                <span className="text-gray-500">{stat.changeText}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
                                    placeholder="Search patients or consultation reasons..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 border-gray-200"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-48 h-11 border-gray-200">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Requests</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => handleTabChange('requests')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Consultation Requests
                            </button>
                            <button
                                onClick={() => handleTabChange('schedule')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedule'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                My Schedule
                            </button>
                            {/* Verification Tab - Only show when pending or rejected */}
                            {(profile?.verificationStatus === 'pending' || profile?.verificationStatus === 'rejected') && (
                                <button
                                    onClick={() => handleTabChange('verification')}
                                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'verification'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Verification
                                </button>
                            )}
                            <button
                                onClick={() => handleTabChange('profile')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Profile & Documents
                            </button>
                        </nav>
                    </div>

                    {/* Consultation Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="space-y-6">
                            {/* Pending Requests */}
                            {pendingRequests.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                        <span>Pending Requests ({pendingRequests.length})</span>
                                    </h3>
                                    <div className="space-y-4">
                                        {pendingRequests.map(renderRequestCard)}
                                    </div>
                                </div>
                            )}

                            {filteredRequests.length === 0 && (
                                <div className="text-center py-12">
                                    <Stethoscope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 font-medium">No consultation requests found</p>
                                    <p className="text-sm text-gray-500 mt-1">Requests will appear here when patients book consultations</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Schedule Tab */}
                    {activeTab === 'schedule' && (
                        <div className="space-y-6">
                            {/* Approved Consultations */}
                            {approvedRequests.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                        <span>Upcoming Consultations ({approvedRequests.length})</span>
                                    </h3>
                                    <div className="space-y-4">
                                        {approvedRequests.map(renderRequestCard)}
                                    </div>
                                </div>
                            )}

                            {/* Completed Consultations */}
                            {completedRequests.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span>Completed Consultations ({completedRequests.length})</span>
                                    </h3>
                                    <div className="space-y-4">
                                        {completedRequests.map(renderRequestCard)}
                                    </div>
                                </div>
                            )}

                            {approvedRequests.length === 0 && completedRequests.length === 0 && (
                                <div className="text-center py-12">
                                    <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 font-medium">No scheduled consultations</p>
                                    <p className="text-sm text-gray-500 mt-1">Approved consultations will appear here</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Verification Tab */}
                    {activeTab === 'verification' && (
                        <div className="space-y-6">
                            {/* Verification Status Banners */}
                            {profile?.verificationStatus === 'pending' && !profile?.submittedForReview && (
                                <Card className="border-2 border-yellow-200 bg-yellow-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-yellow-900 mb-1">Complete Verification</h3>
                                                <p className="text-sm text-yellow-800">
                                                    Set your consultation fees and submit your profile for admin review to start accepting patients.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {profile?.verificationStatus === 'pending' && profile?.submittedForReview && (
                                <Card className="border-2 border-blue-200 bg-blue-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Clock className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-blue-900 mb-1">Profile Under Review</h3>
                                                <p className="text-sm text-blue-800">
                                                    Your profile is being reviewed by our admin team. You'll be notified once it's approved. This usually takes 24-48 hours.
                                                </p>
                                                {profile?.submittedAt && (
                                                    <p className="text-xs text-blue-700 mt-2">
                                                        Submitted on: {new Date(profile.submittedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {profile?.verificationStatus === 'rejected' && (
                                <Card className="border-2 border-red-200 bg-red-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <X className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-red-900 mb-1">Profile Needs Attention</h3>
                                                <p className="text-sm text-red-800 mb-2">
                                                    Your profile submission was not approved. Please review the feedback below and resubmit.
                                                </p>
                                                {profile?.rejectionReason && (
                                                    <div className="bg-white border border-red-200 rounded-lg p-3 mb-3">
                                                        <p className="text-sm font-medium text-red-900 mb-1">Reason:</p>
                                                        <p className="text-sm text-red-800">{profile.rejectionReason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Professional Information (Read-only) */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Professional Information</CardTitle>
                                    <CardDescription>Your profile details (update in Profile & Documents tab)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                                            <p className="text-gray-900 font-medium">{profile?.firstName} {profile?.lastName}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Specialty</Label>
                                            <p className="text-gray-900 font-medium">{profile?.specialty || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">License Number</Label>
                                            <p className="text-gray-900 font-medium">{profile?.licenseNumber || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Years of Experience</Label>
                                            <p className="text-gray-900 font-medium">{profile?.yearsOfExperience || 'Not set'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Consultation Fees */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Consultation Fees</CardTitle>
                                    <CardDescription>Set your fees for different consultation types (in NPR)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="chatFee" className="block text-sm font-medium text-gray-700 mb-2">
                                                Chat Consultation Fee (NPR)
                                            </Label>
                                            <Input
                                                id="chatFee"
                                                name="chatFee"
                                                type="number"
                                                value={verificationFees.chatFee}
                                                onChange={handleFeeChange}
                                                disabled={profile?.submittedForReview && profile?.verificationStatus === 'pending'}
                                                className="border-gray-200"
                                                placeholder="e.g., 600"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="audioFee" className="block text-sm font-medium text-gray-700 mb-2">
                                                Audio Consultation Fee (NPR)
                                            </Label>
                                            <Input
                                                id="audioFee"
                                                name="audioFee"
                                                type="number"
                                                value={verificationFees.audioFee}
                                                onChange={handleFeeChange}
                                                disabled={profile?.submittedForReview && profile?.verificationStatus === 'pending'}
                                                className="border-gray-200"
                                                placeholder="e.g., 800"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="videoFee" className="block text-sm font-medium text-gray-700 mb-2">
                                                Video Consultation Fee (NPR)
                                            </Label>
                                            <Input
                                                id="videoFee"
                                                name="videoFee"
                                                type="number"
                                                value={verificationFees.videoFee}
                                                onChange={handleFeeChange}
                                                disabled={profile?.submittedForReview && profile?.verificationStatus === 'pending'}
                                                className="border-gray-200"
                                                placeholder="e.g., 1000"
                                            />
                                        </div>

                                        {/* Workplace */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <Label htmlFor="workplace" className="block text-sm font-medium text-gray-700 mb-2">
                                                Workplace / Hospital / Clinic
                                            </Label>
                                            <Input
                                                id="workplace"
                                                name="workplace"
                                                type="text"
                                                value={verificationFees.workplace}
                                                onChange={handleFeeChange}
                                                disabled={profile?.submittedForReview && profile?.verificationStatus === 'pending'}
                                                className="border-gray-200"
                                                placeholder="e.g., City Hospital, Kathmandu"
                                            />
                                        </div>

                                        {/* Availability Days */}
                                        <div>
                                            <Label className="block text-sm font-medium text-gray-700 mb-2">
                                                Availability Days
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                    <div key={day} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={day}
                                                            checked={verificationFees.availabilityDays.includes(day)}
                                                            onChange={() => handleAvailabilityDayToggle(day)}
                                                            disabled={profile?.submittedForReview && profile?.verificationStatus === 'pending'}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <label htmlFor={day} className="text-sm text-gray-700">
                                                            {day}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Availability Time */}
                                        <div>
                                            <Label htmlFor="availabilityTime" className="block text-sm font-medium text-gray-700 mb-2">
                                                Availability Time
                                            </Label>
                                            <Input
                                                id="availabilityTime"
                                                name="availabilityTime"
                                                type="text"
                                                value={verificationFees.availabilityTime}
                                                onChange={handleFeeChange}
                                                disabled={profile?.submittedForReview && profile?.verificationStatus === 'pending'}
                                                className="border-gray-200"
                                                placeholder="e.g., 9:00 AM - 5:00 PM"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        {(!profile?.submittedForReview || profile?.verificationStatus === 'rejected') && (
                                            <div className="pt-4">
                                                <Button
                                                    onClick={handleSubmitVerification}
                                                    disabled={isSubmitting}
                                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                                                </Button>
                                                <p className="text-xs text-gray-500 mt-2 text-center">
                                                    Your profile will be reviewed by our admin team within 24-48 hours
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Profile & Documents Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Profile Section */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Manage your doctor profile and account settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={getImageUrl(profile?.profileImage)} />
                                            <AvatarFallback className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-xl font-bold">
                                                {(profile?.firstName?.[0] || user?.name?.[0] || 'D')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900">
                                                Dr. {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : user?.name}
                                            </h3>
                                            <p className="text-green-600 font-medium">Cardiologist</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            Verified Doctor
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Button
                                            onClick={() => navigate('/doctor/profile')}
                                            className="h-16 bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 flex items-center justify-center space-x-3"
                                        >
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <User className="h-5 w-5 text-green-600" />
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
                                                <p className="text-sm text-gray-600">Preferences & availability</p>
                                            </div>
                                        </Button>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <Button
                                            onClick={() => setShowSignOutDialog(true)}
                                            variant="outline"
                                            className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents Section */}
                            <DoctorDocuments />
                        </div>
                    )}
                </div>

                {/* Action Dialog */}
                <Dialog open={actionDialog} onOpenChange={setActionDialog}>
                    <DialogContent className="max-w-md bg-white">
                        <DialogHeader>
                            <DialogTitle>
                                {actionType === 'approve' ? 'Approve Consultation' : 'Reject Consultation'}
                            </DialogTitle>
                            <DialogDescription>
                                {actionType === 'approve'
                                    ? `Approve consultation request from ${selectedRequest?.patientName}?`
                                    : `Reject consultation request from ${selectedRequest?.patientName}?`
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {actionType === 'reject' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Reason for rejection *
                                    </label>
                                    <Textarea
                                        placeholder="Please provide a reason for rejecting this consultation..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setActionDialog(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirmAction}
                                    className={`flex-1 ${actionType === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Document Upload Dialog */}
                <Dialog open={documentDialog} onOpenChange={setDocumentDialog}>
                    <DialogContent className="max-w-md bg-white">
                        <DialogHeader>
                            <DialogTitle>Upload New Document</DialogTitle>
                            <DialogDescription>
                                Upload your professional documents for verification
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="docType">Document Type</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select document type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="license">Medical License</SelectItem>
                                        <SelectItem value="degree">Degree Certificate</SelectItem>
                                        <SelectItem value="specialization">Specialization Certificate</SelectItem>
                                        <SelectItem value="insurance">Insurance Policy</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="docName">Document Name</Label>
                                <Input placeholder="Enter document name" />
                            </div>

                            <div>
                                <Label htmlFor="docFile">Upload File</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setDocumentDialog(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        handleDocumentUpload();
                                        setDocumentDialog(false);
                                    }}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    Upload Document
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Sign Out Confirmation Dialog */}
                <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
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

                {/* Prescription Dialog */}
                <PrescriptionDialog
                    open={prescriptionDialog}
                    onOpenChange={setPrescriptionDialog}
                    consultation={selectedConsultation}
                    doctorProfile={profile}
                    patientProfile={{
                        firstName: selectedConsultation?.patientName?.split(' ')[0] || '',
                        lastName: selectedConsultation?.patientName?.split(' ')[1] || '',
                        dateOfBirth: null, // Would come from actual patient data
                        gender: selectedConsultation?.gender || 'N/A'
                    }}
                />
            </div>
        </div >
    );
}
