import { Component, OnInit, signal, computed, inject} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Patient,  Priority, Diagnosis } from './patient.model';


@Component({
  selector: 'app-patients',
  imports: [DatePipe],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients {
  // Signals
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
  // private patientService = inject(PatientService);
  // private auditService = inject(AuditService);

  ngOnInit(): void {
    this.loadPatients();
  }

  private async loadPatients(): Promise<void> {
    this.loading.set(true);

    try {
      // Simulation API
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockPatients = this.getMockPatients();

      this.patients.set(mockPatients);
      this.totalPatients.set(mockPatients.length);
      this.filteredCount.set(mockPatients.length);
      this.displayedCount.set(Math.min(9, mockPatients.length));
      this.hasMorePatients.set(mockPatients.length > 9);

    } catch (error) {
      console.error('Erreur chargement patients:', error);
    } finally {
      this.loading.set(false);
    }
  }

  openPatientFile(npi: string): void {
    // Logger l'action pour l'audit
    // this.auditService.logAction('open_patient_file', { npi });
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

  private getMockPatients(): Patient[] {
    return [
      {
        npi: '1029384756',
        name: 'Kouassi Adebayo',
        initials: 'KA',
        age: 58,
        gender: 'M',
        lastContact: new Date('2024-05-12'),
        priority: 'critical',
        isCritical: true,
        primaryDiagnosis: {
          code: 'I10',
          label: 'Hypertension artérielle essentielle'
        },
        nextAppointment: {
          date: new Date('2024-06-15'),
          time: '10:30'
        },
        activePrescriptions: 3
      },
      {
        npi: '9283746152',
        name: 'Moussa Ballo',
        initials: 'MB',
        age: 42,
        gender: 'M',
        lastContact: new Date('2024-05-10'),
        priority: 'high',
        isCritical: false,
        primaryDiagnosis: {
          code: 'E11',
          label: 'Diabète de type 2'
        },
        nextAppointment: {
          date: new Date('2024-06-20'),
          time: '14:00'
        },
        activePrescriptions: 2
      },
      {
        npi: '7733992211',
        name: 'Pauline Kodjo',
        initials: 'PK',
        age: 29,
        gender: 'F',
        lastContact: new Date('2024-05-05'),
        priority: 'low',
        isCritical: false,
        primaryDiagnosis: {
          code: 'J45',
          label: 'Asthme'
        },
        nextAppointment: null,
        activePrescriptions: 1
      },
      {
        npi: '5566778899',
        name: 'Jean-Pierre Dossou',
        initials: 'JD',
        age: 67,
        gender: 'M',
        lastContact: new Date('2024-04-28'),
        priority: 'high',
        isCritical: false,
        primaryDiagnosis: {
          code: 'I25.1',
          label: 'Maladie coronarienne'
        },
        nextAppointment: {
          date: new Date('2024-06-10'),
          time: '09:00'
        },
        activePrescriptions: 4
      },
      {
        npi: '1122334455',
        name: 'Aminata Sow',
        initials: 'AS',
        age: 35,
        gender: 'F',
        lastContact: new Date('2024-05-15'),
        priority: 'medium',
        isCritical: false,
        primaryDiagnosis: {
          code: 'O09.5',
          label: 'Grossesse - Suivi prénatal'
        },
        nextAppointment: {
          date: new Date('2024-06-18'),
          time: '11:00'
        },
        activePrescriptions: 1
      },
      {
        npi: '9988776655',
        name: 'Ibrahim Adamou',
        initials: 'IA',
        age: 51,
        gender: 'M',
        lastContact: new Date('2024-03-20'),
        priority: 'medium',
        isCritical: false,
        primaryDiagnosis: {
          code: 'K21.0',
          label: 'RGO avec œsophagite'
        },
        nextAppointment: null,
        activePrescriptions: 2
      }
    ];
  }
}
// import { Component, OnInit, signal, computed, inject } from '@angular/core';


// import { PatientService } from '../../services/patient.service';
// import { AuditService } from '../../services/audit.service';

// @Component({
//   selector: 'app-patients-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './patients-list.component.html',
//   styleUrls: ['./patients-list.component.css']
// })
// export class PatientsListComponent implements OnInit {


// }