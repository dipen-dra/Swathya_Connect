import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        // Connect for patient, pharmacy, AND doctor roles
        if (token && user && (user.role === 'patient' || user.role === 'pharmacy' || user.role === 'doctor')) {
            console.log('🔌 Initializing socket connection for:', user.role);

            const newSocket = io('http://localhost:5000', {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling'],
                autoConnect: true
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket connected');
                console.log('🆔 Frontend Socket ID:', newSocket.id);
                setConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error.message);
                setConnected(false);
            });

            newSocket.on('error', (error) => {
                console.error('❌ Socket error:', error);
            });

            setSocket(newSocket);

            return () => {
                console.log('🔌 Closing socket connection');
                newSocket.close();
            };
        } else {
            // Disconnect if user logs out or is not patient/pharmacy/doctor
            if (socket) {
                socket.close();
                setSocket(null);
                setConnected(false);
            }
        }
    }, [user]);

    const value = {
        socket,
        connected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
