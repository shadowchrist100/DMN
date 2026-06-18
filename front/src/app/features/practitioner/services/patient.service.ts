import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FollowedPatient } from '../dashboard/dashboard.model';
import { Patient } from '../dashboard/widget/patients/patient.model';
import { MedicalPractitionerService } from './medical-practitioner.service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private medicalPrac = inject(MedicalPractitionerService);

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
