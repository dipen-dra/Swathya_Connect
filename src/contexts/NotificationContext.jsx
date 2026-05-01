import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'sonner';

const NotificationContext = createContext(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

// userId prop is required so we namespace storage per user and never leak across accounts
export const NotificationProvider = ({ children, userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Build a user-specific storage key so different users never share notifications
    const storageKey = userId ? `notifications_${userId}` : null;

    // Track the previous userId so we can detect user switches
    const prevUserIdRef = useRef(userId);

    // Load / reload notifications whenever the logged-in user changes
    useEffect(() => {
        // If user switched (or logged out), wipe current in-memory notifications first
        if (prevUserIdRef.current !== userId) {
            setNotifications([]);
            prevUserIdRef.current = userId;
        }

        // No user logged in → nothing to restore
        if (!storageKey) {
            setIsInitialized(true);
            return;
        }

        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsedNotifications = JSON.parse(saved);
                setNotifications(parsedNotifications);
            } catch (error) {
                console.error('Error parsing notifications from localStorage:', error);
            }
        } else {
            // Fresh user – start with empty list
            setNotifications([]);
        }
        setIsInitialized(true);
    }, [storageKey]); // re-runs whenever userId changes (storageKey derives from userId)

    // Persist to the user-specific key whenever notifications change (after init)
    useEffect(() => {
        if (isInitialized && storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(notifications));
        }
    }, [notifications, isInitialized, storageKey]);

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
