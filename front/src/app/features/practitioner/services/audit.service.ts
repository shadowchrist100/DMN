import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActivityLog } from '../dashboard/dashboard.model';
import { MedicalPractitionerService } from './medical-practitioner.service';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private medicalPrac = inject(MedicalPractitionerService);

  private userId: string = '';

  setUserId(id: string): void {
    this.userId = id;
  }

  getRecentActivities(limit: number): Promise<ActivityLog[]> {
    return firstValueFrom(this.medicalPrac.getPractitionerActivities(this.userId, limit)).then(
      dtos => dtos.map(dto => ({
        id: dto.id,
        type: dto.type as ActivityLog['type'],
        action: dto.action,
        patientName: dto.patient_name || undefined,
        patientNpi: dto.patient_npi || undefined,
        facility: dto.facility,
        timestamp: new Date(dto.timestamp),
        badge: dto.badge_text ? {
          text: dto.badge_text,
          type: dto.badge_type as 'success' | 'warning' | 'info' | 'critical',
        } : undefined,
      }))
    );
  }

  logAction(_action: string, _metadata?: Record<string, unknown>): Promise<void> {
    return Promise.resolve();
  }
}
