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
        // Check for stored user session
        const storedUser = localStorage.getItem('swasthya_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('swasthya_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password, role) => {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check demo users
        const demoUser = demoUsers.find(u =>
            u.email === email &&
            u.password === password &&
            (!role || u.role === role)
        );

        if (demoUser) {
            const userData = {
                id: demoUser.id,
                name: demoUser.name,
                email: demoUser.email,
                role: demoUser.role,
                verified: demoUser.verified
            };

            setUser(userData);
            localStorage.setItem('swasthya_user', JSON.stringify(userData));
            setIsLoading(false);
            return;
        }

        // If not demo user, create a new user session
        const userData = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email,
            role: role || 'patient',
            verified: true
        };

        setUser(userData);
        localStorage.setItem('swasthya_user', JSON.stringify(userData));
        setIsLoading(false);
    };

    const register = async (userData) => {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            role: userData.role,
            verified: userData.role === 'patient', // Patients are auto-verified, others need admin approval
            documents: userData.documents ? [userData.documents] : undefined
        };

        setUser(newUser);
        localStorage.setItem('swasthya_user', JSON.stringify(newUser));
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('swasthya_user');
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
