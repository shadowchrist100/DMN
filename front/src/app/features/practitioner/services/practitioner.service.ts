import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Practitioner, Organization } from '../dashboard/dashboard.model';
import { MedicalPractitionerService } from './medical-practitioner.service';

@Injectable({ providedIn: 'root' })
export class PractitionerService {
  private medicalPrac = inject(MedicalPractitionerService);
  private activeOrganizationId = signal<string | null>(null);

  getCurrentPractitioner(userId: string): Promise<Practitioner> {
    return firstValueFrom(this.medicalPrac.getPractitionerProfile(userId)).then(dto => ({
      id: dto.id,
      firstName: dto.speciality,
      lastName: '',
      name: `Dr. ${dto.speciality.charAt(0).toUpperCase() + dto.speciality.slice(1)}`,
      specialty: dto.speciality,
      rpps: dto.order_number || '',
      avatar: '',
      primaryFacility: dto.organizations[0]?.nom || '',
      email: '',
      phone: '',
    }));
  }

  getPractitionerOrganizations(userId: string): Promise<Organization[]> {
    return firstValueFrom(this.medicalPrac.getPractitionerProfile(userId)).then(dto =>
      dto.organizations.map(org => ({
        id: org.id,
        name: org.nom,
        type: org.type as Organization['type'],
        role: org.role,
        since: new Date(org.start_date) || new Date(),
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
