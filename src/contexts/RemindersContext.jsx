import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { remindersAPI } from '@/services/api';
import { toast } from 'sonner';

const RemindersContext = createContext(undefined);

export const useReminders = () => {
    const context = useContext(RemindersContext);
    if (!context) {
        throw new Error('useReminders must be used within a RemindersProvider');
    }
    return context;
};

export const RemindersProvider = ({ children }) => {
    const { user } = useAuth();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔄 RemindersContext: useEffect triggered, user:', user?.id);
        if (user) {
            console.log('🔄 RemindersContext: User found, loading reminders...');
            loadReminders();
        } else {
            console.log('⚠️  RemindersContext: No user found, skipping reminders load');
            setReminders([]);
            setLoading(false);
        }
    }, [user]);

    const loadReminders = async () => {
        if (!user) return;

        setLoading(true);
        try {
            console.log('🔄 RemindersContext: Fetching reminders from API...');
            const response = await remindersAPI.getReminders();
            console.log('✅ RemindersContext: Reminders loaded:', response.data.data);
            setReminders(response.data.data);
        } catch (error) {
            console.error('❌ RemindersContext: Failed to load reminders:', error);
            toast.error('Failed to load reminders');
        } finally {
            setLoading(false);
        }
    };

    const createReminder = async (reminderData) => {
        try {
            console.log('🔄 RemindersContext: Creating reminder...', reminderData);
            const response = await remindersAPI.createReminder(reminderData);
            console.log('✅ RemindersContext: Reminder created:', response.data.data);
            setReminders(prev => [response.data.data, ...prev]);
            toast.success(`Reminder for ${reminderData.medicineName} has been set`);
            return response.data.data;
        } catch (error) {
            console.error('❌ RemindersContext: Failed to create reminder:', error);
            toast.error('Failed to create reminder');
            throw error;
        }
    };

    const updateReminder = async (id, reminderData) => {
        try {
            const response = await remindersAPI.updateReminder(id, reminderData);
            setReminders(prev => prev.map(r => r._id === id ? response.data.data : r));
            toast.success('Reminder updated successfully');
            return response.data.data;
        } catch (error) {
            console.error('Failed to update reminder:', error);
            toast.error('Failed to update reminder');
            throw error;
        }
    };

    const deleteReminder = async (id) => {
        try {
            await remindersAPI.deleteReminder(id);
            const reminder = reminders.find(r => r._id === id);
            setReminders(prev => prev.filter(r => r._id !== id));
            toast.success(`Reminder for ${reminder?.medicineName} has been deleted`);
        } catch (error) {
            console.error('Failed to delete reminder:', error);
            toast.error('Failed to delete reminder');
            throw error;
        }
    };

    const toggleReminder = async (id) => {
        try {
            const response = await remindersAPI.toggleReminder(id);
            setReminders(prev => prev.map(r => r._id === id ? response.data.data : r));
            const reminder = response.data.data;
            toast.info(`Reminder ${reminder.isActive ? 'activated' : 'paused'}`);
            return response.data.data;
        } catch (error) {
            console.error('Failed to toggle reminder:', error);
            toast.error('Failed to toggle reminder');
            throw error;
        }
    };

    return (
        <RemindersContext.Provider value={{
            reminders,
            loading,
            createReminder,
            updateReminder,
            deleteReminder,
            toggleReminder,
            refreshReminders: loadReminders
        }}>
            {children}
        </RemindersContext.Provider>
    );
};
