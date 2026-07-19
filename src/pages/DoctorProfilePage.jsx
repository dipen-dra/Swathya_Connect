import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Clock, MessageCircle, Phone, Video, Calendar, ArrowLeft, Loader2, GraduationCap, Briefcase, Award } from 'lucide-react';
import { doctorsAPI, consultationsAPI, paymentAPI, profileAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PaymentDialog from '@/components/ui/payment-dialog';

export default function DoctorProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (id) {
            fetchDoctorDetails();
            fetchReviews();
        }
    }, [id]);

    const fetchDoctorDetails = async () => {
        try {
            setLoading(true);
            const response = await doctorsAPI.getDoctorById(id);
            if (response.data.success) {
                setDoctor(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching doctor details:', error);
            toast.error('Failed to load doctor profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await consultationsAPI.getConsultations();
            if (response.data.success) {
                const doctorReviews = response.data.data
                    .filter(c => c.doctorId === id && c.review)
                    .map(c => ({
                        id: c._id,
                        patientName: c.patientId?.fullName || 'Patient',
                        rating: c.rating,
                        review: c.review,
                        date: c.ratedAt || c.updatedAt,
                    }));
                setReviews(doctorReviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleBookConsultation = (type, fee) => {
        if (!user || user.role !== 'patient') {
            toast.error('Please login as a patient to book a consultation');
            navigate('/login');
            return;
        }

        setSelectedConsultation({
            doctorId: id,
            doctorName: `Dr. ${doctor?.firstName} ${doctor?.lastName}`,
            specialty: doctor?.specialty,
            type,
            fee,
            doctorImage: doctor?.profileImage,
        });
        setShowPayment(true);
    };

    const handlePaymentSuccess = async (paymentData) => {
        try {
            const consultationData = {
                doctorId: selectedConsultation.doctorId,
                date: new Date().toISOString(),
                time: '10:00 AM',
                type: selectedConsultation.type,
                reason: 'General consultation',
                fee: selectedConsultation.fee,
            };

            await consultationsAPI.bookConsultation(consultationData);
            toast.success('Consultation booked successfully!');
            navigate('/dashboard/consultations');
        } catch (error) {
            console.error('Error booking consultation:', error);
            toast.error('Failed to book consultation');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8080"}${imagePath}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Not Found</h2>
                    <p className="text-gray-600 mb-4">The doctor you are looking for does not exist.</p>
                    <Button onClick={() => navigate('/doctors')}>Browse Doctors</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Doctor Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                                <div className="flex items-start space-x-6">
                                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                        <AvatarImage src={getImageUrl(doctor.profileImage)} />
                                        <AvatarFallback className="text-2xl bg-blue-700">
                                            {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold">
                                            Dr. {doctor.firstName} {doctor.lastName}
                                        </h1>
                                        <p className="text-blue-100 text-lg mt-1">{doctor.specialty || 'General Physician'}</p>
                                        <div className="flex items-center space-x-4 mt-3">
                                            <div className="flex items-center">
                                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                                <span className="ml-1 font-semibold">{doctor.rating || 0}</span>
                                            </div>
                                            <span className="text-blue-200">|</span>
                                            <span>{doctor.patients || 0} patients</span>
                                            <span className="text-blue-200">|</span>
                                            <span>{doctor.yearsOfExperience || 0} years exp.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                                        <div
                                            className="text-gray-600 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: doctor.professionalBio || `Dr. ${doctor.firstName} ${doctor.lastName} is a dedicated ${doctor.specialty || 'medical professional'} committed to providing quality healthcare.` }}
                                        />
                                    </div>

                                    {doctor.education && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Education</h3>
                                            <div className="flex items-start space-x-3 text-gray-600">
                                                <GraduationCap className="h-5 w-5 mt-0.5 text-blue-600" />
                                                <span>{doctor.education}</span>
                                            </div>
                                        </div>
                                    )}

                                    {doctor.workplace && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Workplace</h3>
                                            <div className="flex items-start space-x-3 text-gray-600">
                                                <Briefcase className="h-5 w-5 mt-0.5 text-blue-600" />
                                                <span>{doctor.workplace}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviews Section */}
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Reviews</h3>
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No reviews yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                                                                {review.patientName?.[0] || 'P'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-gray-900">{review.patientName}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div
                                                    className="text-gray-600 text-sm"
                                                    dangerouslySetInnerHTML={{ __html: review.review }}
                                                />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(review.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Booking */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-lg sticky top-24">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Consultation</h3>
                                <div className="space-y-3">
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                        onClick={() => handleBookConsultation('chat', doctor.chatFee || 600)}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Chat Consultation - NPR {doctor.chatFee || 600}
                                    </Button>
                                    <Button
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                        onClick={() => handleBookConsultation('audio', doctor.audioFee || 800)}
                                    >
                                        <Phone className="h-4 w-4 mr-2" />
                                        Audio Consultation - NPR {doctor.audioFee || 800}
                                    </Button>
                                    <Button
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                        onClick={() => handleBookConsultation('video', doctor.videoFee || 1000)}
                                    >
                                        <Video className="h-4 w-4 mr-2" />
                                        Video Consultation - NPR {doctor.videoFee || 1000}
                                    </Button>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span>{doctor.workplace || 'Location not specified'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span>{doctor.availabilityTime || 'Available'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Award className="h-4 w-4 text-gray-400" />
                                            <span>License: {doctor.licenseNumber || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {showPayment && selectedConsultation && (
                <PaymentDialog
                    open={showPayment}
                    onClose={() => setShowPayment(false)}
                    bookingData={selectedConsultation}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}