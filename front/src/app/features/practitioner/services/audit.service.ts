import { Injectable } from '@angular/core';
import { ActivityLog, ActivityType } from '../dashboard/dashboard.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private mockActivities: ActivityLog[] = [
    {
      id: 'ACT-001',
      type: 'consultation',
      action: 'Consultation réalisée',
      patientName: 'Kouassi Adebayo',
      patientNpi: '1029384756',
      facility: 'Hôpital de Zone Calavi',
      timestamp: new Date('2024-05-12T14:30:00'),
      badge: { text: 'Finalisé', type: 'success' },
    },
    {
      id: 'ACT-002',
      type: 'lab_result',
      action: 'Résultat d\'analyse disponible',
      patientName: 'Moussa Ballo',
      patientNpi: '9283746152',
      facility: 'Laboratoire National de Santé Publique',
      timestamp: new Date('2024-05-12T10:15:00'),
      badge: { text: 'Nouveau', type: 'info' },
    },
    {
      id: 'ACT-003',
      type: 'prescription',
      action: 'Renouvellement ordonnance signé',
      patientName: 'Jean-Pierre Dossou',
      patientNpi: '5566778899',
      facility: 'Hôpital de Zone Calavi',
      timestamp: new Date('2024-05-11T16:00:00'),
      badge: { text: 'Signé', type: 'success' },
    },
    {
      id: 'ACT-004',
      type: 'consent',
      action: 'Demande d\'accès acceptée',
      patientName: 'Pauline Kodjo',
      patientNpi: '7733992211',
      facility: 'Cabinet Médical Les Cocotiers',
      timestamp: new Date('2024-05-11T09:45:00'),
      badge: { text: 'Approuvé', type: 'success' },
    },
    {
      id: 'ACT-005',
      type: 'hospitalization',
      action: 'Compte rendu d\'hospitalisation déposé',
      patientName: 'Ibrahim Adamou',
      patientNpi: '9988776655',
      facility: 'CNHU-HKM Cotonou',
      timestamp: new Date('2024-05-10T08:00:00'),
      badge: { text: 'Urgent', type: 'warning' },
    },
    {
      id: 'ACT-006',
      type: 'imaging',
      action: 'Compte rendu d\'imagerie disponible',
      patientName: 'Kouassi Adebayo',
      patientNpi: '1029384756',
      facility: 'Centre d\'Imagerie Médicale Calavi',
      timestamp: new Date('2024-05-09T15:30:00'),
      badge: { text: 'Validé', type: 'success' },
    },
    {
      id: 'ACT-007',
      type: 'consultation',
      action: 'Consultation reprogrammée',
      patientName: 'Aminata Sow',
      patientNpi: '1122334455',
      facility: 'Hôpital de Zone Calavi',
      timestamp: new Date('2024-05-09T11:00:00'),
      badge: { text: 'Modifié', type: 'warning' },
    },
  ];

  getRecentActivities(limit: number): Promise<ActivityLog[]> {
    return Promise.resolve(this.mockActivities.slice(0, limit));
  }

  logAction(action: string, _metadata?: Record<string, unknown>): Promise<void> {
    const type = this.inferType(action);
    this.mockActivities.unshift({
      id: `ACT-${Date.now()}`,
      type,
      action,
      facility: 'Hôpital de Zone Calavi',
      timestamp: new Date(),
    });
    return Promise.resolve();
  }

  private inferType(action: string): ActivityType {
    if (action.includes('consultation') || action.includes('Consultation')) return 'consultation';
    if (action.includes('prescription') || action.includes('ordonnance')) return 'prescription';
    if (action.includes('analyse') || action.includes('résultat')) return 'lab_result';
    if (action.includes('accès') || action.includes('consentement')) return 'consent';
    if (action.includes('hospitalisation')) return 'hospitalization';
    if (action.includes('imagerie')) return 'imaging';
    return 'consultation';
  }
}
