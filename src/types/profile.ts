export interface BaseProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    profileImage?: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    createdAt: string;
    updatedAt: string;
}

export interface PatientProfile extends BaseProfile {
    bloodGroup: string;
    allergies: string[];
    medicalHistory: string[];
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
    insurance?: {
        provider: string;
        policyNumber: string;
    };
}

export interface DoctorProfile extends BaseProfile {
    specialization: string;
    licenseNumber: string;
    experience: number;
    education: string[];
    certifications: string[];
    consultationFee: number;
    availableHours: {
        [key: string]: { start: string; end: string; };
    };
    bio: string;
    rating: number;
    totalConsultations: number;
}

export interface PharmacyProfile extends BaseProfile {
    pharmacyName: string;
    licenseNumber: string;
    operatingHours: {
        [key: string]: { start: string; end: string; };
    };
    services: string[];
    deliveryAvailable: boolean;
    deliveryRadius: number;
}

export interface AdminProfile extends BaseProfile {
    department: string;
    role: string;
    permissions: string[];
}

export type UserProfile = PatientProfile | DoctorProfile | PharmacyProfile | AdminProfile;
