import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Patient, Priority } from './patient.model';
import { PatientService } from '../../../services/patient.service';
import { AuditService } from '../../../services/audit.service';

@Component({
  selector: 'app-patients',
  imports: [DatePipe],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients {
  loading = signal(true);
  patients = signal<Patient[]>([]);
  totalPatients = signal(0);
  filteredCount = signal(0);
  displayedCount = signal(0);
  hasMorePatients = signal(true);
  notificationCount = signal(2);
  pendingReports = signal(5);

  practitioner = {
    name: 'Dr. Sarah AGOSSA',
    specialty: 'Médecine Générale',
    rpps: '1000456789',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_wbjSaptTJKnjj2Bd47-SBu-2ObqC9jJf6SDutNa5WlR3u3TwTyY62noEzF4i7NoYP-MKAm88NdtyTSQ24xrCtWA_U9EsUWKEw5uHO3f1uSHpRXVGmBry10LOpsuuGqAFl4uFYqD0KUsonVl0e0yzQB4UIwyXHlPG3VIS8NGTyEo5iNlm1ZatJUQg1Q_08apL2idCqnhfHSZV2b4DlUeycHFXbwCxa-oV6xbDQ_st83VFk1OBr-c-aQPzLHmpNRgfW18TRlF1Qaq_'
  };

  private router = inject(Router);
  private patientService = inject(PatientService);
  private auditService = inject(AuditService);

  ngOnInit(): void {
    this.loadPatients();
  }

  private async loadPatients(): Promise<void> {
    this.loading.set(true);

    try {
      const patients = await this.patientService.getPatientsList();

      this.patients.set(patients);
      this.totalPatients.set(patients.length);
      this.filteredCount.set(patients.length);
      this.displayedCount.set(Math.min(9, patients.length));
      this.hasMorePatients.set(patients.length > 9);

    } catch (error) {
      console.error('Erreur chargement patients:', error);
    } finally {
      this.loading.set(false);
    }
  }

  openPatientFile(npi: string): void {
    this.auditService.logAction('open_patient_file', { npi });
    this.router.navigate(['/patient', npi, 'overview']);
  }

  navigateTo(route: string): void {
    const routes: Record<string, string[]> = {
      dashboard: ['/practitioner/dashboard'],
      reports: ['/practitioner/reports'],
      prescriptions: ['/practitioner/prescriptions'],
      analyses: ['/practitioner/analyses'],
      audit: ['/practitioner/audit']
    };

    if (routes[route]) {
      this.router.navigate(routes[route]);
    }
  }

  loadMorePatients(): void {
    // TODO: Pagination API
    console.log('Load more patients');
  }

  getPriorityBadgeClass(priority: Priority): string {
    const classes: Record<Priority, string> = {
      critical: 'bg-red-50 text-red-700 border border-red-200',
      high: 'bg-amber-50 text-amber-700 border border-amber-200',
      medium: 'bg-blue-50 text-blue-700 border border-blue-200',
      low: 'bg-green-50 text-green-700 border border-green-200'
    };
    return classes[priority];
  }

  getPriorityLabel(priority: Priority): string {
    const labels: Record<Priority, string> = {
      critical: 'Critique',
      high: 'Élevée',
      medium: 'Moyenne',
      low: 'Normale'
    };
    return labels[priority];
  }

}
