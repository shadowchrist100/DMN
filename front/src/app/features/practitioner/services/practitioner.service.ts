import { Injectable, signal } from '@angular/core';
import { Practitioner, Organization } from '../dashboard/dashboard.model';

@Injectable({ providedIn: 'root' })
export class PractitionerService {
  private activeOrganizationId = signal<string | null>(null);

  getCurrentPractitioner(): Promise<Practitioner> {
    return Promise.resolve({
      id: 'PRAC-001',
      firstName: 'Sarah',
      lastName: 'AGOSSA',
      name: 'Dr. Sarah AGOSSA',
      specialty: 'Médecine Générale',
      rpps: '1000456789',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_wbjSaptTJKnjj2Bd47-SBu-2ObqC9jJf6SDutNa5WlR3u3TwTyY62noEzF4i7NoYP-MKAm88NdtyTSQ24xrCtWA_U9EsUWKEw5uHO3f1uSHpRXVGmBry10LOpsuuGqAFl4uFYqD0KUsonVl0e0yzQB4UIwyXHlPG3VIS8NGTyEo5iNlm1ZatJUQg1Q_08apL2idCqnhfHSZV2b4DlUeycHFXbwCxa-oV6xbDQ_st83VFk1OBr-c-aQPzLHmpNRgfW18TRlF1Qaq_',
      primaryFacility: 'Hôpital de Zone Calavi',
      email: 'sarah.agossa@sante.bj',
      phone: '+229 97 00 00 01',
    });
  }

  getPractitionerOrganizations(): Promise<Organization[]> {
    return Promise.resolve([
      {
        id: 'ORG-001',
        name: 'Hôpital de Zone Calavi',
        type: 'hospital',
        role: 'Médecin généraliste',
        since: new Date('2020-01-15'),
        isPrimary: true,
        address: 'Calavi, Atlantique',
        phone: '+229 21 30 00 01',
      },
      {
        id: 'ORG-002',
        name: 'Cabinet Médical Les Cocotiers',
        type: 'clinic',
        role: 'Consultante',
        since: new Date('2022-06-01'),
        isPrimary: false,
        address: 'Cotonou, Littoral',
        phone: '+229 21 30 00 02',
      },
    ]);
  }

  setActiveOrganization(orgId: string): void {
    this.activeOrganizationId.set(orgId);
  }

  getActiveOrganizationId(): string | null {
    return this.activeOrganizationId();
  }
}
