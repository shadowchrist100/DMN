import { Injectable } from '@angular/core';
import { Iuser } from '../models/user.model';
import { userRole } from '../types/user.types';

export interface LoginResponse {
  user: Iuser;
  token: string;
  requiresMfa: boolean;
}

export interface RegisterPayload {
  userType: userRole;
  identity: Iuser['identity'];
  contact?: Iuser['contact'];
  practitioner?: Iuser['practitioner'];
  auth: Iuser['auth'];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  async login(email: string, password: string, userType: string): Promise<LoginResponse> {
    await this.delay(800);
    if (!email || !password) {
      throw new Error('Identifiants invalides');
    }
    return {
      user: {
        identity: {
          lastName: 'AGOSSA',
          firstName: 'Sarah',
          birthDate: new Date('1985-06-15'),
          gender: 'female',
          npi: 1000456789,
          maritalStatus: 'married',
          multipleBirth: null,
          phone: '+229 97 00 00 01',
          city: 'Cotonou',
          address: '123 Rue des Médecins',
          photoPath: '',
        },
        practitioner: userType === 'PRACTITIONER' ? {
          orderNumber: 12345,
          speciality: 'Médecine Générale',
          organizations: [{
            organizationId: 'ORG-001',
            organizationName: 'Hôpital de Zone Calavi',
            role: 'Médecin généraliste',
          }],
        } : null,
        contact: null,
        auth: { email, password },
        role: userType as userRole,
      },
      token: 'mock-jwt-token-' + Date.now(),
      requiresMfa: userType === 'PRACTITIONER',
    };
  }

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    await this.delay(1000);
    return {
      user: {
        identity: payload.identity,
        practitioner: payload.practitioner ?? null,
        contact: payload.contact ?? null,
        auth: payload.auth,
        role: payload.userType,
      },
      token: 'mock-jwt-token-' + Date.now(),
      requiresMfa: false,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    await this.delay(600);
    return { message: 'Un code OTP a été envoyé à votre adresse email.' };
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    await this.delay(600);
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async verifyMfa(code: string): Promise<{ token: string }> {
    await this.delay(500);
    if (code.length !== 6) {
      throw new Error('Code invalide');
    }
    return { token: 'mock-mfa-token-' + Date.now() };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
