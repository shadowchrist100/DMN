import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
    Practitioner,
    PractitionerStats,
    FollowedPatient,
    AccessRequest,
    Organization,
    ActivityLog,
    PatientFilter
} from './dashboard.model';
import { FormsModule } from '@angular/forms';
import { PractitionerService } from '../services/practitioner.service';
import { PatientService } from '../services/patient.service';
import { ConsentService } from '../services/consent.service';
import { AuditService } from '../services/audit.service';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
    loading = signal(true);
    practitioner = signal<Practitioner | null>(null);
    stats = signal<PractitionerStats>({
        followedPatients: 0,
        newPatientsThisMonth: 0,
        consultationsThisWeek: 0,
        completedVisits: 0,
        upcomingVisits: 0,
        pendingReports: 0
    });

    followedPatients = signal<FollowedPatient[]>([]);
    pendingAccessRequests = signal<AccessRequest[]>([]);
    organizations = signal<Organization[]>([]);
    recentActivities = signal<ActivityLog[]>([]);

    patientFilter = signal<PatientFilter>('all');
    today = new Date();

    private router = inject(Router);
    private practitionerService = inject(PractitionerService);
    private patientService = inject(PatientService);
    private consentService = inject(ConsentService);
    private auditService = inject(AuditService);

    filteredPatients = computed(() => {
        const patients = this.followedPatients();
        const filter = this.patientFilter();

        switch (filter) {
            case 'recent':
                return patients.filter(p =>
                    this.isWithinDays(p.lastVisit, 30)
                );
            case 'critical':
                return patients.filter(p => p.isCritical);
            case 'follow_up':
                return patients.filter(p => p.followUpFrequency !== undefined);
            default:
                return patients;
        }
    });

    ngOnInit(): void {
        this.loadDashboardData();
    }

    private async loadDashboardData(): Promise<void> {
        this.loading.set(true);

        try {
            const [practitioner, patients, requests, orgs, activities] = await Promise.all([
                this.practitionerService.getCurrentPractitioner(),
                this.patientService.getFollowedPatients(),
                this.consentService.getPendingAccessRequests(),
                this.practitionerService.getPractitionerOrganizations(),
                this.auditService.getRecentActivities(10)
            ]);

            this.practitioner.set(practitioner);
            this.followedPatients.set(patients);
            this.pendingAccessRequests.set(requests);
            this.organizations.set(orgs);
            this.recentActivities.set(activities);

            this.calculateStats(patients, requests);

        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        } finally {
            this.loading.set(false);
        }
    }

    private calculateStats(patients: FollowedPatient[], requests: AccessRequest[]): void {
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        this.stats.set({
            followedPatients: patients.length,
            newPatientsThisMonth: patients.filter(p =>
                new Date(p.createdAt) >= monthAgo
            ).length,
            consultationsThisWeek: 12,
            completedVisits: 8,
            upcomingVisits: 4,
            pendingReports: 5
        });
    }

    // ===== HELPERS =====

    private isWithinDays(date: Date, days: number): boolean {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);
        return new Date(date) >= threshold;
    }

    getActivityIcon(type: string): string {
        const icons: Record<string, string> = {
            consultation: 'stethoscope',
            prescription: 'medication',
            lab_result: 'biotech',
            consent: 'verified_user',
            hospitalization: 'hospital',
            imaging: 'radiology'
        };
        return icons[type] || 'description';
    }

    getActivityBadgeClass(type: string): string {
        const classes: Record<string, string> = {
            success: 'bg-green-50 text-green-700',
            warning: 'bg-amber-50 text-amber-700',
            info: 'bg-blue-50 text-blue-700',
            critical: 'bg-red-50 text-red-700'
        };
        return classes[type] || '';
    }

    // ===== ACTIONS UTILISATEUR =====

    navigateTo(route: string): void {
        const routes: Record<string, string[]> = {
            patients: ['/practitioner/patients'],
            requests: ['/practitioner/access-requests'],
            reports: ['/practitioner/reports'],
            audit: ['/practitioner/audit'],
            organizations: ['/practitioner/organizations']
        };

        if (routes[route]) {
            this.router.navigate(routes[route]);
        }
    }

    onOpenDossier(npi: string): void {
        this.auditService.logAction('open_patient_file', { npi });
        this.router.navigate(['/patient', npi, 'overview']);
    }

    onNewConsultation(): void {
        this.router.navigate(['/practitioner/consultation/new']);
    }

    onSearchPatient(event: Event): void {
        const query = (event.target as HTMLInputElement).value;
        if (query.length >= 2) {
            this.router.navigate(['/practitioner/patients/search'], {
                queryParams: { q: query }
            });
        }
    }

    applyPatientFilter(): void {
        // Le computed signal s'occupe du filtrage automatiquement
    }

    async onAcceptAccess(request: AccessRequest, event: Event): Promise<void> {
        event.stopPropagation();

        try {
            await this.consentService.acceptAccessRequest(request.id);

            this.pendingAccessRequests.update(requests =>
                requests.filter(r => r.id !== request.id)
            );

            this.auditService.logAction('accept_access_request', {
                requestId: request.id,
                patientNpi: request.patientNpi
            });

        } catch (error) {
            console.error('Erreur acceptation:', error);
        }
    }

    async onDeclineAccess(request: AccessRequest, event: Event): Promise<void> {
        event.stopPropagation();

        const reason = prompt('Motif du refus (optionnel) :');
        if (reason === null) return;

        try {
            await this.consentService.declineAccessRequest(request.id, reason || undefined);

            this.pendingAccessRequests.update(requests =>
                requests.filter(r => r.id !== request.id)
            );

            this.auditService.logAction('decline_access_request', {
                requestId: request.id,
                patientNpi: request.patientNpi,
                reason
            });

        } catch (error) {
            console.error('Erreur refus:', error);
        }
    }
    switchOrganization(orgId: string): void {
        this.practitionerService.setActiveOrganization(orgId);
        this.loadDashboardData();
    }
}