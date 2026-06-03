import {
    Component, OnInit, OnDestroy,
    signal, computed, Signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
    Prescription,
    PrescriptionType,
    PrescriptionStatut,
    PrescriptionFilter,
    PrescriptionPeriod,
    MOCK_PRESCRIPTIONS,
} from './prescription.model';

// ─── Constantes de mapping ──────────────────────────────────────────────────

const TYPE_ICON: Record<PrescriptionType, string> = {
    medicament: '💊',
    analyse: '🧪',
    biologie: '🔬',
    radiographie: '🩻',
    echographie: '📡',
    scanner: '🖥️',
    irm: '🧲',
    autre: '📋',
};

const TYPE_LABEL: Record<PrescriptionType, string> = {
    medicament: 'Médicament',
    analyse: 'Analyse',
    biologie: 'Biologie',
    radiographie: 'Radiographie',
    echographie: 'Échographie',
    scanner: 'Scanner',
    irm: 'IRM',
    autre: 'Autre',
};

const TYPE_COLOR: Record<PrescriptionType, string> = {
    medicament: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    analyse: 'bg-purple-50 text-purple-700 border-purple-100',
    biologie: 'bg-violet-50 text-violet-700 border-violet-100',
    radiographie: 'bg-sky-50 text-sky-700 border-sky-100',
    echographie: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    scanner: 'bg-teal-50 text-teal-700 border-teal-100',
    irm: 'bg-blue-50 text-blue-700 border-blue-100',
    autre: 'bg-slate-50 text-slate-600 border-slate-200',
};

const TYPE_ICON_BG: Record<PrescriptionType, string> = {
    medicament: 'bg-indigo-100 text-indigo-600',
    analyse: 'bg-purple-100 text-purple-600',
    biologie: 'bg-violet-100 text-violet-600',
    radiographie: 'bg-sky-100 text-sky-600',
    echographie: 'bg-cyan-100 text-cyan-600',
    scanner: 'bg-teal-100 text-teal-600',
    irm: 'bg-blue-100 text-blue-600',
    autre: 'bg-slate-100 text-slate-500',
};

const STATUT_LABEL: Record<PrescriptionStatut, string> = {
    actif: 'Actif',
    termine: 'Terminé',
    annule: 'Annulé',
    en_attente: 'En attente',
    suspendu: 'Suspendu',
};

const STATUT_CLASS: Record<PrescriptionStatut, string> = {
    actif: 'bg-green-100 text-green-700 border-green-200',
    termine: 'bg-slate-100 text-slate-600 border-slate-200',
    annule: 'bg-red-50 text-red-600 border-red-100',
    en_attente: 'bg-amber-50 text-amber-700 border-amber-100',
    suspendu: 'bg-orange-50 text-orange-700 border-orange-100',
};

const STATUT_DOT: Record<PrescriptionStatut, string> = {
    actif: 'bg-green-500',
    termine: 'bg-slate-400',
    annule: 'bg-red-500',
    en_attente: 'bg-amber-400',
    suspendu: 'bg-orange-400',
};

// ─── Composant ──────────────────────────────────────────────────────────────

@Component({
    selector: 'app-prescriptions',
    standalone: true,
    imports: [RouterLink, DatePipe, SlicePipe, FormsModule],
    templateUrl: './prescriptions.html',
})
export class Prescriptions implements OnInit, OnDestroy {

    // ── Signaux d'état ──────────────────────────────────────────────────
    loading = signal<boolean>(true);
    isExporting = signal<boolean>(false);
    expandedCard = signal<string | null>(null);
    detailModal = signal<Prescription | null>(null);

    // ── Données ─────────────────────────────────────────────────────────
    allPrescriptions = signal<Prescription[]>([]);
    filtered = signal<Prescription[]>([]);

    // ── Filtres ─────────────────────────────────────────────────────────
    activeFilter = signal<PrescriptionFilter>('all');
    activePeriod = signal<PrescriptionPeriod>('all');
    activeTypes = signal<PrescriptionType[]>([]);
    searchTerm = '';
    searchValue = signal<string>('');

    // ── Pagination historique ────────────────────────────────────────────
    historyPage = signal<number>(1);
    historyPageSize = 5;

    // ── Notification ─────────────────────────────────────────────────────
    notification = signal<{ type: 'success' | 'error' | 'warning'; msg: string } | null>(null);
    private notifTimeout?: ReturnType<typeof setTimeout>;

    // ── Divers ───────────────────────────────────────────────────────────
    readonly currentYear = new Date().getFullYear();
    readonly filterOptions: { value: PrescriptionFilter; label: string }[] = [
        { value: 'all', label: 'Tous' },
        { value: 'actif', label: 'Actifs' },
        { value: 'en_attente', label: 'En attente' },
        { value: 'termine', label: 'Terminés' },
        { value: 'annule', label: 'Annulés' },
        { value: 'suspendu', label: 'Suspendus' },
    ];
    readonly typeOptions: { value: PrescriptionType; label: string; icon: string }[] = [
        { value: 'medicament', label: 'Médicaments', icon: '💊' },
        { value: 'analyse', label: 'Analyses', icon: '🧪' },
        { value: 'biologie', label: 'Biologie', icon: '🔬' },
        { value: 'radiographie', label: 'Radiographies', icon: '🩻' },
        { value: 'echographie', label: 'Échographies', icon: '📡' },
        { value: 'scanner', label: 'Scanners / IRM', icon: '🖥️' },
    ];

    private searchSubject = new Subject<string>();
    private searchSub!: Subscription;

    // ── Signaux calculés ────────────────────────────────────────────────

    /** Prescriptions actives ou en attente → affichées en bento cards */
    activePrescriptions: Signal<Prescription[]> = computed(() =>
        this.filtered().filter(p => p.statut === 'actif' || p.statut === 'en_attente'),
    );

    /** Prescriptions historiques → affichées dans le tableau */
    historyPrescriptions: Signal<Prescription[]> = computed(() =>
        this.filtered().filter(p => p.statut !== 'actif' && p.statut !== 'en_attente'),
    );

    /** Page courante de l'historique */
    pagedHistory: Signal<Prescription[]> = computed(() => {
        const start = (this.historyPage() - 1) * this.historyPageSize;
        return this.historyPrescriptions().slice(start, start + this.historyPageSize);
    });

    totalHistoryPages: Signal<number> = computed(() =>
        Math.ceil(this.historyPrescriptions().length / this.historyPageSize),
    );

    totalCount: Signal<number> = computed(() => this.allPrescriptions().length);
    activeCount: Signal<number> = computed(() =>
        this.allPrescriptions().filter(p => p.statut === 'actif').length,
    );
    waitingCount: Signal<number> = computed(() =>
        this.allPrescriptions().filter(p => p.statut === 'en_attente').length,
    );

    // ─────────────────────────────────────────────────────────────────────

    ngOnInit(): void {
        this.searchSub = this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(v => { this.searchValue.set(v); this.applyFilters(); });

        setTimeout(() => {
            this.allPrescriptions.set(MOCK_PRESCRIPTIONS);
            this.applyFilters();
            this.loading.set(false);
        }, 500);
    }

    ngOnDestroy(): void {
        this.searchSub?.unsubscribe();
        if (this.notifTimeout) clearTimeout(this.notifTimeout);
    }

    // ── Filtres ──────────────────────────────────────────────────────────

    setFilter(f: PrescriptionFilter): void {
        this.activeFilter.set(f);
        this.historyPage.set(1);
        this.applyFilters();
    }

    setPeriod(p: PrescriptionPeriod): void {
        this.activePeriod.set(p);
        this.applyFilters();
    }

    toggleType(type: PrescriptionType): void {
        this.activeTypes.update(types =>
            types.includes(type) ? types.filter(t => t !== type) : [...types, type],
        );
        this.applyFilters();
    }

    onSearchChange(): void {
        this.searchSubject.next(this.searchTerm);
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.searchValue.set('');
        this.applyFilters();
    }

    applyFilters(): void {
        let result = [...this.allPrescriptions()];

        // Statut
        const f = this.activeFilter();
        if (f !== 'all') result = result.filter(p => p.statut === f);

        // Type
        const types = this.activeTypes();
        if (types.length) result = result.filter(p => types.includes(p.type));

        // Période
        const period = this.activePeriod();
        if (period !== 'all') {
            const now = new Date();
            const start = period === '6months'
                ? new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
                : new Date(now.getFullYear(), 0, 1);
            result = result.filter(p => p.date_prescription && new Date(p.date_prescription) >= start);
        }

        // Recherche
        const term = this.searchValue().toLowerCase().trim();
        if (term) {
            result = result.filter(p =>
                p.libelle.toLowerCase().includes(term) ||
                p.prescripteur?.toLowerCase().includes(term) ||
                p.forme_galenique?.toLowerCase().includes(term) ||
                p.code_substance_code?.toLowerCase().includes(term) ||
                p.posologie_texte?.toLowerCase().includes(term) ||
                p.instructions_speciales?.toLowerCase().includes(term) ||
                TYPE_LABEL[p.type].toLowerCase().includes(term) ||
                STATUT_LABEL[p.statut].toLowerCase().includes(term),
            );
        }

        // Tri : en_attente + actif en premier, puis par date desc
        result.sort((a, b) => {
            const rank = (s: PrescriptionStatut) =>
                s === 'actif' ? 0 : s === 'en_attente' ? 1 : s === 'suspendu' ? 2 : 3;
            if (rank(a.statut) !== rank(b.statut)) return rank(a.statut) - rank(b.statut);
            return new Date(b.date_prescription ?? 0).getTime()
                - new Date(a.date_prescription ?? 0).getTime();
        });

        this.filtered.set(result);
        this.historyPage.set(1);
    }

    // ── Pagination ───────────────────────────────────────────────────────

    prevPage(): void {
        if (this.historyPage() > 1) this.historyPage.update(p => p - 1);
    }

    nextPage(): void {
        if (this.historyPage() < this.totalHistoryPages()) this.historyPage.update(p => p + 1);
    }

    pageNumbers(): number[] {
        return Array.from({ length: this.totalHistoryPages() }, (_, i) => i + 1);
    }

    // ── Actions ──────────────────────────────────────────────────────────

    toggleExpand(uuid: string): void {
        this.expandedCard.update(c => c === uuid ? null : uuid);
    }

    openDetail(p: Prescription): void {
        this.detailModal.set(p);
    }

    closeDetail(): void {
        this.detailModal.set(null);
    }

    downloadOrdonnance(p: Prescription): void {
        if (p.ordonnance_url) {
            window.open(p.ordonnance_url, '_blank');
        } else {
            this.notify('Aucun document disponible pour cette prescription', 'warning');
        }
    }

    async exportAll(): Promise<void> {
        this.isExporting.set(true);
        // Simulation export PDF
        await new Promise(r => setTimeout(r, 1500));
        this.isExporting.set(false);
        this.notify('Export PDF téléchargé avec succès', 'success');
    }

    // ── Helpers de style ─────────────────────────────────────────────────

    typeIcon(type: PrescriptionType): string { return TYPE_ICON[type] ?? '📋'; }
    typeLabel(type: PrescriptionType): string { return TYPE_LABEL[type] ?? type; }
    typeColor(type: PrescriptionType): string { return TYPE_COLOR[type] ?? ''; }
    typeIconBg(type: PrescriptionType): string { return TYPE_ICON_BG[type] ?? ''; }

    statutLabel(s: PrescriptionStatut): string { return STATUT_LABEL[s] ?? s; }
    statutClass(s: PrescriptionStatut): string { return STATUT_CLASS[s] ?? ''; }
    statutDot(s: PrescriptionStatut): string { return STATUT_DOT[s] ?? 'bg-slate-400'; }

    /** Durée en texte humain */
    dureeLabel(p: Prescription): string {
        if (!p.duree_jour) return '—';
        if (p.duree_jour < 7) return `${p.duree_jour} jour(s)`;
        if (p.duree_jour < 30) return `${Math.round(p.duree_jour / 7)} semaine(s)`;
        return `${Math.round(p.duree_jour / 30)} mois`;
    }

    /** Date de fin calculée */
    dateFin(p: Prescription): Date | null {
        if (p.date_fin) return new Date(p.date_fin);
        if (p.date_prescription && p.duree_jour) {
            const d = new Date(p.date_prescription);
            d.setDate(d.getDate() + p.duree_jour);
            return d;
        }
        return null;
    }

    /** Vrai si la prescription est expirée et toujours marquée actif */
    isExpired(p: Prescription): boolean {
        const fin = this.dateFin(p);
        return !!fin && fin < new Date() && p.statut === 'actif';
    }

    /** Jours restants avant la fin */
    joursRestants(p: Prescription): number | null {
        const fin = this.dateFin(p);
        if (!fin) return null;
        const diff = fin.getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    /** Référence lisible */
    refLabel(p: Prescription): string {
        return `ORD-${new Date(p.date_prescription ?? new Date()).getFullYear()}-${p.uuid.slice(-4).toUpperCase()}`;
    }

    isMedicament(p: Prescription): boolean {
        return p.type === 'medicament';
    }

    isExamen(p: Prescription): boolean {
        return ['analyse', 'biologie', 'radiographie', 'echographie', 'scanner', 'irm'].includes(p.type);
    }

    // ── Notifications ─────────────────────────────────────────────────────

    notify(msg: string, type: 'success' | 'error' | 'warning'): void {
        if (this.notifTimeout) clearTimeout(this.notifTimeout);
        this.notification.set({ msg, type });
        this.notifTimeout = setTimeout(() => this.notification.set(null), 4000);
    }

    dismissNotif(): void { this.notification.set(null); }
}