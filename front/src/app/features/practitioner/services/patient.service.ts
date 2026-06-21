import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FollowedPatient } from '../dashboard/dashboard.model';
import { Patient } from '../dashboard/widget/patients/patient.model';
import { MedicalPractitionerService } from './medical-practitioner.service';
import { AuthService } from '../../../core/auth/auth-service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private medicalPrac = inject(MedicalPractitionerService);
  private auth = inject(AuthService);

  private async enrichWithPhoto<T extends { npi: string; photoUrl?: string }>(patients: T[]): Promise<T[]> {
    const enriched = await Promise.all(
      patients.map(async (p) => {
        try {
          const resp = await this.auth.getUser(p.npi);
          return { ...p, photoUrl: resp.photo_url || undefined };
        } catch {
          return p;
        }
      })
    );
    return enriched;
  }

  searchPatients(query: string): Promise<Patient[]> {
    if (!query || query.trim().length < 2) return Promise.resolve([]);
    return firstValueFrom(this.medicalPrac.searchPatients(query)).then(
      dtos => dtos.map(dto => ({
        npi: dto.npi || dto.user_id,
        name: dto.full_name || dto.user_id,
        initials: dto.full_name
          ? dto.full_name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
          : dto.user_id.slice(0, 2).toUpperCase(),
        age: dto.age || 0,
        gender: (dto.gender as 'M' | 'F') || 'M',
        lastContact: new Date(),
        priority: 'low' as const,
        isCritical: false,
        activePrescriptions: 0,
      }))
    );
  }

  async getFollowedPatients(practitionerUserId: string): Promise<FollowedPatient[]> {
    const dtos = await firstValueFrom(this.medicalPrac.getPractitionerPatients(practitionerUserId));
    const patients = await Promise.all(dtos.map(async dto => {
      const first = dto.first_name || '';
      const last = dto.last_name || '';
      const name = [first, last].filter(Boolean).join(' ') || `Patient ${dto.user_id.slice(0, 8)}`;
      const initials = (first[0] || '') + (last[0] || '') || dto.user_id.slice(0, 2).toUpperCase();
      let photoUrl: string | undefined;
      try {
        const resp = await this.auth.getUser(dto.user_id);
        photoUrl = resp.photo_url || undefined;
      } catch {
        // photo non disponible
      }
      return {
        npi: dto.user_id,
        name,
        initials,
        age: 0,
        gender: 'M' as const,
        lastVisit: new Date(),
        isCritical: false,
        createdAt: new Date(),
        photoUrl,
      };
    }));
    return patients;
  }

  async getPatientsList(practitionerUserId: string): Promise<Patient[]> {
    const patients = await firstValueFrom(this.medicalPrac.getPractitionerPatientsList(practitionerUserId)).then(
      dtos => dtos.map(dto => ({
        npi: dto.npi,
        name: dto.name,
        initials: dto.initials,
        age: dto.age,
        gender: dto.gender as 'M' | 'F',
        lastContact: (() => {
            const d = dto.last_contact ? new Date(dto.last_contact) : new Date();
            return isNaN(d.getTime()) ? new Date() : d;
        })(),
        priority: dto.priority as Patient['priority'],
        isCritical: dto.is_critical,
        primaryDiagnosis: dto.primary_diagnosis_code ? {
          code: dto.primary_diagnosis_code,
          label: dto.primary_diagnosis_label || '',
        } : undefined,
        nextAppointment: dto.next_appointment_date ? {
          date: new Date(dto.next_appointment_date),
          time: dto.next_appointment_time || '',
        } : null,
        activePrescriptions: dto.active_prescriptions,
      }))
    );
    return this.enrichWithPhoto(patients);
  }
}
