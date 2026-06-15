import { Component, OnInit, OnDestroy, inject, signal, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TimeLinesComponent } from "./components/time-lines/time-lines";
import { Prescriptions } from "./components/prescriptions/prescriptions";
import { Examens } from "./components/examens/examens";
import { Allergies } from "./components/allergies/allergies";
import { Consentements } from "./components/consentements/consentements";
import { Profil } from "./components/profil/profil";
import { Contacts } from "./components/contacts/contacts";
import { ContactEdit } from "./components/contact-edit/contact-edit";
import { ProfilEdit } from "./components/profil-edit/profil-edit";
import { ActeView } from "./components/acte-view/acte-view";
import { NavIconPipe } from '../pipes/nav-icon-pipe';
import { NavLabelPipe } from '../pipes/nav-label-pipe';

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
    poids: number;   // kg
    taille: number;   // cm
    imc: number;
    statutImc: string;
    allergiePrincipale: string;
    pathologiesChroni: string[];
    dernierePrise: string;
    avatar: string;
    nin: string;   // Numéro d'identification national
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
    imports: [CommonModule, TimeLinesComponent, Prescriptions, Examens, Allergies, Consentements, Profil, Contacts, ContactEdit, ProfilEdit, ActeView, NavIconPipe, NavLabelPipe],
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, OnDestroy {

    // ── UI state ─────────────────────────────────────────────────────────────
    view = signal<ViewKey>('dashboard');
    profileMenuOpen = false;
    sidebarOpen = false;
    isMobile = false;
    alertPanelOpen = false;
    alertCount = 3;

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

    // ── Données patient (à remplacer par un service) ──────────────────────────
    patient: HealthProfile = {
        nom: 'AGOSSOU',
        prenom: 'Kofi Emmanuel',
        age: 47,
        dateNaissance: '12 Mars 1977',
        sexe: 'Masculin',
        groupeSanguin: 'O',
        rhesus: '+',
        poids: 82,
        taille: 178,
        imc: 25.9,
        statutImc: 'Surpoids léger',
        allergiePrincipale: 'Pénicilline G',
        pathologiesChroni: ['Hypertension artérielle', 'Hypercholestérolémie'],
        dernierePrise: '14 Septembre 2023',
        avatar: 'https://i.pravatar.cc/150?img=68',
        nin: 'BJ-2024-00047821',
    };

    get imc(): number { return this.patient.imc; }
    get imcClass(): string {
        const i = this.imc;
        if (i < 18.5) return 'text-blue-600';
        if (i < 25) return 'text-emerald-600';
        if (i < 30) return 'text-amber-600';
        return 'text-red-600';
    }

    alertes: AlerteItem[] = [
        {
            type: 'prescription',
            message: 'Nouvelle prescription émise : Amlodipine 5 mg — 1 cp/jour pendant 30 jours',
            date: '03/06/2026',
            auteur: 'Dr. Kouandété Koffi'
        },
        {
            type: 'urgence',
            message: 'Accès au dossier via protocole d\'urgence — Urgences CHU Cotonou',
            date: '28/05/2026',
            auteur: 'Dr. F. Adjovi (garde)'
        },
        {
            type: 'examen',
            message: 'Résultat d\'examen disponible : Bilan lipidique complet — LDL à 1,62 g/L',
            date: '24/05/2026',
            auteur: 'Labo Central Cotonou'
        },
        {
            type: 'info',
            message: 'Consentement de partage de dossier renouvelé pour Dr. Aïssatou Bello',
            date: '15/05/2026',
            auteur: 'Patient'
        },
    ];

    accesRecents: AccesRecent[] = [
        { qui: 'Dr. Kouandété Koffi', role: 'Cardiologue', date: 'Aujourd\'hui 10:45', icon: 'cardiology' },
        { qui: 'Dr. Aïssatou Bello', role: 'Médecine Interne', date: 'Hier 14:20', icon: 'stethoscope' },
        { qui: 'Labo Central Cotonou', role: 'Laboratoire', date: '24/05/2024', icon: 'biotech' },
    ];

    quickStats = [
        { label: 'Examens', value: '11', icon: 'biotech', color: 'bg-blue-50 text-blue-600', route: 'examens' },
        { label: 'Prescriptions', value: '4', icon: 'medication', color: 'bg-violet-50 text-violet-600', route: 'prescriptions' },
        { label: 'Allergies', value: '4', icon: 'allergy', color: 'bg-red-50 text-red-600', route: 'allergies' },
        { label: 'Consentements', value: '2', icon: 'verified_user', color: 'bg-emerald-50 text-emerald-600', route: 'consentements' },
    ];

    private routeSub!: Subscription;
    private router = inject(Router);

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    ngOnInit(): void {
        this.checkScreenSize();
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
    }

    @HostListener('window:resize')
    onResize(): void { this.checkScreenSize(); }

    private checkScreenSize(): void {
        this.isMobile = window.innerWidth < 1024;
        if (!this.isMobile) this.sidebarOpen = false;
    }

    // ── Actions ───────────────────────────────────────────────────────────────
    setView(key: String): void {
        this.view.set(key as ViewKey);
        this.sidebarOpen = false;
        this.profileMenuOpen = false;
    }

    toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
    toggleProfileMenu(): void { this.profileMenuOpen = !this.profileMenuOpen; }
    toggleAlertPanel(): void { this.alertPanelOpen = !this.alertPanelOpen; }

    onSearchWithinDossier(event: Event): void {
        // const query = (event.target as HTMLInputElement).value;
    }

    openHelp(): void { window.open('https://dmn.benin/help', '_blank'); }
    openSettings(): void { /* router.navigate(['/parametres']) */ }
    onLogout(): void { /* userService.logout() */ }

    alertBadge(type: AlerteItem['type']): string {
        return {
            prescription: 'bg-violet-100 text-violet-700 border-violet-200',
            urgence: 'bg-red-100 text-red-700 border-red-200',
            examen: 'bg-blue-100 text-blue-700 border-blue-200',
            info: 'bg-slate-100 text-slate-600 border-slate-200',
        }[type];
    }

    alertIcon(type: AlerteItem['type']): string {
        return {
            prescription: 'medication',
            urgence: 'emergency',
            examen: 'biotech',
            info: 'info',
        }[type];
    }
}