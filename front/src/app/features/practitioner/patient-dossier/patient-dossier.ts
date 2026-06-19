import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth.store';
import { AuthService } from '../../../core/auth/auth-service';
import { MedicalPractitionerService, PatientProfileDTO } from '../services/medical-practitioner.service';
import { Historiques } from './historiques/historiques';
import { Examens } from './examens/examens';
import { Traitements } from './traitements/traitements';
import { Pathologies } from './pathologies/pathologies';
import { Vaccins } from './vaccins/vaccins';
import { Documents } from './documents/documents';

export type TabId = 'overview' | 'historiques' | 'analyses' | 'traitements' | 'pathologies' | 'vaccins' | 'documents';

@Component({
    selector: 'app-patient-dossier',
    imports: [CommonModule, Historiques, Examens, Traitements, Pathologies, Vaccins, Documents],
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
            const profile = await firstValueFrom(this.medicalPrac.getPatientProfile(npi));
            this.patientProfile.set(profile);
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
        { id: 'traitements', label: 'Traitements', icon: 'medication' },
        { id: 'pathologies', label: 'Pathologies', icon: 'medical_information' },
        { id: 'vaccins', label: 'Vaccins', icon: 'vaccines' },
        { id: 'documents', label: 'Documents', icon: 'description' },
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
