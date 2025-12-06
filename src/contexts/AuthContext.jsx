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
        // Check for stored user session and token
        const storedUser = localStorage.getItem('swasthya_user');
        const token = localStorage.getItem('token');
        console.log('🔐 AuthContext: Checking stored session, user:', storedUser ? 'Yes' : 'No', 'token:', token ? 'Yes' : 'No');

        if (storedUser && token) {
            try {
                const userData = JSON.parse(storedUser);
                console.log('✅ AuthContext: Restored user session:', userData);
                setUser(userData);
            } catch (error) {
                console.error('❌ AuthContext: Error parsing stored user data:', error);
                localStorage.removeItem('swasthya_user');
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password, role) => {
        setIsLoading(true);
        console.log('🔐 AuthContext: Attempting login for:', email);

        try {
            // Call real backend API
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
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

            console.log('✅ AuthContext: Login successful, storing user:', userData);
            setUser(userData);
            localStorage.setItem('swasthya_user', JSON.stringify(userData));
            localStorage.setItem('token', data.token);
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
            const response = await fetch('http://localhost:5000/api/auth/register', {
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

            console.log('✅ AuthContext: Registration successful, storing user:', newUser);
            setUser(newUser);
            localStorage.setItem('swasthya_user', JSON.stringify(newUser));
            localStorage.setItem('token', data.token);
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
