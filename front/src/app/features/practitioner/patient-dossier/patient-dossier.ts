import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { AuthService } from '../../../core/auth/auth-service';
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
    protected authStore = AuthStore;
    selectedTab = signal<TabId>('overview');
    showNewActe = signal(false);
    patientNpi = signal('');

    constructor() {
        this.route.params.subscribe(params => {
            this.patientNpi.set(params['npi'] || '');
        });
        this.route.queryParams.subscribe(params => {
            if (params['newActe'] === 'true') {
                this.showNewActe.set(true);
            }
        });
    }

    tabs: { id: TabId; label: string; icon: string; badge?: { text: string; class: string } }[] = [
        { id: 'overview', label: "Vue d'ensemble", icon: 'timeline' },
        { id: 'historiques', label: 'Historiques', icon: 'stethoscope', badge: { text: '24', class: 'bg-slate-100 text-slate-600' } },
        { id: 'analyses', label: 'Analyses', icon: 'biotech' },
        { id: 'traitements', label: 'Traitements', icon: 'medication', badge: { text: '3 actifs', class: 'bg-green-100 text-green-700' } },
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
