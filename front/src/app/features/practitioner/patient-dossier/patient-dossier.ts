import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth.store';
import { AuthService } from '../../../core/auth/auth-service';
import { MedicalPractitionerService, PatientProfileDTO } from '../services/medical-practitioner.service';
import { UserDetailResponse } from '../../../core/auth/auth-service';
import { Historiques } from './historiques/historiques';
import { Examens } from './examens/examens';
import { Pathologies } from './pathologies/pathologies';
import { Vaccins } from './vaccins/vaccins';
import { Prescriptions } from './prescriptions/prescriptions';
import { NouvelActeMedical } from './nouvel-acte-medical/nouvel-acte-medical';

export type TabId = 'overview' | 'historiques' | 'analyses' | 'prescriptions' | 'pathologies' | 'vaccins';

interface AccessStatus {
    has_access: boolean;
    status: 'active' | 'expired' | 'none';
    message: string;
    granted_at?: string | null;
    expire_at?: string | null;
}

@Component({
    selector: 'app-patient-dossier',
    imports: [CommonModule, Historiques, Examens, Pathologies, Vaccins, Prescriptions, NouvelActeMedical],
    templateUrl: './patient-dossier.html',
    styleUrl: './patient-dossier.css',
})
export class PatientDossier {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);
    private medicalPrac = inject(MedicalPractitionerService);
    protected authStore = AuthStore;
    selectedTab = signal<TabId>('overview');
    showNewActe = signal(false);
    patientNpi = signal('');
    patientProfile = signal<PatientProfileDTO | null>(null);
    patientPhoto = signal<string | null>(null);
    loadingProfile = signal(false);
    accessStatus = signal<AccessStatus | null>(null);
    errorMessage = signal('');

    currentYear = new Date().getFullYear();

    constructor() {
        this.route.params.subscribe(params => {
            const npi = params['npi'] || '';
            this.patientNpi.set(npi);
            this.errorMessage.set('');
            if (npi) {
                this.loadProfile(npi);
            }
        });
        this.route.queryParams.subscribe(params => {
            if (params['newActe'] === 'true') {
                this.showNewActe.set(true);
            }
        });
    }

    private async loadProfile(npi: string) {
        this.loadingProfile.set(true);
        this.errorMessage.set('');
        const userId = this.authStore.userId();
        try {
            const [accessStatus, profile, authUser] = await Promise.all([
                userId ? firstValueFrom(this.medicalPrac.getAccessStatus(userId, npi)).catch(() => null) : Promise.resolve(null),
                firstValueFrom(this.medicalPrac.getPatientProfile(npi)).catch((e) => {
                    if (e.status === 403) return null;
                    throw e;
                }),
                this.authService.getUser(npi).catch(() => null),
            ]);
            if (accessStatus) {
                this.accessStatus.set(accessStatus);
            }
            if (profile) {
                this.patientProfile.set(profile);
            } else if (accessStatus && !accessStatus.has_access) {
                this.errorMessage.set(accessStatus.message);
            }
            if (authUser) {
                this.patientPhoto.set(authUser.photo_url);
            }
        } catch (e) {
            console.error('Failed to load patient profile', e);
            this.errorMessage.set("Erreur lors du chargement du dossier patient.");
        } finally {
            this.loadingProfile.set(false);
        }
    }

    get hasAccess(): boolean {
        return this.accessStatus()?.has_access ?? !!this.patientProfile();
    }

    get accessStatusText(): string {
        const s = this.accessStatus();
        if (!s) return '';
        return s.message;
    }

    get accessGrantedAt(): string {
        const s = this.accessStatus();
        if (!s?.granted_at) return '';
        const d = new Date(s.granted_at);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    get accessExpireAt(): string {
        const s = this.accessStatus();
        if (!s?.expire_at) return '';
        const d = new Date(s.expire_at);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    tabs: { id: TabId; label: string; icon: string; badge?: { text: string; class: string } }[] = [
        { id: 'overview', label: "Vue d'ensemble", icon: 'timeline' },
        { id: 'historiques', label: 'Historiques', icon: 'stethoscope' },
        { id: 'analyses', label: 'Analyses', icon: 'biotech' },
        { id: 'prescriptions', label: 'Prescriptions', icon: 'description' },
        { id: 'pathologies', label: 'Pathologies', icon: 'medical_information' },
        { id: 'vaccins', label: 'Vaccins', icon: 'vaccines' },
    ];

    selectTab(tabId: TabId): void {
        this.selectedTab.set(tabId);
    }

    openNewActe(): void {
        this.showNewActe.set(true);
    }

    closeNewActe(): void {
        this.showNewActe.set(false);
    }

    onActeSaved(acteId: string): void {
        this.showNewActe.set(false);
        this.selectedTab.set('overview');
    }

    onLogout(): void {
        this.authService.logout().catch(() => { });
        this.authStore.clearAuth();
        this.router.navigate(['/auth/login']);
    }

    navigateTo(route: string): void {
        const routes: Record<string, string[]> = {
            dashboard: ['/practitioner/dashboard'],
            patients: ['/practitioner/patients'],
            consents: ['/practitioner/consents'],
            organizations: ['/practitioner/organizations'],
        };
        if (routes[route]) {
            this.router.navigate(routes[route]);
        }
    }

    searchPatient(query: string): void {
        const q = query.trim();
        if (q.length >= 2) {
            this.router.navigate(['/practitioner/patients'], { queryParams: { q } });
        } else {
            this.router.navigate(['/practitioner/patients']);
        }
    }
}
