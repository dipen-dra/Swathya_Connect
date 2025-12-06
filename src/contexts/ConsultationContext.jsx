import React, { createContext, useContext, useState } from 'react';

const ConsultationContext = createContext(undefined);

export const useConsultations = () => {
    const context = useContext(ConsultationContext);
    if (context === undefined) {
        throw new Error('useConsultations must be used within a ConsultationProvider');
    }
    return context;
};

export const ConsultationProvider = ({ children }) => {
    const [consultations, setConsultations] = useState([]);

    const addConsultation = (consultationData) => {
        const newConsultation = {
            ...consultationData,
            id: `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        setConsultations(prev => [...prev, newConsultation]);
    };

    const getConsultationsByPatient = (patientId) => {
        return consultations.filter(consultation => consultation.patientId === patientId);
    };

    const getConsultationsByDoctor = (doctorId) => {
        return consultations.filter(consultation => consultation.doctorId === doctorId);
    };

    const approveConsultation = async (consultationId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                setConsultations(prev => prev.map(consultation =>
                    consultation.id === consultationId
                        ? {
                            ...consultation,
                            status: 'approved',
                            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
                        }
                        : consultation
                ));
                resolve();
            }, 1000);
        });
    };

    const rejectConsultation = async (consultationId, reason) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                setConsultations(prev => prev.map(consultation =>
                    consultation.id === consultationId
                        ? {
                            ...consultation,
                            status: 'rejected',
                            rejectionReason: reason
                        }
                        : consultation
                ));
                resolve();
            }, 1000);
        });
    };

    const processPayment = async (consultationId, paymentMethod) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const consultationLink = `https://meet.swasthya.com/room/${consultationId}`;

                setConsultations(prev => prev.map(consultation =>
                    consultation.id === consultationId
                        ? {
                            ...consultation,
                            status: 'paid',
                            consultationLink
                        }
                        : consultation
                ));
                resolve(true);
            }, 2000);
        });
    };

    const value = {
        consultations,
        addConsultation,
        getConsultationsByPatient,
        getConsultationsByDoctor,
        approveConsultation,
        rejectConsultation,
        processPayment
    };

    return (
        <ConsultationContext.Provider value={value}>
            {children}
        </ConsultationContext.Provider>
    );
};
