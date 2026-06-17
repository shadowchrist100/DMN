import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Practitioner, Organization } from '../dashboard/dashboard.model';
import { MedicalPractitionerService } from './medical-practitioner.service';

@Injectable({ providedIn: 'root' })
export class PractitionerService {
  private medicalPrac = inject(MedicalPractitionerService);
  private activeOrganizationId = signal<string | null>(null);

  getCurrentPractitioner(userId?: string): Promise<Practitioner> {
    if (!userId) return Promise.resolve(MOCK_PRACTITIONER);
    return firstValueFrom(this.medicalPrac.getPractitionerProfile(userId)).then(dto => ({
      id: dto.id,
      firstName: '',
      lastName: '',
      name: `Praticien ${dto.speciality}`,
      specialty: dto.speciality,
      rpps: dto.order_number || '',
      avatar: '',
      primaryFacility: dto.organizations[0]?.nom || '',
      email: '',
      phone: '',
    }));
  }

  getPractitionerOrganizations(userId?: string): Promise<Organization[]> {
    if (!userId) return Promise.resolve(MOCK_ORGANIZATIONS);
    return firstValueFrom(this.medicalPrac.getPractitionerProfile(userId)).then(dto =>
      dto.organizations.map(org => ({
        id: org.id,
        name: org.nom,
        type: org.type as Organization['type'],
        role: org.role,
        since: new Date(),
        isPrimary: org.is_actif,
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

const MOCK_PRACTITIONER: Practitioner = {
  id: 'PRAC-001',
  firstName: 'Sarah',
  lastName: 'AGOSSA',
  name: 'Dr. Sarah AGOSSA',
  specialty: 'Médecine Générale',
  rpps: '1000456789',
  avatar: '',
  primaryFacility: 'Hôpital de Zone Calavi',
  email: 'sarah.agossa@sante.bj',
  phone: '+229 97 00 00 01',
};

const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'ORG-001', name: 'Hôpital de Zone Calavi', type: 'hospital',
    role: 'Médecin généraliste', since: new Date('2020-01-15'), isPrimary: true,
    address: 'Calavi, Atlantique', phone: '+229 21 30 00 01',
  },
  {
    id: 'ORG-002', name: 'Cabinet Médical Les Cocotiers', type: 'clinic',
    role: 'Consultante', since: new Date('2022-06-01'), isPrimary: false,
    address: 'Cotonou, Littoral', phone: '+229 21 30 00 02',
  },
];
