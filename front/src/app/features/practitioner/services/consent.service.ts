import { Injectable } from '@angular/core';
import { AccessRequest } from '../dashboard/dashboard.model';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private mockRequests: AccessRequest[] = [
    {
      id: 'REQ-001',
      patientNpi: '5566778899',
      patientName: 'Jean-Pierre Dossou',
      reason: 'Consultation de suivi cardiologique — accès au dossier complet requis',
      requestedAt: new Date('2024-05-14T09:30:00'),
      urgency: 'high',
      requestedBy: {
        name: 'Dr. K. Kouandété',
        role: 'Cardiologue',
        facility: 'CNHU-HKM Cotonou',
      },
      expiresAt: new Date('2024-06-14'),
    },
    {
      id: 'REQ-002',
      patientNpi: '9283746152',
      patientName: 'Moussa Ballo',
      reason: 'Prescription d\'examens complémentaires — bilan diabétique annuel',
      requestedAt: new Date('2024-05-13T14:00:00'),
      urgency: 'medium',
      requestedBy: {
        name: 'Dr. A. SOUMANOU',
        role: 'Biologiste',
        facility: 'Laboratoire National de Santé Publique',
      },
      expiresAt: new Date('2024-06-13'),
    },
    {
      id: 'REQ-003',
      patientNpi: '7733992211',
      patientName: 'Pauline Kodjo',
      reason: 'Avis pneumologique — suspicion d\'asthme professionnel',
      requestedAt: new Date('2024-05-12T11:15:00'),
      urgency: 'low',
      requestedBy: {
        name: 'Dr. M. GANDONOU',
        role: 'Pneumologue',
        facility: 'Hôpital Pulmonaire de Cotonou',
      },
      expiresAt: new Date('2024-06-12'),
    },
  ];

  getPendingAccessRequests(): Promise<AccessRequest[]> {
    return Promise.resolve([...this.mockRequests]);
  }

  acceptAccessRequest(id: string): Promise<void> {
    this.mockRequests = this.mockRequests.filter(r => r.id !== id);
    return Promise.resolve();
  }

  declineAccessRequest(id: string, _reason?: string): Promise<void> {
    this.mockRequests = this.mockRequests.filter(r => r.id !== id);
    return Promise.resolve();
  }
}
