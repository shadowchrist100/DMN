// patients.model.ts

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Diagnosis {
    code: string; // CIM-10
    label: string;
}

export interface Appointment {
    date: Date;
    time: string;
    type?: string;
    facility?: string;
}

export interface Patient {
    npi: string;
    name: string;
    initials: string;
    age: number;
    gender: 'M' | 'F';
    lastContact: Date;
    priority: Priority;
    isCritical: boolean;
    primaryDiagnosis?: Diagnosis;
    nextAppointment?: Appointment | null;
    activePrescriptions: number;
    allergies?: string[];
    chronicConditions?: string[];
}