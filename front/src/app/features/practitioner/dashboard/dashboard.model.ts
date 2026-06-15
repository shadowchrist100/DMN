// dashboard.model.ts

export interface Practitioner {
    id: string;
    firstName: string;
    lastName: string;
    name: string; // Computed: firstName + lastName
    specialty: string;
    rpps: string;
    avatar: string;
    primaryFacility: string;
    email: string;
    phone?: string;
}

export interface PractitionerStats {
    followedPatients: number;
    newPatientsThisMonth: number;
    consultationsThisWeek: number;
    completedVisits: number;
    upcomingVisits: number;
    pendingReports: number;
}

export type PatientFilter = 'all' | 'recent' | 'critical' | 'follow_up';

export interface FollowedPatient {
    npi: string;
    name: string;
    initials: string; // Computed from name
    age: number;
    gender: 'M' | 'F';
    lastVisit: Date;
    primaryDiagnosis?: string;
    isCritical: boolean;
    followUpFrequency?: 'weekly' | 'monthly' | 'quarterly';
    createdAt: Date;
}

export interface AccessRequest {
    id: string;
    patientNpi: string;
    patientName: string;
    reason: string;
    requestedAt: Date;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    requestedBy: {
        name: string;
        role: string;
        facility: string;
    };
    expiresAt: Date;
}

export type OrganizationType = 'hospital' | 'clinic' | 'laboratory' | 'pharmacy';

export interface Organization {
    id: string;
    name: string;
    type: OrganizationType;
    role: string; // Ex: "Médecin salarié", "Consultant", "Vacataire"
    since: Date;
    isPrimary: boolean;
    address?: string;
    phone?: string;
}

export type ActivityType = 
    | 'consultation' 
    | 'prescription' 
    | 'lab_result' 
    | 'consent' 
    | 'hospitalization' 
    | 'imaging';

export interface ActivityLog {
    id: string;
    type: ActivityType;
    action: string; // Ex: "Consultation réalisée", "Ordonnance signée"
    patientName?: string;
    patientNpi?: string;
    facility: string;
    timestamp: Date;
    badge?: {
        text: string;
        type: 'success' | 'warning' | 'info' | 'critical';
    };
}