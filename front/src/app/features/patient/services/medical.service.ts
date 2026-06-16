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
}
