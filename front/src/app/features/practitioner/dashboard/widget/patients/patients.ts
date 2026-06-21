import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Patient, Priority } from './patient.model';
import { PatientService } from '../../../services/patient.service';
import { AuditService } from '../../../services/audit.service';
import { AuthStore } from '../../../../../core/auth/auth.store';
import { AuthService } from '../../../../../core/auth/auth-service';
import { MedicalPractitionerService } from '../../../services/medical-practitioner.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-patients',
  imports: [DatePipe, CommonModule, FormsModule, RouterLink],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients {
  authStore = AuthStore;
  loading = signal(true);
  patients = signal<Patient[]>([]);
  totalPatients = signal(0);
  filteredCount = signal(0);
  displayedCount = signal(0);
  hasMorePatients = signal(true);
  notificationCount = signal(2);
  searchQuery = signal('');
  searchResults = signal<Patient[]>([]);
  searchTimer: ReturnType<typeof setTimeout> | null = null;
  searchLoading = signal(false);

  showNewPatientModal = signal(false);
  newPatientSearchQuery = signal('');
  newPatientSearchResults = signal<{ user_id: string; npi: string; full_name: string | null }[]>([]);
  newPatientSearchLoading = signal(false);
  newPatientSearchTimer: ReturnType<typeof setTimeout> | null = null;
  accessRequestSent = signal(false);
  accessRequestError = signal<string | null>(null);
  selectedPatientForAccess: { user_id: string; full_name: string | null } | null = null;

  // Protocole d'urgence
  urgentState = signal<'idle' | 'loading' | 'countdown' | 'approved' | 'expired' | 'forcing' | 'forced' | 'error'>('idle');
  urgentSessionId = signal<string | null>(null);
  urgentRemainingSeconds = signal(180);
  urgentError = signal<string | null>(null);
  private urgentTimer: ReturnType<typeof setInterval> | null = null;

  userId = computed(() => this.authStore.userId() ?? '');

  practitioner = computed(() => ({
    name: `Dr. ${this.authStore.user()?.identity?.firstName ?? ''} ${this.authStore.user()?.identity?.lastName ?? ''}`,
    specialty: this.authStore.user()?.practitioner?.speciality ?? 'Médecine Générale',
    rpps: String(this.authStore.user()?.practitioner?.orderNumber ?? ''),
    avatar: this.authStore.user()?.identity?.photoPath ?? '',
  }));

  newConsultationMode = signal(false);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  private auditService = inject(AuditService);
  private medicalPrac = inject(MedicalPractitionerService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.auditService.setUserId(this.userId());
    this.route.queryParams.subscribe(params => {
      const q = params['q'] || '';
      if (q) {
        this.searchQuery.set(q);
        this.performSearch(q);
      }
      this.newConsultationMode.set(params['action'] === 'new-consultation');
    });
    this.loadPatients();
  }

  private async loadPatients(): Promise<void> {
    this.loading.set(true);
    const uid = this.userId();
    if (!uid) {
      this.loading.set(false);
      return;
    }

    try {
      const patients = await this.patientService.getPatientsList(uid);

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

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.performSearch(value), 300);
  }

  private async performSearch(q?: string): Promise<void> {
    const query = q ?? this.searchQuery().trim();
    if (query.length < 2) {
      this.searchResults.set([]);
      this.filteredCount.set(this.patients().length);
      return;
    }
    try {
      this.searchLoading.set(true);
      const results = await this.patientService.searchPatients(query);
      this.searchResults.set(results);
      this.filteredCount.set(results.length);
      this.displayedCount.set(Math.min(9, results.length));
      this.hasMorePatients.set(results.length > 9);
    } catch (e) {
      console.error('Erreur recherche patients:', e);
    } finally {
      this.searchLoading.set(false);
    }
  }

  openPatientFile(npi: string): void {
    this.auditService.logAction('open_patient_file', { npi });
    localStorage.setItem('selectedPatientNpi', npi);
    const extras = this.newConsultationMode()
      ? { queryParams: { newActe: 'true' } }
      : {};
    this.router.navigate(['/practitioner/patient', npi], extras);
  }

  navigateTo(route: string): void {
    const routes: Record<string, string[]> = {
      dashboard: ['/practitioner/dashboard'],
      consents: ['/practitioner/consents'],
      organizations: ['/practitioner/organizations'],
    };

    if (routes[route]) {
      this.router.navigate(routes[route]);
    }
  }

  navigateToDossier(): void {
    const npi = localStorage.getItem('selectedPatientNpi');
    if (npi) {
      this.router.navigate(['/practitioner/patient', npi]);
    }
  }

  loadMorePatients(): void {
    // TODO: Pagination API
    console.log('Load more patients');
  }

  openNewPatientModal(): void {
    this.showNewPatientModal.set(true);
    this.newPatientSearchQuery.set('');
    this.newPatientSearchResults.set([]);
    this.accessRequestSent.set(false);
    this.accessRequestError.set(null);
    this.selectedPatientForAccess = null;
  }

  closeNewPatientModal(): void {
    this.cancelEmergencyProtocol();
    this.showNewPatientModal.set(false);
  }

  onNewPatientSearchInput(value: string): void {
    this.newPatientSearchQuery.set(value);
    if (this.newPatientSearchTimer) clearTimeout(this.newPatientSearchTimer);
    this.newPatientSearchTimer = setTimeout(() => this.performNewPatientSearch(), 300);
  }

  private async performNewPatientSearch(): Promise<void> {
    const q = this.newPatientSearchQuery().trim();
    if (q.length < 2) {
      this.newPatientSearchResults.set([]);
      return;
    }
    this.newPatientSearchLoading.set(true);
    try {
      const results = await firstValueFrom(this.medicalPrac.searchPatients(q));
      this.newPatientSearchResults.set(results);
    } catch (e) {
      console.error('Erreur recherche nouveau patient:', e);
      this.newPatientSearchResults.set([]);
    } finally {
      this.newPatientSearchLoading.set(false);
    }
  }

  selectPatientForAccess(patient: { user_id: string; full_name: string | null }): void {
    this.selectedPatientForAccess = patient;
  }

  async sendAccessRequest(): Promise<void> {
    if (!this.selectedPatientForAccess) return;
    this.accessRequestError.set(null);
    this.accessRequestSent.set(false);
    const uid = this.userId();
    if (!uid) return;
    try {
      await firstValueFrom(this.medicalPrac.createAccessRequest(uid, {
        patient_user_id: this.selectedPatientForAccess.user_id,
        reason: 'Demande d\'accès au dossier médical',
        duration: '24h',
        perimeter: 'all',
      }));
      this.accessRequestSent.set(true);
      this.selectedPatientForAccess = null;
    } catch (e: any) {
      this.accessRequestError.set(e?.error?.detail || 'Erreur lors de l\'envoi de la demande');
    }
  }

  // ── Protocole d'urgence ──────────────────────────────────

  async initiateEmergencyProtocol(): Promise<void> {
    if (!this.selectedPatientForAccess) return;
    this.urgentError.set(null);
    this.urgentState.set('loading');
    try {
      const res = await this.authService.initierUrgence(this.selectedPatientForAccess.user_id);
      this.urgentSessionId.set(res.session_id);
      this.urgentState.set('countdown');
      this.startUrgentCountdown(res.expires_at);
      this.startUrgentPolling(res.session_id);
    } catch (e: any) {
      this.urgentState.set('error');
      this.urgentError.set(e?.error?.error || e?.error?.detail || 'Erreur lors de l\'initialisation du protocole d\'urgence');
    }
  }

  private startUrgentCountdown(expiresAt: string): void {
    const target = new Date(expiresAt).getTime();
    const tick = () => {
      const remaining = Math.max(0, Math.floor((target - Date.now()) / 1000));
      this.urgentRemainingSeconds.set(remaining);
      if (remaining <= 0) {
        if (this.urgentState() === 'countdown') {
          this.urgentState.set('expired');
        }
        this.stopUrgentTimer();
      }
    };
    tick();
    this.urgentTimer = setInterval(tick, 1000);
  }

  private startUrgentPolling(sessionId: string): void {
    const poll = async () => {
      try {
        const status = await this.authService.getStatutUrgence(sessionId);
        if (status.status === 'approuve_contact') {
          this.urgentState.set('approved');
          this.urgentRemainingSeconds.set(0);
          this.stopUrgentTimer();
        } else if (status.status === 'expire') {
          this.urgentState.set('expired');
          this.stopUrgentTimer();
        }
      } catch {
        // ignore polling errors
      }
    };
    // Poll every 3 seconds
    const intervalId = setInterval(poll, 3000);
    // Store the interval for cleanup — reuse urgentTimer as it's already used for countdown
    const origCleanup = this.ngOnDestroy?.bind(this);
    const origStop = this.stopUrgentTimer.bind(this);
    const pollingInterval = { id: intervalId };
    (this as any).__urgentPolling = pollingInterval;
  }

  private stopUrgentTimer(): void {
    if (this.urgentTimer) {
      clearInterval(this.urgentTimer);
      this.urgentTimer = null;
    }
  }

  private stopUrgentPolling(): void {
    const polling = (this as any).__urgentPolling as { id: ReturnType<typeof setInterval> } | undefined;
    if (polling) {
      clearInterval(polling.id);
      (this as any).__urgentPolling = undefined;
    }
  }

  async forceEmergencyAccess(): Promise<void> {
    const sessionId = this.urgentSessionId();
    if (!sessionId) return;
    this.urgentState.set('forcing');
    try {
      await this.authService.forcerUrgence(sessionId);
      this.urgentState.set('forced');
    } catch (e: any) {
      this.urgentState.set('error');
      this.urgentError.set(e?.error?.error || e?.error?.detail || 'Erreur lors du forçage de l\'accès');
    }
  }

  cancelEmergencyProtocol(): void {
    this.stopUrgentTimer();
    this.stopUrgentPolling();
    this.urgentState.set('idle');
    this.urgentSessionId.set(null);
    this.urgentRemainingSeconds.set(180);
    this.urgentError.set(null);
  }

  ngOnDestroy(): void {
    this.stopUrgentTimer();
    this.stopUrgentPolling();
  }

  openPatientFileFromUrgence(npi: string): void {
    this.cancelEmergencyProtocol();
    this.closeNewPatientModal();
    this.openPatientFile(npi);
  }

  displayPatients = computed(() => {
    const results = this.searchResults();
    if (results.length > 0) return results.slice(0, this.displayedCount());
    return this.patients().slice(0, this.displayedCount());
  });

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

  currentYear = new Date().getFullYear();
}
