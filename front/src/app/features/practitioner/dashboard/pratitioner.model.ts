export interface PractitionerStats {
    patientsToday: number;
    pendingReports: number;
    criticalAlerts: number;
    completedVisits: number;
}

export interface QueuedPatient {
    id: string;
    npi: string;
    name: string;
    arrivalTime: string;
    reason: string;
    status: 'En attente' | 'En consultation' | 'Urgence';
    priority: 'low' | 'medium' | 'high';
}

