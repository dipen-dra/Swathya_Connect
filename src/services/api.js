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
    uploadProfileImage: (formData) => api.post('/profile/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    deleteProfileImage: () => api.delete('/profile/image'),
    submitForReview: () => api.post('/profile/submit-review')
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
    deleteReminder: (id) => api.delete(`/reminders/${id}`),
    toggleReminder: (id) => api.put(`/reminders/${id}/toggle`)
};

// Consultations API
export const consultationsAPI = {
    getConsultations: () => api.get('/consultations'),
    createConsultation: (consultationData) => api.post('/consultations', consultationData),
    bookConsultation: (consultationData) => api.post('/consultations', consultationData),
    updateConsultation: (id, updateData) => api.put(`/consultations/${id}`, updateData),
    cancelConsultation: (id, reason) => api.put(`/consultations/${id}/cancel`, { reason }),
    rateConsultation: (id, rating) => api.put(`/consultations/${id}/rate`, { rating }),
    reRequestConsultation: (consultationId) => api.post(`/consultations/${consultationId}/re-request`)
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
    getDashboardStats: () => api.get('/stats/dashboard'),
    getPatientStats: () => api.get('/stats/patient'),
    getDoctorStats: () => api.get('/stats/doctor')
};

// Payment API
export const paymentAPI = {
    // Consultation payments
    initiateKhaltiPayment: (bookingData) => api.post('/payment/khalti/initiate', { bookingData }),
    verifyKhaltiPayment: (token, amount, bookingData) => api.post('/payment/khalti/verify', { token, amount, bookingData }),
    initiateEsewaPayment: (bookingData) => api.post('/payment/esewa/initiate', bookingData),
    initiateEsewa: (bookingData) => api.post('/payment/esewa/initiate', bookingData),
    verifyEsewaPayment: (params) => api.get('/payment/esewa/verify', params),
    verifyEsewa: (params) => api.get('/payment/esewa/verify', params),

    // Medicine order payments
    initiateEsewaMedicine: (orderData) => api.post('/payment/esewa/initiate-medicine', { orderData }),
    verifyEsewaMedicine: (params) => api.get('/payment/esewa/verify-medicine', params),
    verifyKhaltiMedicine: (token, amount, orderData) => api.post('/payment/khalti/verify-medicine', { token, amount, orderData }),
};

// Documents API
export const documentsAPI = {
    getMyDocuments: () => api.get('/documents/my-documents'),
    uploadDocument: (formData) => api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteDocument: (id) => api.delete(`/documents/${id}`)
};

// Prescriptions API
export const prescriptionsAPI = {
    getPrescriptions: () => api.get('/prescriptions'),
    getByConsultation: (consultationId) => api.get(`/prescriptions/consultation/${consultationId}`),
    create: (prescriptionData) => api.post('/prescriptions/create', prescriptionData),
    createPrescription: (prescriptionData) => api.post('/prescriptions/create', prescriptionData),
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

// Category API
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    create: (formData) => api.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Transaction API
export const transactionAPI = {
    getAll: () => api.get('/transactions/patient'),
    delete: (id, type) => api.delete(`/transactions/${id}`, { params: { type } }),
    downloadPDF: (id, type) => api.get(`/transactions/${id}/invoice`, { params: { type }, responseType: 'blob' })
};

// Chat API
export const chatAPI = {
    getChats: () => api.get('/chats'),
    getChatMessages: (chatId) => api.get(`/chats/${chatId}/messages`),
    createChat: (pharmacyId) => api.post('/chats', { pharmacyId }),
    markAsRead: (chatId) => api.put(`/chats/${chatId}/read`),
    uploadFile: (formData) => api.post('/chats/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    clearChatHistory: (chatId) => api.put(`/chats/${chatId}/clear`)
};

// Consultation Chat API (for doctor-patient consultations)
export const consultationChatAPI = {
    getConsultationChat: (consultationId) => api.get(`/consultation-chat/${consultationId}`),
    getMessages: (consultationId) => api.get(`/consultation-chat/${consultationId}/messages`),
    sendMessage: (consultationId, messageData) => api.post(`/consultation-chat/${consultationId}/messages`, messageData),
    markMessagesAsRead: (consultationId) => api.put(`/consultation-chat/${consultationId}/read`),
    endConsultation: (consultationId) => api.post(`/consultation-chat/${consultationId}/end`),
    uploadFile: (formData) => api.post('/consultation-chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    clearChatHistory: (id) => api.put(`/consultation-chat/${id}/clear`),
    generateAgoraToken: (consultationId) => api.post(`/consultation-chat/${consultationId}/agora-token`),
    startCallTimer: (consultationId) => api.post(`/consultation-chat/${consultationId}/start-timer`)
};

// Medicine Order API
export const medicineOrderAPI = {
    // Patient endpoints
    createOrder: (formData) => api.post('/medicine-orders', formData),
    getPatientOrders: () => api.get('/medicine-orders'),
    cancelOrder: (orderId) => api.put(`/medicine-orders/${orderId}/cancel`),
    confirmPayment: (orderId, paymentData) => api.put(`/medicine-orders/${orderId}/confirm-payment`, paymentData),

    // Pharmacy endpoints
    // Shared
    getOrderById: (orderId) => api.get(`/medicine-orders/${orderId}`)
};

// Pharmacy API
export const pharmacyAPI = {
    // Inventory
    getInventory: () => api.get('/pharmacies/dashboard/inventory'),
    addInventory: (data) => {
        const isFormData = data instanceof FormData;
        return api.post('/pharmacies/dashboard/inventory', data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
    },
    updateInventory: (id, data) => {
        const isFormData = data instanceof FormData;
        return api.put(`/pharmacies/dashboard/inventory/${id}`, data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
    },
    deleteInventory: (id) => api.delete(`/pharmacies/dashboard/inventory/${id}`),

    // Order Management
    getPharmacyOrders: (status) => api.get('/medicine-orders/pharmacy', { params: { status } }), // This stands correct as per medicineOrderRoutes
    updateOrderStatus: (orderId, status) => api.put(`/medicine-orders/${orderId}/status`, { status }),
    verifyPrescription: (orderId, data) => api.put(`/medicine-orders/${orderId}/verify`, data),
    rejectPrescription: (orderId, reason) => api.put(`/medicine-orders/${orderId}/reject`, { reason }),
};

// Store API
export const storeAPI = {
    getProducts: (params) => api.get('/store/products', { params }),
    getProduct: (id) => api.get(`/store/products/${id}`),
    getCategories: () => api.get('/store/categories'),
    validatePromo: (code) => api.post('/store/promo/validate', { code })
};

export default api;
