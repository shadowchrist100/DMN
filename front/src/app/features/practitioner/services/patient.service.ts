import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FollowedPatient } from '../dashboard/dashboard.model';
import { Patient } from '../dashboard/widget/patients/patient.model';
import { MedicalPractitionerService } from './medical-practitioner.service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private medicalPrac = inject(MedicalPractitionerService);

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

  getFollowedPatients(practitionerUserId: string): Promise<FollowedPatient[]> {
    return firstValueFrom(this.medicalPrac.getPractitionerPatients(practitionerUserId)).then(
      dtos => dtos.map(dto => ({
        npi: dto.user_id,
        name: `Patient ${dto.user_id.slice(0, 8)}`,
        initials: dto.user_id.slice(0, 2).toUpperCase(),
        age: 0,
        gender: 'M' as const,
        lastVisit: new Date(),
        isCritical: false,
        createdAt: new Date(),
      }))
    );
  }

  getPatientsList(practitionerUserId: string): Promise<Patient[]> {
    return firstValueFrom(this.medicalPrac.getPractitionerPatientsList(practitionerUserId)).then(
      dtos => dtos.map(dto => ({
        npi: dto.npi,
        name: dto.name,
        initials: dto.initials,
        age: dto.age,
        gender: dto.gender as 'M' | 'F',
        lastContact: dto.last_contact ? new Date(dto.last_contact) : new Date(),
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
  }
}
