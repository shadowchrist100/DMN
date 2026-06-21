import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Practitioner, Organization } from '../dashboard/dashboard.model';
import { MedicalPractitionerService } from './medical-practitioner.service';
import { AuthService } from '../../../core/auth/auth-service';
import { API } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class PractitionerService {
  private medicalPrac = inject(MedicalPractitionerService);
  private authService = inject(AuthService);
  private activeOrganizationId = signal<string | null>(null);

  async getCurrentPractitioner(userId: string): Promise<Practitioner> {
    const dto = await firstValueFrom(this.medicalPrac.getPractitionerProfile(userId));
    let avatar = '';
    let email = '';
    try {
      const userResp = await this.authService.getUser(userId);
      email = userResp.user.email ?? '';
      avatar = userResp.photo_url ?? '';
    } catch {
      // auth info non disponible
    }
    return {
      id: dto.id,
      firstName: dto.first_name || dto.speciality,
      lastName: dto.last_name || '',
      name: `Dr. ${dto.first_name || ''} ${dto.last_name || dto.speciality}`.trim(),
      specialty: dto.speciality,
      rpps: dto.order_number || '',
      avatar,
      primaryFacility: dto.organizations[0]?.nom || '',
      email,
      phone: '',
    };
  }

  getPractitionerOrganizations(userId: string): Promise<Organization[]> {
    return firstValueFrom(this.medicalPrac.getPractitionerProfile(userId)).then(dto =>
      dto.organizations.map(org => ({
        id: org.id,
        name: org.nom,
        type: org.type as Organization['type'],
        role: org.role,
        since: org.start_date ? new Date(org.start_date) : new Date(),
        isPrimary: org.is_actif,
        address: '',
        phone: '',
      }))
    );
  }

  setActiveOrganization(orgId: string): void {
    this.activeOrganizationId.set(orgId);
  }

  getActiveOrganizationId(): string | null {
    return this.activeOrganizationId();
  }
}
