import { Injectable } from '@angular/core';
import { AvailableOrganization } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class OrganisationService {
  getAvailableOrganizations(): Promise<AvailableOrganization[]> {
    return Promise.resolve([
      { id: 'ORG-001', name: 'CNHU-HKM Cotonou', type: 'chu', city: 'Cotonou', department: 'Littoral' },
      { id: 'ORG-002', name: 'Hôpital de Zone Calavi', type: 'zone', city: 'Abomey-Calavi', department: 'Atlantique' },
      { id: 'ORG-003', name: 'Hôpital de Zone Ouidah', type: 'zone', city: 'Ouidah', department: 'Atlantique' },
      { id: 'ORG-004', name: 'Hôpital Départemental Porto-Novo', type: 'departmental', city: 'Porto-Novo', department: 'Ouémé' },
      { id: 'ORG-005', name: 'CHU Parakou', type: 'chu', city: 'Parakou', department: 'Borgou' },
      { id: 'ORG-006', name: 'Clinique Sainte Marie', type: 'clinic', city: 'Cotonou', department: 'Littoral' },
      { id: 'ORG-007', name: 'Cabinet Médical Les Cocotiers', type: 'cabinet', city: 'Cotonou', department: 'Littoral' },
      { id: 'ORG-008', name: 'Centre de Santé Communautaire Akpakpa', type: 'cscom', city: 'Cotonou', department: 'Littoral' },
      { id: 'ORG-009', name: 'Laboratoire National de Santé Publique', type: 'lab', city: 'Cotonou', department: 'Littoral' },
      { id: 'ORG-010', name: 'Centre d\'Imagerie Médicale Calavi', type: 'imaging', city: 'Abomey-Calavi', department: 'Atlantique' },
      { id: 'ORG-011', name: 'Hôpital Pulmonaire de Cotonou', type: 'departmental', city: 'Cotonou', department: 'Littoral' },
      { id: 'ORG-012', name: 'Dispensaire de Djougou', type: 'dispensary', city: 'Djougou', department: 'Donga' },
      { id: 'ORG-013', name: 'Pharmacie Populaire du Bénin', type: 'pharmacy', city: 'Cotonou', department: 'Littoral' },
      { id: 'ORG-014', name: 'ONG Santé pour Tous', type: 'ngo', city: 'Parakou', department: 'Borgou' },
      { id: 'ORG-015', name: 'Organisation Mondiale de la Santé — Bureau Bénin', type: 'international', city: 'Cotonou', department: 'Littoral' },
    ]);
  }
}
