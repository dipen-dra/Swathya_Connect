import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('🔐 API Request:', config.method.toUpperCase(), config.url);
        console.log('🔐 Token found:', token ? 'Yes' : 'No');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data) {
            console.log('📤 Request data:', config.data);
        }
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for logging
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.url, response.status);
        console.log('📥 Response data:', response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', error.response?.status, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Profile API
export const profileAPI = {
    getProfile: () => api.get('/profile'),
    getUserProfile: (userId) => api.get(`/profile/${userId}`),
    updateProfile: (data) => api.post('/profile', data),
    uploadProfileImage: (formData) => api.post('/profile/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
};

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
    resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword })
};

// Reminders API
export const remindersAPI = {
    getReminders: () => api.get('/reminders'),
    createReminder: (reminderData) => api.post('/reminders', reminderData),
    updateReminder: (id, reminderData) => api.put(`/reminders/${id}`, reminderData),
    deleteReminder: (id) => api.delete(`/reminders/${id}`)
};

// Consultations API
export const consultationsAPI = {
    getConsultations: () => api.get('/consultations'),
    createConsultation: (consultationData) => api.post('/consultations', consultationData),
    updateConsultation: (id, updateData) => api.put(`/consultations/${id}`, updateData),
    cancelConsultation: (id, reason) => api.put(`/consultations/${id}/cancel`, { reason }),
    rateConsultation: (id, rating) => api.put(`/consultations/${id}/rate`, { rating })
};

// Doctors API
export const doctorsAPI = {
    getDoctors: () => api.get('/doctors'),
    getDoctorById: (id) => api.get(`/doctors/${id}`),
    getConsultationRequests: () => api.get('/doctors/consultation-requests'),
    updateConsultationStatus: (id, status, rejectionReason = '') =>
        api.put(`/doctors/consultations/${id}/status`, { status, rejectionReason }),
    getEarnings: () => api.get('/doctors/earnings'),
    submitForReview: () => api.post('/profile/submit-for-review')
};

// Pharmacies API
export const pharmaciesAPI = {
    getPharmacies: () => api.get('/pharmacies'),
    getPharmacyById: (id) => api.get(`/pharmacies/${id}`)
};

// Stats API
export const statsAPI = {
    getPatientStats: () => api.get('/stats/patient'),
    getDoctorStats: () => api.get('/stats/doctor')
};

// Payment API
export const paymentAPI = {
    initiateKhaltiPayment: (consultationId) => api.post('/payment/khalti/initiate', { consultationId }),
    verifyKhaltiPayment: (pidx, consultationId) => api.post('/payment/khalti/verify', { pidx, consultationId }),
    initiateEsewaPayment: (consultationId) => api.post('/payment/esewa/initiate', { consultationId }),
    initiateEsewaMedicine: (orderId) => api.post('/payment/esewa/initiate-medicine', { orderId }),
    verifyEsewaPayment: (data) => api.post('/payment/esewa/verify', data)
};

// Documents API
export const documentsAPI = {
    uploadDocument: (formData) => api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    getDocuments: () => api.get('/documents'),
    deleteDocument: (id) => api.delete(`/documents/${id}`)
};

// Prescriptions API
export const prescriptionsAPI = {
    getPrescriptions: () => api.get('/prescriptions'),
    getByConsultation: (consultationId) => api.get(`/prescriptions/consultation/${consultationId}`),
    createPrescription: (prescriptionData) => api.post('/prescriptions', prescriptionData),
    updatePrescription: (id, prescriptionData) => api.put(`/prescriptions/${id}`, prescriptionData),
    deletePrescription: (id) => api.delete(`/prescriptions/${id}`),
    downloadPDF: (id) => api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' })
};

// Admin API
export const adminAPI = {
    getVerificationStats: () => api.get('/admin/stats'),
    getPendingProfiles: () => api.get('/admin/pending-profiles'),
    getApprovedProfiles: () => api.get('/admin/approved-profiles'),
    getRejectedProfiles: () => api.get('/admin/rejected-profiles'),
    approveProfile: (profileId) => api.put(`/admin/approve/${profileId}`),
    rejectProfile: (profileId, reason) => api.put(`/admin/reject/${profileId}`, { reason }),
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getAnalytics: () => api.get('/admin/analytics')
};

// Chat API
export const chatAPI = {
    getChats: () => api.get('/chats'),
    getChatMessages: (chatId) => api.get(`/chats/${chatId}/messages`),
    createChat: (pharmacyId) => api.post('/chats', { pharmacyId }),
    markAsRead: (chatId) => api.put(`/chats/${chatId}/read`),
    uploadFile: (formData) => api.post('/chats/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Medicine Order API
export const medicineOrderAPI = {
    // Patient endpoints
    createOrder: (formData) => api.post('/medicine-orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getPatientOrders: () => api.get('/medicine-orders'),
    cancelOrder: (orderId) => api.put(`/medicine-orders/${orderId}/cancel`),
    confirmPayment: (orderId, paymentData) => api.put(`/medicine-orders/${orderId}/confirm-payment`, paymentData),

    // Pharmacy endpoints
    getPharmacyOrders: (status) => api.get('/medicine-orders/pharmacy', { params: { status } }),
    verifyPrescription: (orderId, data) => api.put(`/medicine-orders/${orderId}/verify`, data),
    rejectPrescription: (orderId, reason) => api.put(`/medicine-orders/${orderId}/reject`, { reason }),
    updateOrderStatus: (orderId, status, notes) => api.put(`/medicine-orders/${orderId}/status`, { status, notes }),

    // Shared
    getOrderById: (orderId) => api.get(`/medicine-orders/${orderId}`)
};

export default api;
