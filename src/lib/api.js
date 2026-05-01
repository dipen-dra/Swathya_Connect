import axios from 'axios';

// Create an Axios instance configured for our API
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    withCredentials: true, // Send HttpOnly cookies automatically
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // CSRF mitigation
    }
});

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized globally
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
            // Check if it's an expired token that might need refresh
            if (error.response.data?.message?.includes('expired') || error.response.data?.message?.includes('invalid')) {
                originalRequest._retry = true;
                
                try {
                    // Attempt to refresh the token using the refresh cookie
                    await axios.post(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );
                    
                    // Retry the original request
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, user needs to login again
                    // Trigger global logout by dispatching an event that AuthContext can listen to
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                    return Promise.reject(refreshError);
                }
            } else {
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }
        }
        
        // Handle 403 Forbidden specifically for deactivated accounts
        if (error.response?.status === 403 && error.response.data?.message?.includes('deactivated')) {
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        
        return Promise.reject(error);
    }
);

export default api;
