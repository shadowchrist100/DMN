export type EventType =
    | 'consultation'
    | 'prescription'
    | 'lab_result'
    | 'vaccination'
    | 'hospitalization'
    | 'imaging'
    | 'procedure'
    | 'alert'
    | 'consent_update';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

export type EventStatus = 'completed' | 'pending' | 'cancelled' | 'archived';

export type BadgeType = 'completed' | 'alert' | 'urgent' | 'archived' | 'pending';


export interface VitalSign {
    label: string;
    value: string;
    unit: string;
    normalRange?: { min: number; max: number };
    isAbnormal?: boolean;
}

export interface Medication {
    name: string;
    dosage: string;
    posology: string;
    duration?: string;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'completed' | 'stopped';
}

export interface LabResult {
    name: string;
    value: number;
    unit: string;
    normalMin: number;
    normalMax: number;
    isAbnormal: boolean;
    reference?: string;
}

export interface TimelineEvent {
    id: string;
    type: EventType;
    title: string;
    description?: string;
    date: Date;
    facility: string;
    practitioner: {
        name: string;
        role: string;
        avatar?: string;
    };
    priority: EventPriority;
    status: EventStatus;

    // Données spécifiques selon le type
    vitals?: VitalSign[];
    medications?: Medication[];
    labResults?: LabResult[];
    diagnosis?: string;
    notes?: string;
    attachments?: Array<{ name: string; url: string; type: string }>;

    // Métadonnées
    createdAt: Date;
    updatedAt?: Date;
    isEditable: boolean;
    consentRequired: boolean;

    // UI
    icon: string;
    badge?: { text: string; type: BadgeType };
    actionLabel?: string;
    actionType?: 'view' | 'edit' | 'download' | 'share';
}



export interface TimelineFilter {
    dateRange: 'all' | 'month' | '6months' | 'year' | 'custom';
    customStartDate?: Date;
    customEndDate?: Date;
    eventTypes: EventType[];
    priorities: EventPriority[];
    facilities: string[];
    searchTerm?: string;
    showOnlyAlerts?: boolean;
    eventType: EventType | null
}