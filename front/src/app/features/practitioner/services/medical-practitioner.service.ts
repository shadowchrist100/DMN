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
}
