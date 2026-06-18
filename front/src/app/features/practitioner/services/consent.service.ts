import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccessRequest } from '../dashboard/dashboard.model';
import { MedicalPractitionerService } from './medical-practitioner.service';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private medicalPrac = inject(MedicalPractitionerService);

  private userId: string = '';

  setUserId(id: string): void {
    this.userId = id;
  }

  getPendingAccessRequests(): Promise<AccessRequest[]> {
    return firstValueFrom(this.medicalPrac.getPractitionerAccessRequests(this.userId)).then(
      dtos => dtos.map(dto => ({
        id: dto.id,
        patientNpi: dto.patient_npi,
        patientName: dto.patient_name,
        reason: dto.reason,
        requestedAt: new Date(dto.requested_at),
        urgency: dto.urgency as AccessRequest['urgency'],
        requestedBy: {
          name: dto.requested_by_name,
          role: dto.requested_by_role,
          facility: dto.requested_by_facility,
        },
        expiresAt: new Date(dto.expires_at),
      }))
    );
  }

  acceptAccessRequest(id: string): Promise<void> {
    return firstValueFrom(this.medicalPrac.acceptAccessRequest(this.userId, id)).then(() => undefined);
  }

  declineAccessRequest(id: string, _reason?: string): Promise<void> {
    return firstValueFrom(this.medicalPrac.declineAccessRequest(this.userId, id)).then(() => undefined);
  }
}
