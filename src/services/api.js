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
    updateProfile: (data) => api.post('/profile', data),
    uploadProfileImage: (formData) => api.post('/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteProfileImage: () => api.delete('/profile/image'),
    uploadVerificationDocument: (formData) => api.post('/profile/verification-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    submitForReview: () => api.post('/profile/submit-review')
};

// Medicine Reminders API
export const remindersAPI = {
    getReminders: () => api.get('/reminders'),
    getReminder: (id) => api.get(`/reminders/${id}`),
    createReminder: (data) => api.post('/reminders', data),
    updateReminder: (id, data) => api.put(`/reminders/${id}`, data),
    deleteReminder: (id) => api.delete(`/reminders/${id}`),
    toggleReminder: (id) => api.patch(`/reminders/${id}/toggle`)
};

// Consultations API
export const consultationsAPI = {
    getConsultations: (status = 'all') => api.get('/consultations', { params: { status } }),
    getConsultation: (id) => api.get(`/consultations/${id}`),
    bookConsultation: (data) => api.post('/consultations', data),
    updateConsultation: (id, data) => api.put(`/consultations/${id}`, data),
    cancelConsultation: (id) => api.delete(`/consultations/${id}`),
    rateConsultation: (id, rating) => api.post(`/consultations/${id}/rate`, { rating })
};

// Doctors API
export const doctorsAPI = {
    getDoctors: (params = {}) => api.get('/doctors', { params }),
    getDoctor: (id) => api.get(`/doctors/${id}`),
    getSpecialties: () => api.get('/doctors/specialties')
};

// Pharmacies API
export const pharmaciesAPI = {
    getPharmacies: (params = {}) => api.get('/pharmacies', { params }),
    getPharmacy: (id) => api.get(`/pharmacies/${id}`)
};

// Stats API
export const statsAPI = {
    getDashboardStats: () => api.get('/stats/dashboard')
};

// Auth API (if not already exists)
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout')
};

// Payment API
export const paymentAPI = {
    initiateEsewa: (consultationId) => api.post('/payment/esewa/initiate', { consultationId }),
    verifyEsewa: (data) => api.post(`/payment/esewa/verify?data=${data}`),
    verifyKhalti: (token, amount, consultationId) => api.post('/payment/khalti/verify', { token, amount, consultationId })
};

// Documents API
export const documentsAPI = {
    uploadDocument: (formData) => api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMyDocuments: () => api.get('/documents/my-documents'),
    updateDocument: (id, data) => api.put(`/documents/${id}`, data),
    deleteDocument: (id) => api.delete(`/documents/${id}`),
    // Admin endpoints (for future use)
    getAllDocuments: (status) => api.get('/documents/all', { params: { status } }),
    verifyDocument: (id) => api.put(`/documents/${id}/verify`),
    rejectDocument: (id, reason) => api.put(`/documents/${id}/reject`, { reason })
};

export const prescriptionsAPI = {
    create: (data) => api.post('/prescriptions/create', data),
    getByConsultation: (consultationId) => api.get(`/prescriptions/consultation/${consultationId}`),
    update: (id, data) => api.put(`/prescriptions/${id}`, data),
    downloadPDF: (id) => {
        return api.get(`/prescriptions/${id}/pdf`, {
            responseType: 'blob'
        });
    }
};

export const adminAPI = {
    getVerificationStats: () => api.get('/admin/stats'),
    getPendingProfiles: () => api.get('/admin/pending-profiles'),
    getApprovedProfiles: () => api.get('/admin/approved-profiles'),
    getRejectedProfiles: () => api.get('/admin/rejected-profiles'),
    approveProfile: (profileId) => api.put(`/admin/approve/${profileId}`),
    rejectProfile: (profileId, reason) => api.put(`/admin/reject/${profileId}`, { reason })
};

export default api;
