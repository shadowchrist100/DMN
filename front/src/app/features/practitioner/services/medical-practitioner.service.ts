import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../../../core/config/api.config';

export interface PractitionerProfileDTO {
    id: string;
    user_id: string;
    speciality: string;
    order_number: string | null;
    organization_id: string | null;
    organizations: OrganisationDTO[];
}

export interface OrganisationDTO {
    id: string;
    nom: string;
    type: string;
    role: string;
    is_actif: boolean;
}

export interface PatientSummaryDTO {
    id: string;
    user_id: string;
    blood_type: string | null;
    last_consultation: string | null;
}

export interface DiseaseDTO {
    id: string;
    code_cim: string | null;
    libelle: string | null;
    statut_verification: string;
    date: string;
    note_clinique: string | null;
}

export interface ConsultationDTO {
    id: string;
    duree_minutes: number | null;
    raisons: string | null;
    rapport_text: string | null;
    observations_text: string | null;
    practitioner_name: string | null;
    practitioner_speciality: string | null;
    healthcare_nom: string | null;
}

export interface VaccinationDTO {
    id: string;
    injection_site: string | null;
    sequence_dose: number | null;
    batch_number: string | null;
    next_reminder: string | null;
    note: string | null;
    raisons: string | null;
    rapport_text: string | null;
}

export interface PractitionerDashboardStatsDTO {
    followed_patients: number;
    new_patients_this_month: number;
    consultations_this_week: number;
    completed_visits: number;
    upcoming_visits: number;
    pending_reports: number;
}

export interface AccessRequestDTO {
    id: string;
    patient_npi: string;
    patient_name: string;
    reason: string;
    requested_at: string;
    urgency: string;
    requested_by_name: string;
    requested_by_role: string;
    requested_by_facility: string;
    expires_at: string;
}

export interface PractitionerActivityDTO {
    id: string;
    type: string;
    action: string;
    patient_name: string | null;
    patient_npi: string | null;
    facility: string;
    timestamp: string;
    badge_text: string | null;
    badge_type: string | null;
}

export interface PatientListDTO {
    npi: string;
    name: string;
    initials: string;
    age: number;
    gender: string;
    last_contact: string | null;
    priority: string;
    is_critical: boolean;
    primary_diagnosis_code: string | null;
    primary_diagnosis_label: string | null;
    next_appointment_date: string | null;
    next_appointment_time: string | null;
    active_prescriptions: number;
}

export interface PatientSearchResultDTO {
    user_id: string;
    npi: string;
    full_name: string | null;
    age: number | null;
    gender: string | null;
    phone: string | null;
    city: string | null;
}

export interface CreateAccessRequestDTO {
    patient_user_id: string;
    reason: string;
    duration: string;
    perimeter: string;
}

@Injectable({ providedIn: 'root' })
export class MedicalPractitionerService {

    private pracBase = `${API.MEDICAL_BASE_URL}/practitioners/by-user`;
    private patBase = `${API.MEDICAL_BASE_URL}/patients/by-user`;

    constructor(private http: HttpClient) { }

    getPractitionerProfile(userId: string): Observable<PractitionerProfileDTO> {
        return this.http.get<PractitionerProfileDTO>(`${this.pracBase}/${userId}`);
    }

    getPractitionerPatients(userId: string): Observable<PatientSummaryDTO[]> {
        return this.http.get<PatientSummaryDTO[]>(`${this.pracBase}/${userId}/patients`);
    }

    getPatientPathologies(userId: string): Observable<DiseaseDTO[]> {
        return this.http.get<DiseaseDTO[]>(`${this.patBase}/${userId}/pathologies`);
    }

    getPatientConsultations(userId: string): Observable<ConsultationDTO[]> {
        return this.http.get<ConsultationDTO[]>(`${this.patBase}/${userId}/consultations`);
    }

    getPatientVaccinations(userId: string): Observable<VaccinationDTO[]> {
        return this.http.get<VaccinationDTO[]>(`${this.patBase}/${userId}/vaccinations`);
    }

    getPractitionerDashboardStats(userId: string): Observable<PractitionerDashboardStatsDTO> {
        return this.http.get<PractitionerDashboardStatsDTO>(`${this.pracBase}/${userId}/dashboard/stats`);
    }

    getPractitionerAccessRequests(userId: string): Observable<AccessRequestDTO[]> {
        return this.http.get<AccessRequestDTO[]>(`${this.pracBase}/${userId}/access-requests`);
    }

    acceptAccessRequest(userId: string, requestId: string): Observable<{ status: string }> {
        return this.http.put<{ status: string }>(`${this.pracBase}/${userId}/access-requests/${requestId}/accept`, {});
    }

    declineAccessRequest(userId: string, requestId: string): Observable<{ status: string }> {
        return this.http.put<{ status: string }>(`${this.pracBase}/${userId}/access-requests/${requestId}/decline`, {});
    }

    getPractitionerActivities(userId: string, limit: number = 10): Observable<PractitionerActivityDTO[]> {
        return this.http.get<PractitionerActivityDTO[]>(`${this.pracBase}/${userId}/activities?limit=${limit}`);
    }

    getPractitionerPatientsList(userId: string): Observable<PatientListDTO[]> {
        return this.http.get<PatientListDTO[]>(`${this.pracBase}/${userId}/patients/list`);
    }

    searchPatients(query: string): Observable<PatientSearchResultDTO[]> {
        return this.http.get<PatientSearchResultDTO[]>(`${API.MEDICAL_BASE_URL}/practitioners/patients/search?q=${encodeURIComponent(query)}`);
    }

    createAccessRequest(userId: string, data: CreateAccessRequestDTO): Observable<{ id: string; status: string }> {
        return this.http.post<{ id: string; status: string }>(`${this.pracBase}/${userId}/access-requests`, data);
    }
}
