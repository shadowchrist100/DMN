import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccessRequest } from '../dashboard/dashboard.model';
import { MedicalPractitionerService } from './medical-practitioner.service';

export interface Consent {
  id: string;
  patientName: string;
  patientNpi: string;
  status: 'active' | 'pending' | 'expired';
  perimeter: string;
  duration: string;
  grantedAt?: string;
  expiresAt?: string;
  isUrgent: boolean;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private medicalPrac = inject(MedicalPractitionerService);

  /** userId mis à jour après identification du praticien */
  readonly userId = signal<string>('');

  setUserId(id: string): void {
    this.userId.set(id);
  }

  // ── Consentements (liste complète) ──────────────────────────────────────

  getConsents(): Promise<Consent[]> {
    const uid = this.userId();
    if (!uid) return Promise.resolve([]);
    return firstValueFrom(this.medicalPrac.getPractitionerConsents(uid)).then(
      dtos => dtos.map(dto => ({
        id:          dto.id,
        patientName: dto.patient_name,
        patientNpi:  dto.patient_npi,
        status:      dto.status as Consent['status'],
        perimeter:   this._perimeterLabel(dto.perimeter),
        duration:    dto.duration,
        grantedAt:   dto.granted_at ?? undefined,
        expiresAt:   dto.expires_at ?? undefined,
        isUrgent:    dto.is_urgence,
        reason:      dto.reason,
      }))
    );
  }

  // ── Demandes d'accès en attente (dashboard) ──────────────────────────────

  getPendingAccessRequests(): Promise<AccessRequest[]> {
    const uid = this.userId();
    if (!uid) return Promise.resolve([]);
    return firstValueFrom(this.medicalPrac.getPractitionerAccessRequests(uid)).then(
      dtos => dtos.map(dto => ({
        id:          dto.id,
        patientNpi:  dto.patient_npi,
        patientName: dto.patient_name,
        reason:      dto.reason,
        requestedAt: new Date(dto.requested_at),
        urgency:     dto.urgency as AccessRequest['urgency'],
        requestedBy: {
          name:     dto.requested_by_name,
          role:     dto.requested_by_role,
          facility: dto.requested_by_facility,
        },
        expiresAt: new Date(dto.expires_at),
      }))
    );
  }

  acceptAccessRequest(id: string): Promise<void> {
    const uid = this.userId();
    return firstValueFrom(this.medicalPrac.acceptAccessRequest(uid, id)).then(() => undefined);
  }

  declineAccessRequest(id: string, _reason?: string): Promise<void> {
    const uid = this.userId();
    return firstValueFrom(this.medicalPrac.declineAccessRequest(uid, id)).then(() => undefined);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private _perimeterLabel(code: string): string {
    const map: Record<string, string> = {
      all:           'Dossier complet',
      prescriptions: 'Analyses & Prescriptions',
    };
    return map[code] ?? code;
  }
}
