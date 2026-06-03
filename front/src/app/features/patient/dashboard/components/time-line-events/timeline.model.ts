export type EventType = 'consultation' | 'prescription' | 'lab_result' | 'vaccination' | 'hospitalization' | 'alert';
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';
export type EventStatus = 'completed' | 'pending' | 'cancelled' | 'archived';
export type BadgeType = 'completed' | 'alert' | 'urgent' | 'archived';

export interface VitalSign {
    label: string;
    value: string | number;
    unit: string;
    isAbnormal?: boolean;
}

export interface Medication {
    name: string;
    posology: string;
}

export interface LabResult {
    name: string;
    value: number;
    unit: string;
    isAbnormal: boolean;
}

export interface Practitioner {
    name: string;
    role: string;
    avatar?: string;
}

export interface TimelineEvent {
    id: string;
    type: EventType;
    title: string;
    description?: string;
    notes?: string;
    date: Date | string;
    facility: string;
    priority: EventPriority;
    status: EventStatus;
    icon: string;
    consentRequired: boolean;

    // Données optionnelles selon le type
    vitals?: VitalSign[];
    medications?: Medication[];
    labResults?: LabResult[];
    practitioner: Practitioner;

    // UI
    badge?: { text: string; type: BadgeType };
    actionLabel?: string;
    actionType?: 'view' | 'edit' | 'download' | 'share';
}