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
    start_date?: string;
    end_date?: string;
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

export interface ConsentDTO {
    id: string;
    patient_npi: string;
    patient_name: string;
    perimeter: string;
    duration: string;
    status: 'active' | 'pending' | 'expired';
    granted_at: string | null;
    expires_at: string | null;
    is_urgence: boolean;
    reason: string;
}

export interface CreateAccessRequestDTO {
    patient_user_id: string;
    reason: string;
    duration: string;
    perimeter: string;
}

// ── Nouvel acte médical ──────────────────────────────────────────────────────

export interface VitalConstantRefDTO {
    code: string;
    nom: string;
    unite_mesure: string;
}

export interface DiagnosisRefDTO {
    id: string;
    code_cid11: string;
    libelle: string;
    type_ref: string;
}

export interface MedicationRefDTO {
    id: string;
    code_medicament: string;
    nom_commercial: string;
    dc_nom: string;
    forme_galenique: string;
}

export interface VitalConstantEntry {
    code: string;
    valeur: number;
}

export interface DiagnosisEntry {
    diagnosis_ref_id: string;
    note_clinique?: string;
    statut_verification: string;
}

export interface MedicationPrescriptionEntry {
    medication_ref_id: string;
    posologie: string;
    duree_jours: number;
    description_generale?: string;
}

export interface ExamenPrescriptionEntry {
    code_loinc?: string;
    libelle: string;
    nature_examination: string;
    special_instructions?: string;
}

export interface VaccinePrescriptionEntry {
    code_cvx?: string;
    libelle: string;
    special_instructions?: string;
}

export interface CareInstructionEntry {
    sous_type: string;
    nombre_seances?: number;
    frequence_hebdo?: string;
    objectifs?: string;
    titre_consigne?: string;
    recommandations?: string;
    description_generale?: string;
}

export interface CreateMedicalActDTO {
    type_acte: string;
    motif?: string;
    raisons?: string;
    observations_text?: string;
    duree_minutes?: number;
    vital_constants: VitalConstantEntry[];
    diagnoses: DiagnosisEntry[];
    medications: MedicationPrescriptionEntry[];
    examens: ExamenPrescriptionEntry[];
    vaccines: VaccinePrescriptionEntry[];
    care_instructions: CareInstructionEntry[];
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

    getPractitionerConsents(userId: string): Observable<ConsentDTO[]> {
        return this.http.get<ConsentDTO[]>(`${this.pracBase}/${userId}/consents`);
    }

    // ── Références ───────────────────────────────────────────────────────

    getVitalConstantRefs(): Observable<VitalConstantRefDTO[]> {
        return this.http.get<VitalConstantRefDTO[]>(`${API.MEDICAL_BASE_URL}/vital-constant-references`);
    }

    getDiagnosisRefs(q: string = ''): Observable<DiagnosisRefDTO[]> {
        return this.http.get<DiagnosisRefDTO[]>(`${API.MEDICAL_BASE_URL}/diagnosis-references?q=${encodeURIComponent(q)}`);
    }

    getMedicationRefs(q: string = ''): Observable<MedicationRefDTO[]> {
        return this.http.get<MedicationRefDTO[]>(`${API.MEDICAL_BASE_URL}/medication-references?q=${encodeURIComponent(q)}`);
    }

    // ── Création acte médical ────────────────────────────────────────────

    createMedicalAct(
        practitionerUserId: string,
        patientUserId: string,
        data: CreateMedicalActDTO,
    ): Observable<{ id: string; status: string }> {
        return this.http.post<{ id: string; status: string }>(
            `${this.pracBase}/${practitionerUserId}/patients/${patientUserId}/medical-acts`,
            data,
        );
    }
}
