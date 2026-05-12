import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Demo users for testing
const demoUsers = [
    { id: '1', name: 'John Patient', email: 'patient@demo.com', password: 'demo123', role: 'patient', verified: true },
    { id: '2', name: 'Dr. Sarah Wilson', email: 'doctor@demo.com', password: 'demo123', role: 'doctor', verified: true },
    { id: '3', name: 'MediCare Pharmacy', email: 'pharmacy@demo.com', password: 'demo123', role: 'pharmacy', verified: true },
    { id: '4', name: 'Admin User', email: 'admin@demo.com', password: 'demo123', role: 'admin', verified: true },
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored user session (metadata only, token is in HttpOnly cookie)
        const storedUser = localStorage.getItem('swasthya_user');
        console.log('🔐 AuthContext: Checking stored session, user:', storedUser ? 'Yes' : 'No');

        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                console.log('✅ AuthContext: Restored user session:', userData);
                setUser(userData);
            } catch (error) {
                console.error('❌ AuthContext: Error parsing stored user data:', error);
                localStorage.removeItem('swasthya_user');
            }
        }
        setIsLoading(false);

        // Listen for global logout events dispatched by api interceptor
        const handleGlobalLogout = () => {
            console.log('🔐 AuthContext: Global logout event received');
            logout();
        };

        window.addEventListener('auth:logout', handleGlobalLogout);

        return () => {
            window.removeEventListener('auth:logout', handleGlobalLogout);
        };
    }, []);

    const login = async (email, password, role) => {
        setIsLoading(true);
        console.log('🔐 AuthContext: Attempting login for:', email);

        try {
            // Call real backend API
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();
            console.log('📥 AuthContext: Login response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store user data and token
            const userData = {
                id: data.user._id,
                name: data.user.fullName,
                email: data.user.email,
                role: data.user.role,
                verified: data.user.isVerified
            };

            console.log('✅ AuthContext: Login successful, storing user and token:', userData);
            setUser(userData);
            localStorage.setItem('swasthya_user', JSON.stringify(userData));
            localStorage.setItem('token', data.token); // Store token for components that need it (like SocketContext)
            setIsLoading(false);
        } catch (error) {
            console.error('❌ AuthContext: Login error:', error);
            setIsLoading(false);
            throw error;
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        console.log('🔐 AuthContext: Attempting registration for:', userData.email);

        try {
            // Call real backend API
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            console.log('📥 AuthContext: Register response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store user data and token
            const newUser = {
                id: data.user._id,
                name: data.user.fullName,
                email: data.user.email,
                role: data.user.role,
                verified: data.user.isVerified
            };

            console.log('✅ AuthContext: Registration successful, storing user and token:', newUser);
            setUser(newUser);
            localStorage.setItem('swasthya_user', JSON.stringify(newUser));
            localStorage.setItem('token', data.token); // Store token for components that need it
            setIsLoading(false);
        } catch (error) {
            console.error('❌ AuthContext: Registration error:', error);
            setIsLoading(false);
            throw error;
        }
    };

    const logout = () => {
        console.log('🔐 AuthContext: Logging out, clearing session');
        setUser(null);
        localStorage.removeItem('swasthya_user');
        localStorage.removeItem('token');
        
        // Notify backend to clear the cookie as well
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        }).catch(err => console.error('Logout error:', err));

        Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith('patient-dashboard-welcome-shown-') || key.startsWith('doctor-dashboard-welcome-shown-')) {
                sessionStorage.removeItem(key);
            }
        });
    };

    const value = {
        user,
        login,
        register,
        logout,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
