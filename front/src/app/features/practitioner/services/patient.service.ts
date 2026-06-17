import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FollowedPatient } from '../dashboard/dashboard.model';
import { Patient } from '../dashboard/widget/patients/patient.model';
import { MedicalPractitionerService } from './medical-practitioner.service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private medicalPrac = inject(MedicalPractitionerService);

  getFollowedPatients(practitionerUserId?: string): Promise<FollowedPatient[]> {
    if (!practitionerUserId) return Promise.resolve(MOCK_FOLLOWED_PATIENTS);
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

  getPatientsList(practitionerUserId?: string): Promise<Patient[]> {
    if (!practitionerUserId) return Promise.resolve(MOCK_PATIENTS);
    return firstValueFrom(this.medicalPrac.getPractitionerPatients(practitionerUserId)).then(
      dtos => dtos.map(dto => ({
        npi: dto.user_id,
        name: `Patient ${dto.user_id.slice(0, 8)}`,
        initials: dto.user_id.slice(0, 2).toUpperCase(),
        age: 0,
        gender: 'M' as const,
        lastContact: new Date(),
        priority: 'low' as const,
        isCritical: false,
        primaryDiagnosis: undefined,
        nextAppointment: null,
        activePrescriptions: 0,
      }))
    );
  }
}

const MOCK_FOLLOWED_PATIENTS: FollowedPatient[] = [
  { npi: '1029384756', name: 'Kouassi Adebayo', initials: 'KA', age: 58, gender: 'M', lastVisit: new Date('2024-05-12'), primaryDiagnosis: 'Hypertension artérielle essentielle (I10)', isCritical: true, followUpFrequency: 'weekly', createdAt: new Date('2023-01-20') },
  { npi: '9283746152', name: 'Moussa Ballo', initials: 'MB', age: 42, gender: 'M', lastVisit: new Date('2024-05-10'), primaryDiagnosis: 'Diabète de type 2 (E11)', isCritical: false, followUpFrequency: 'monthly', createdAt: new Date('2023-03-15') },
  { npi: '7733992211', name: 'Pauline Kodjo', initials: 'PK', age: 29, gender: 'F', lastVisit: new Date('2024-05-05'), primaryDiagnosis: 'Asthme (J45)', isCritical: false, followUpFrequency: 'quarterly', createdAt: new Date('2023-06-10') },
  { npi: '5566778899', name: 'Jean-Pierre Dossou', initials: 'JD', age: 67, gender: 'M', lastVisit: new Date('2024-04-28'), primaryDiagnosis: 'Maladie coronarienne (I25.1)', isCritical: false, followUpFrequency: 'monthly', createdAt: new Date('2022-11-05') },
  { npi: '1122334455', name: 'Aminata Sow', initials: 'AS', age: 35, gender: 'F', lastVisit: new Date('2024-05-15'), primaryDiagnosis: 'Grossesse - Suivi prénatal (O09.5)', isCritical: false, followUpFrequency: 'monthly', createdAt: new Date('2024-02-01') },
  { npi: '9988776655', name: 'Ibrahim Adamou', initials: 'IA', age: 51, gender: 'M', lastVisit: new Date('2024-03-20'), primaryDiagnosis: 'RGO avec oesophagite (K21.0)', isCritical: false, followUpFrequency: 'quarterly', createdAt: new Date('2023-09-12') },
];

const MOCK_PATIENTS: Patient[] = [
  { npi: '1029384756', name: 'Kouassi Adebayo', initials: 'KA', age: 58, gender: 'M', lastContact: new Date('2024-05-12'), priority: 'critical', isCritical: true, primaryDiagnosis: { code: 'I10', label: 'Hypertension artérielle essentielle' }, nextAppointment: { date: new Date('2024-06-15'), time: '10:30' }, activePrescriptions: 3 },
  { npi: '9283746152', name: 'Moussa Ballo', initials: 'MB', age: 42, gender: 'M', lastContact: new Date('2024-05-10'), priority: 'high', isCritical: false, primaryDiagnosis: { code: 'E11', label: 'Diabète de type 2' }, nextAppointment: { date: new Date('2024-06-20'), time: '14:00' }, activePrescriptions: 2 },
  { npi: '7733992211', name: 'Pauline Kodjo', initials: 'PK', age: 29, gender: 'F', lastContact: new Date('2024-05-05'), priority: 'low', isCritical: false, primaryDiagnosis: { code: 'J45', label: 'Asthme' }, nextAppointment: null, activePrescriptions: 1 },
  { npi: '5566778899', name: 'Jean-Pierre Dossou', initials: 'JD', age: 67, gender: 'M', lastContact: new Date('2024-04-28'), priority: 'high', isCritical: false, primaryDiagnosis: { code: 'I25.1', label: 'Maladie coronarienne' }, nextAppointment: { date: new Date('2024-06-10'), time: '09:00' }, activePrescriptions: 4 },
  { npi: '1122334455', name: 'Aminata Sow', initials: 'AS', age: 35, gender: 'F', lastContact: new Date('2024-05-15'), priority: 'medium', isCritical: false, primaryDiagnosis: { code: 'O09.5', label: 'Grossesse - Suivi prénatal' }, nextAppointment: { date: new Date('2024-06-18'), time: '11:00' }, activePrescriptions: 1 },
  { npi: '9988776655', name: 'Ibrahim Adamou', initials: 'IA', age: 51, gender: 'M', lastContact: new Date('2024-03-20'), priority: 'medium', isCritical: false, primaryDiagnosis: { code: 'K21.0', label: 'RGO avec oesophagite' }, nextAppointment: null, activePrescriptions: 2 },
];
