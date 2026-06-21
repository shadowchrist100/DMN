import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API } from '../../../core/config/api.config';

export interface PatientProfile {
    id: string;
    user_id: string;
    blood_type: string | null;
    rhesus_factor: string | null;
    date_creation: string | null;
    taille: number | null;
    poids: number | null;
}

export interface AllergyDTO {
    id: string;
    substance: string;
    categorie: string;
    criticite: string;
    statut_clinique: string;
    statut_verification: string;
    reactions: string[];
    date_declaration: string;
    notes: string | null;
}

export interface ExamenDTO {
    uuid: string;
    libelle_examen: string;
    type_examen: string;
    code_loinc: string;
    valeur: string;
    interpretation: string;
    image_path: string | null;
    date_realisation: string | null;
    raisons: string | null;
    rapport_text: string | null;
    observations_text: string | null;
}

export interface PrescriptionDTO {
    uuid: string;
    type_prescription: string;
    libelle: string;
    statut: string;
    date_prescription: string;
    special_instructions: string;
    prescripteur_nom: string | null;
    prescripteur_specialite: string | null;
    code_loinc: string | null;
    nature_examination: string | null;
    code_cvx: string | null;
}

export interface AuthorizationDTO {
    id: string;
    perimeter: string;
    granted_at: string;
    expire_at: string;
    duration: string;
    is_actif: boolean;
    is_urgence: boolean;
    authorization_type: string;
    practitioner_name: string | null;
    practitioner_speciality: string | null;
}

export interface RelativeDTO {
    relative: {
        id: string;
        first_name: string;
        last_name: string;
        phone: string;
    };
    code_relation: string;
}

export interface RelativeCreateReq {
    first_name: string;
    last_name: string;
    phone: string;
    code_relation: string;
}

export interface RelativeUpdateReq {
    first_name?: string;
    last_name?: string;
    phone?: string;
    code_relation?: string;
    email?: string;
    emergency_contact?: boolean;
}

export interface DashboardStatsDTO {
    examens_count: number;
    prescriptions_count: number;
    allergies_count: number;
    consentements_count: number;
    pathologies_count: number;
    consultations_count: number;
    vaccinations_count: number;
}

export interface AlertDTO {
    id: string;
    type: string;
    message: string;
    date: string;
    auteur: string | null;
}

export interface AccessLogDTO {
    id: string;
    qui: string;
    role: string;
    date: string;
    icon: string;
}

export interface DashboardSummaryDTO {
    profile: PatientProfile;
    stats: DashboardStatsDTO;
    alerts: AlertDTO[];
    access_logs: AccessLogDTO[];
}

export interface TimelineEventDTO {
    id: string;
    type: string;
    title: string;
    description: string | null;
    date: string;
    facility: string | null;
    practitioner_name: string | null;
    practitioner_role: string | null;
    priority: string;
    status: string;
    diagnosis: string | null;
    notes: string | null;
    icon: string;
    badge_text: string | null;
    badge_type: string | null;
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
    motif: string | null;
    raisons: string | null;
    rapport_text: string | null;
    observations_text: string | null;
    practitioner_name: string | null;
    practitioner_speciality: string | null;
    healthcare_nom: string | null;
}

export interface PatientProfileUpdateReq {
    blood_type?: string;
    rhesus_factor?: string;
}

export interface PendingAccessRequestDTO {
    id: string;
    practitioner_user_id: string;
    practitioner_name: string;
    practitioner_speciality: string;
    reason: string;
    requested_at: string;
    perimeter: string;
    duration: string;
}

export interface RespondAccessRequestReq {
    action: 'accept' | 'decline';
    perimeter?: string;
    duration?: string;
}

@Injectable({ providedIn: 'root' })
export class MedicalService {

    private baseUrl = `${API.MEDICAL_BASE_URL}/patients/by-user`;

    constructor(private http: HttpClient) { }

    getProfile(userId: string): Observable<PatientProfile> {
        return this.http.get<PatientProfile>(`${this.baseUrl}/${userId}`);
    }

    getAllergies(userId: string): Observable<AllergyDTO[]> {
        return this.http.get<AllergyDTO[]>(`${this.baseUrl}/${userId}/allergies`);
    }

    getExamens(userId: string): Observable<ExamenDTO[]> {
        return this.http.get<ExamenDTO[]>(`${this.baseUrl}/${userId}/examens`);
    }

    getPrescriptions(userId: string): Observable<PrescriptionDTO[]> {
        return this.http.get<PrescriptionDTO[]>(`${this.baseUrl}/${userId}/prescriptions`);
    }

    getAuthorizations(userId: string): Observable<AuthorizationDTO[]> {
        return this.http.get<AuthorizationDTO[]>(`${this.baseUrl}/${userId}/authorizations`);
    }

    getPathologies(userId: string): Observable<DiseaseDTO[]> {
        return this.http.get<DiseaseDTO[]>(`${this.baseUrl}/${userId}/pathologies`);
    }

    getConsultations(userId: string): Observable<ConsultationDTO[]> {
        return this.http.get<ConsultationDTO[]>(`${this.baseUrl}/${userId}/consultations`);
    }

    getVaccinations(userId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/${userId}/vaccinations`);
    }

    // ── Relatives / Contacts ─────────────────────────────────────────────

    getRelatives(userId: string): Observable<RelativeDTO[]> {
        return this.http.get<RelativeDTO[]>(`${this.baseUrl}/${userId}/relatives`);
    }

    createRelative(userId: string, data: RelativeCreateReq): Observable<RelativeDTO> {
        return this.http.post<RelativeDTO>(`${this.baseUrl}/${userId}/relatives`, data);
    }

    updateRelative(userId: string, relativeId: string, data: RelativeUpdateReq): Observable<RelativeDTO> {
        return this.http.put<RelativeDTO>(`${this.baseUrl}/${userId}/relatives/${relativeId}`, data);
    }

    deleteRelative(userId: string, relativeId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${userId}/relatives/${relativeId}`);
    }

    // ── Dashboard ────────────────────────────────────────────────────────

    getDashboardSummary(userId: string): Observable<DashboardSummaryDTO> {
        return this.http.get<DashboardSummaryDTO>(`${this.baseUrl}/${userId}/dashboard/summary`);
    }

    getDashboardStats(userId: string): Observable<DashboardStatsDTO> {
        return this.http.get<DashboardStatsDTO>(`${this.baseUrl}/${userId}/dashboard/stats`);
    }

    getDashboardAlerts(userId: string): Observable<AlertDTO[]> {
        return this.http.get<AlertDTO[]>(`${this.baseUrl}/${userId}/dashboard/alerts`);
    }

    getDashboardAccessLog(userId: string): Observable<AccessLogDTO[]> {
        return this.http.get<AccessLogDTO[]>(`${this.baseUrl}/${userId}/dashboard/access-log`);
    }

    getDashboardTimeline(userId: string): Observable<TimelineEventDTO[]> {
        return this.http.get<TimelineEventDTO[]>(`${this.baseUrl}/${userId}/dashboard/timeline`);
    }

    // ── Profile Update ───────────────────────────────────────────────────

    updatePatientProfile(userId: string, data: PatientProfileUpdateReq): Observable<PatientProfile> {
        return this.http.put<PatientProfile>(`${this.baseUrl}/${userId}/profile`, data);
    }

    // ── Access Requests ──────────────────────────────────────────────────

    getPendingAccessRequests(userId: string): Observable<PendingAccessRequestDTO[]> {
        return this.http.get<PendingAccessRequestDTO[]>(`${this.baseUrl}/${userId}/access-requests/pending`);
    }

    respondToAccessRequest(userId: string, requestId: string, data: RespondAccessRequestReq): Observable<{ status: string }> {
        return this.http.put<{ status: string }>(`${this.baseUrl}/${userId}/access-requests/${requestId}/respond`, data);
    }

    revokeAuthorization(userId: string, authorizationId: string): Observable<{ status: string }> {
        return this.http.delete<{ status: string }>(`${this.baseUrl}/${userId}/authorizations/${authorizationId}`);
    }
}
