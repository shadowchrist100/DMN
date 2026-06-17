import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Iuser } from '../models/user.model';
import { userRole } from '../types/user.types';
import { API } from '../config/api.config';

export interface LoginResponse {
    user: Iuser;
    access_token: string;
    token_type: string;
    expires_in: number;
    requiresMfa: boolean;
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
    photo_path?: string;
    documents?: {
        type_document: string;
        file: File;
    }[];
    emergencyContact?: {
        firstName: string;
        lastName: string;
        phone: string;
        code_relation: string;
    };
    order_number?: string;
    speciality?: string;
    organization_id?: string;
    organizations?: { organization_id: string; role: string }[];
}

interface ApiRegisterResponse {
    message: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
    };
    access_token: string;
    token_type: string;
    expires_in: number;
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
            user: this.mapApiUserToIuser(result.user),
            access_token: result.access_token,
            token_type: result.token_type,
            expires_in: result.expires_in,
            requiresMfa: userType === 'PRACTITIONER',
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

        if (payload.emergencyContact) {
            formData.append('emergencyContact[firstName]', payload.emergencyContact.firstName);
            formData.append('emergencyContact[lastName]', payload.emergencyContact.lastName);
            formData.append('emergencyContact[phone]', payload.emergencyContact.phone);
            formData.append('emergencyContact[code_relation]', payload.emergencyContact.code_relation);
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
            user: this.mapApiUserToIuser(result.user),
            access_token: result.access_token,
            token_type: result.token_type,
            expires_in: result.expires_in,
            requiresMfa: false,
        };
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        return { message: 'Un code OTP a été envoyé à votre adresse email.' };
    }

    async resetPassword(token: string, password: string): Promise<{ message: string }> {
        await firstValueFrom(
            this.http.post(`${API.AUTH_BASE_URL}/reset-password`, { token, password })
        );
        return { message: 'Mot de passe réinitialisé avec succès.' };
    }

    async verifyMfa(code: string): Promise<{ token: string }> {
        if (code.length !== 6) throw new Error('Code invalide');
        return { token: 'mock-mfa-token-' + Date.now() };
    }

    private mapApiUserToIuser(apiUser: ApiRegisterResponse['user']): Iuser {
        return {
            identity: {
                lastName: apiUser.last_name ?? '',
                firstName: apiUser.first_name ?? '',
                birthDate: new Date(),
                gender: 'male',
                npi: 0,
                maritalStatus: 'single',
                multipleBirth: null,
                phone: '',
                city: '',
                address: '',
                photoPath: '',
            },
            practitioner: null,
            contact: null,
            auth: { email: apiUser.email ?? '', password: '' },
            role: (apiUser.role as userRole) ?? null,
        };
    }
}
