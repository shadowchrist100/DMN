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
    now = new Date();
    consentDateDebut = '15/10/' + (this.now.getFullYear() - 1);
    consentDateFin = '15/10/' + this.now.getFullYear();
    lastAccessDate = this.now.toLocaleDateString('fr-FR') + ' à ' + this.now.getHours().toString().padStart(2, '0') + ':' + this.now.getMinutes().toString().padStart(2, '0');
    currentYear = this.now.getFullYear();

    constructor() {
        this.route.params.subscribe(params => {
            const npi = params['npi'] || '';
            this.patientNpi.set(npi);
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
        try {
            const [profile, authUser] = await Promise.all([
                firstValueFrom(this.medicalPrac.getPatientProfile(npi)),
                this.authService.getUser(npi).catch(() => null),
            ]);
            this.patientProfile.set(profile);
            if (authUser) {
                this.patientPhoto.set(authUser.photo_url);
            }
        } catch (e) {
            console.error('Failed to load patient profile', e);
        } finally {
            this.loadingProfile.set(false);
        }
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
