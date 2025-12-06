import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

const NotificationContext = createContext(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load notifications from localStorage only once on mount
    useEffect(() => {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            try {
                const parsedNotifications = JSON.parse(saved);
                setNotifications(parsedNotifications);
            } catch (error) {
                console.error('Error parsing notifications from localStorage:', error);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save notifications to localStorage only after initialization and when notifications change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('notifications', JSON.stringify(notifications));
        }
    }, [notifications, isInitialized]);

    // Memoize unreadCount to prevent unnecessary recalculations
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const addNotification = useCallback((notificationData, showToast = true) => {
        const notification = {
            ...notificationData,
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            read: false,
            createdAt: new Date().toISOString(),
        };

        setNotifications(prev => [notification, ...prev]);

        // Only show toast if explicitly requested (not for notifications loaded from localStorage)
        if (showToast) {
            setTimeout(() => {
                toast[notification.type](notification.title, {
                    description: notification.message,
                });
            }, 0);
        }
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    }, []);

    const deleteNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const contextValue = useMemo(() => ({
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification, clearAll]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};
