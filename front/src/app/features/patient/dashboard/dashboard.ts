import { Component, OnInit, OnDestroy, inject, signal, HostListener, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, firstValueFrom } from 'rxjs';
import { TimeLinesComponent } from "./components/time-lines/time-lines";
import { Prescriptions } from "./components/prescriptions/prescriptions";
import { Examens } from "./components/examens/examens";
import { Allergies } from "./components/allergies/allergies";
import { Pathologies } from "./components/pathologies/pathologies";
import { Consentements } from "./components/consentements/consentements";
import { Profil } from "./components/profil/profil";
import { Contacts } from "./components/contacts/contacts";
import { ContactEdit } from "./components/contact-edit/contact-edit";
import { ProfilEdit } from "./components/profil-edit/profil-edit";
import { ActeView } from "./components/acte-view/acte-view";
import { NavIconPipe } from '../pipes/nav-icon-pipe';
import { NavLabelPipe } from '../pipes/nav-label-pipe';
import { AuthStore } from '../../../core/auth/auth.store';
import { DashboardService } from './services/dashboard.service';
import { MedicalService, DashboardSummaryDTO, AlertDTO, AccessLogDTO, PendingAccessRequestDTO } from '../services/medical.service';

export type ViewKey =
    | 'dashboard' | 'historique' | 'prescriptions'
    | 'examens' | 'allergies' | 'pathologies' | 'consentements'
    | 'profil' | 'contacts' | 'contact-edit' | 'profil-edit' | 'acte';

export interface NavItem {
    key: ViewKey;
    label: string;
    icon: string;
}

export interface HealthProfile {
    nom: string;
    prenom: string;
    age: number;
    dateNaissance: string;
    sexe: string;
    groupeSanguin: string;
    rhesus: string;
    poids: number;
    taille: number;
    imc: number;
    statutImc: string;
    allergiePrincipale: string;
    pathologiesChroni: string[];
    dernierePrise: string;
    avatar: string;
    nin: string;
}

export interface AlerteItem {
    type: 'prescription' | 'urgence' | 'examen' | 'info';
    message: string;
    date: string;
    auteur?: string;
}

export interface AccesRecent {
    qui: string;
    role: string;
    date: string;
    icon: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, TimeLinesComponent, Prescriptions, Examens, Allergies, Pathologies, Consentements, Profil, Contacts, ContactEdit, ProfilEdit, ActeView, NavIconPipe, NavLabelPipe],
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, OnDestroy {

    // ── Injections ────────────────────────────────────────────────────────────
    private router = inject(Router);
    private dashboardService = inject(DashboardService);
    private medicalService = inject(MedicalService);

    // ── UI state ─────────────────────────────────────────────────────────────
    view = signal<ViewKey>('dashboard');
    profileMenuOpen = false;
    sidebarOpen = false;
    isMobile = false;
    alertPanelOpen = false;
    authStore = AuthStore;

    // ── Données dynamiques ────────────────────────────────────────────────────
    loading = signal(true);
    dashboardData = signal<DashboardSummaryDTO | null>(null);
    alertes = signal<AlertDTO[]>([]);
    accesRecents = signal<AccessLogDTO[]>([]);

    // ── Navigation ────────────────────────────────────────────────────────────
    readonly navItems: NavItem[] = [
        { key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
        { key: 'historique', label: 'Historique Médical', icon: 'history' },
        { key: 'prescriptions', label: 'Prescriptions', icon: 'medication' },
        { key: 'examens', label: 'Examens', icon: 'biotech' },
        { key: 'allergies', label: 'Allergies', icon: 'allergy' },
        { key: 'pathologies', label: 'Pathologies', icon: 'stethoscope' },
        { key: 'consentements', label: 'Consentements', icon: 'verified_user' },
        { key: 'profil', label: 'Mon Profil', icon: 'person' },
    ];

    // ── Profil patient construit depuis les données utilisateur + DMN ───────
    patient = computed<HealthProfile>(() => {
        const user = this.authStore.user();
        const data = this.dashboardData();
        const identity = user?.identity;

        const nom = identity?.lastName?.toUpperCase() || '—';
        const prenom = identity?.firstName || '—';

        let age = 0;
        let dateNaissance = '—';
        if (identity?.birthDate) {
            const bd = new Date(identity.birthDate);
            dateNaissance = bd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
            age = Math.floor((Date.now() - bd.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        }

        const sexe = identity?.gender === 'male' ? 'Masculin' : identity?.gender === 'female' ? 'Féminin' : '—';
        const nin = identity?.npi?.toString() || '—';
        const avatar = identity?.photoPath || 'https://i.pravatar.cc/150?img=68';
        const groupeSanguin = data?.profile?.blood_type || '—';
        const rhesus = data?.profile?.rhesus_factor || '';

        return {
            nom,
            prenom,
            age,
            dateNaissance,
            sexe,
            groupeSanguin,
            rhesus,
            poids: 0,
            taille: 0,
            imc: 0,
            statutImc: '—',
            allergiePrincipale: '—',
            pathologiesChroni: [],
            dernierePrise: data?.profile?.date_creation
                ? new Date(data.profile.date_creation).toLocaleDateString('fr-FR')
                : '—',
            avatar,
            nin,
        };
    });

    get imc(): number { return this.patient().imc; }

    get imcClass(): string {
        const i = this.imc;
        if (i < 18.5) return 'text-blue-600';
        if (i < 25) return 'text-emerald-600';
        if (i < 30) return 'text-amber-600';
        return 'text-red-600';
    }

    alertCount = computed(() => this.alertes().length);
    pendingRequests = signal<PendingAccessRequestDTO[]>([]);
    pendingRequestsCount = computed(() => this.pendingRequests().length);

    quickStats = computed(() => {
        const stats = this.dashboardData()?.stats;
        return [
            { label: 'Examens', value: String(stats?.examens_count ?? 0), icon: 'biotech', color: 'bg-blue-50 text-blue-600', route: 'examens' },
            { label: 'Prescriptions', value: String(stats?.prescriptions_count ?? 0), icon: 'medication', color: 'bg-violet-50 text-violet-600', route: 'prescriptions' },
            { label: 'Allergies', value: String(stats?.allergies_count ?? 0), icon: 'allergy', color: 'bg-red-50 text-red-600', route: 'allergies' },
            { label: 'Consentements', value: String(stats?.consentements_count ?? 0), icon: 'verified_user', color: 'bg-emerald-50 text-emerald-600', route: 'consentements' },
        ];
    });

    private sub!: Subscription;

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    ngOnInit(): void {
        this.checkScreenSize();
        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    private loadDashboardData(): void {
        this.loading.set(true);

        this.dashboardService.loadPendingRequests().subscribe(requests => {
            this.pendingRequests.set(requests);
        });

        this.sub = this.dashboardService.loadSummary().subscribe({
            next: (data) => {
                this.dashboardData.set(data);
                this.alertes.set(data.alerts ?? []);
                this.accesRecents.set(data.access_logs ?? []);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            },
        });
    }

    async respondToRequest(requestId: string, action: 'accept' | 'decline', perimeter?: string, duration?: string): Promise<void> {
        await firstValueFrom(this.dashboardService.respondToRequest(requestId, action, perimeter, duration));
    }

    @HostListener('window:resize')
    onResize(): void { this.checkScreenSize(); }

    private checkScreenSize(): void {
        this.isMobile = window.innerWidth < 1024;
        if (!this.isMobile) this.sidebarOpen = false;
    }

    // ── Navigation ───────────────────────────────────────────────────────────
    setView(key: string): void {
        this.view.set(key as ViewKey);
        this.sidebarOpen = false;
        this.profileMenuOpen = false;
    }

    toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
    toggleProfileMenu(): void { this.profileMenuOpen = !this.profileMenuOpen; }
    toggleAlertPanel(): void { this.alertPanelOpen = !this.alertPanelOpen; }

    onSearchWithinDossier(event: Event): void { }

    openHelp(): void { window.open('https://dmn.benin/help', '_blank'); }
    openSettings(): void { }

    onLogout(): void {
        this.authStore.clearAuth();
        this.router.navigate(['/auth/login']);
    }

    alertBadge(type: string): string {
        return {
            prescription: 'bg-violet-100 text-violet-700 border-violet-200',
            urgence: 'bg-red-100 text-red-700 border-red-200',
            examen: 'bg-blue-100 text-blue-700 border-blue-200',
            info: 'bg-slate-100 text-slate-600 border-slate-200',
        }[type] || 'bg-slate-100 text-slate-600';
    }

    alertIcon(type: string): string {
        return {
            prescription: 'medication',
            urgence: 'emergency',
            examen: 'biotech',
            info: 'info',
        }[type] || 'info';
    }
}