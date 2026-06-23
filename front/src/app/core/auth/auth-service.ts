import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Iuser } from '../models/user.model';
import { Gender, MaritalStatus, userRole } from '../types/user.types';
import { API } from '../config/api.config';

export interface LoginResponse {
    user: Iuser;
    access_token: string;
    token_type: string;
    expires_in: number;
}

const SPECIALITY_MAP: Record<string, string> = {
    general: 'medecin',
    cardiology: 'medecin',
    pediatry: 'pediatre',
    gynecology: 'gynecologue',
    surgery: 'chirurgien',
    neurology: 'medecin',
    dermatology: 'medecin',
    ophthalmology: 'medecin',
    psychiatry: 'medecin',
    radiology: 'radiologue',
    anesthesia: 'medecin',
    oncology: 'medecin',
    nursing: 'infirmier',
    midwifery: 'medecin',
    pharmacy: 'pharmacien',
    biology: 'biologiste',
    kinesitherapy: 'autre',
    nutrition: 'autre',
    dentistry: 'dentiste',
    orthodontics: 'dentiste',
};

export function mapSpeciality(frontendValue: string): string {
    return SPECIALITY_MAP[frontendValue] || 'autre';
}

export interface RegisterPayload {
    role: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    gender: string;
    birth_date: string;
    matrimonial_status: string;
    phone: string;
    npi: string;
    city: string;
    address: string;
    photo?: File;
    photo_path?: string;
    documents?: {
        type_document: string;
        file: File;
    }[];
    emergencyContact?: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        code_relation: string;
        confirmed: boolean;
    };
    order_number?: string;
    speciality?: string;
    organization_id?: string;
    organizations?: { organization_id: string; role: string }[];
}

export interface ApiUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    npi: string;
    gender: string;
    phone: string;
    city: string;
    address: string;
    birth_date: string;
    matrimonial_status: string;
    photo_path: string | null;
    organization_id: string | null;
    status_account: string;
    email_verified_at: string | null;
}

interface ApiRegisterResponse {
    message: string;
    user: ApiUser;
    access_token: string;
    token_type: string;
    expires_in: number;
}

function normalizeRole(role: string | undefined): userRole {
    if (!role) return null;
    if (role === 'patient' || role === 'practitioner') return role.toUpperCase() as userRole;
    return role as userRole;
}

export interface UserDetailResponse {
    user: ApiUser;
    photo_url: string | null;
}

export function mapApiUserToIuser(apiUser: ApiUser): Iuser {
    return {
        identity: {
            lastName: apiUser.last_name ?? '',
            firstName: apiUser.first_name ?? '',
            birthDate: apiUser.birth_date
                ? (() => {
                    const dateStr = apiUser.birth_date.split('T')[0];
                    const [y, m, d] = dateStr.split('-').map(Number);
                    return new Date(y, m - 1, d);
                })()
                : new Date(),
            gender: (apiUser.gender as Gender) ?? 'male',
            npi: apiUser.npi ?? '',
            maritalStatus: (apiUser.matrimonial_status as MaritalStatus) ?? 'single',
            multipleBirth: null,
            phone: apiUser.phone ?? '',
            city: apiUser.city ?? '',
            address: apiUser.address ?? '',
            photoPath: apiUser.photo_path
                ? `${API.AUTH_BASE_URL}/photos/${encodeURIComponent(apiUser.photo_path.split('/').pop()!)}`
                : '',
        },
        practitioner: null,
        contact: null,
        auth: { email: apiUser.email ?? '', password: '' },
        role: normalizeRole(apiUser.role),
        statusAccount: apiUser.status_account ?? 'unverified',
    };
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);

    async login(email: string, password: string, userType: string): Promise<LoginResponse> {
        const result = await firstValueFrom(
            this.http.post<ApiRegisterResponse>(`${API.AUTH_BASE_URL}/login`, {
                email,
                password,
            })
        );

        return {
            user: mapApiUserToIuser(result.user),
            access_token: result.access_token,
            token_type: result.token_type,
            expires_in: result.expires_in,
        };
    }

    async register(payload: RegisterPayload): Promise<LoginResponse> {
        const formData = new FormData();
        const fields: (keyof RegisterPayload)[] = [
            'role', 'first_name', 'last_name', 'email', 'password',
            'gender', 'birth_date', 'matrimonial_status', 'phone', 'npi',
            'city', 'address',
        ];
        for (const key of fields) {
            const val = payload[key];
            if (val !== undefined && val !== null) {
                formData.append(key, String(val));
            }
        }

        if (payload.photo) {
            formData.append('photo', payload.photo);
        }

        if (payload.emergencyContact) {
            formData.append('emergencyContact[firstName]', payload.emergencyContact.firstName);
            formData.append('emergencyContact[lastName]', payload.emergencyContact.lastName);
            formData.append('emergencyContact[phone]', payload.emergencyContact.phone);
            formData.append('emergencyContact[email]', payload.emergencyContact.email);
            formData.append('emergencyContact[code_relation]', payload.emergencyContact.code_relation);
            formData.append('emergencyContact[confirmed]', '1');
        }

        if (payload.order_number) formData.append('order_number', payload.order_number);
        if (payload.speciality) formData.append('speciality', payload.speciality);
        if (payload.organization_id) formData.append('organization_id', payload.organization_id);

        if (payload.documents) {
            for (let i = 0; i < payload.documents.length; i++) {
                const doc = payload.documents[i];
                formData.append(`documents[${i}][type_document]`, doc.type_document);
                formData.append(`documents[${i}][file]`, doc.file);
            }
        }

        const result = await firstValueFrom(
            this.http.post<ApiRegisterResponse>(`${API.AUTH_BASE_URL}/register`, formData)
        );

        return {
            user: mapApiUserToIuser(result.user),
            access_token: result.access_token,
            token_type: result.token_type,
            expires_in: result.expires_in,
        };
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const result = await firstValueFrom(
            this.http.post<{ message: string }>(`${API.AUTH_BASE_URL}/forgot-password`, { email })
        );
        return result;
    }

    async resetPassword(token: string, password: string): Promise<{ message: string }> {
        await firstValueFrom(
            this.http.post(`${API.AUTH_BASE_URL}/reset-password`, { token, password })
        );
        return { message: 'Mot de passe réinitialisé avec succès.' };
    }

    async logout(): Promise<void> {
        await firstValueFrom(
            this.http.post(`${API.AUTH_BASE_URL}/logout`, {})
        );
    }

    async updateProfile(data: Partial<ApiUser> & { photo?: File }): Promise<ApiUser> {
        const formData = new FormData();
        const allowedFields: (keyof ApiUser)[] = [
            'first_name', 'last_name', 'gender', 'birth_date',
            'matrimonial_status', 'phone', 'city', 'address',
        ];
        for (const key of allowedFields) {
            const val = data[key];
            if (val !== undefined && val !== null) {
                formData.append(key, String(val));
            }
        }
        formData.append('_method', 'PUT');
        if (data.photo) {
            formData.append('photo', data.photo);
        }
        const result = await firstValueFrom(
            this.http.post<{ message: string; user: ApiUser }>(
                `${API.AUTH_BASE_URL}/me`,
                formData
            )
        );
        return result.user;
    }

    async getUser(userId: string): Promise<UserDetailResponse> {
        return firstValueFrom(
            this.http.get<UserDetailResponse>(`${API.AUTH_BASE_URL}/users/${userId}`)
        );
    }

    // ── Protocole d'urgence ────────────────────────────────────

    async initierUrgence(patientUserId: string): Promise<{
        session_id: string;
        expires_at: string;
        status: string;
        contacts_count: number;
    }> {
        return firstValueFrom(
            this.http.post<{
                session_id: string;
                expires_at: string;
                status: string;
                contacts_count: number;
            }>(`${API.AUTH_BASE_URL}/urgence/initier`, { patient_user_id: patientUserId })
        );
    }

    async getStatutUrgence(sessionId: string): Promise<{
        session_id: string;
        status: string;
        expires_at: string;
        remaining_seconds: number;
    }> {
        return firstValueFrom(
            this.http.get<{
                session_id: string;
                status: string;
                expires_at: string;
                remaining_seconds: number;
            }>(`${API.AUTH_BASE_URL}/urgence/statut/${sessionId}`)
        );
    }

    async forcerUrgence(sessionId: string): Promise<{
        status: string;
        message: string;
    }> {
        return firstValueFrom(
            this.http.post<{ status: string; message: string }>(
                `${API.AUTH_BASE_URL}/urgence/forcer`,
                { session_id: sessionId }
            )
        );
    }
}
