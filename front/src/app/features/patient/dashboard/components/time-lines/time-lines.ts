import {
    Component, OnInit, OnDestroy,
    signal, computed, Signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Modèle canonique (plus d'interfaces dupliquées ici) ─────────────────────
import {
    TimelineEvent,
    TimelineFilter,
    EventType,
    Priority,
    Measurement,
    Attachment,
    MOCK_TIMELINE,
} from './model.model';

import { TimelineService } from '../../../services/timelines.services';
import { ExportService } from '../../../services/export.service';

// ─── Interfaces internes au composant ──────────────────────────────────────

/** Compteur affiché dans le bandeau de stats */
export interface EventStat {
    type: EventType;
    label: string;
    icon: string;
    count: number;
}

/** Groupe d'événements par période (mois / année) */
export interface EventGroup {
    period: string;   // ex : "novembre 2025"
    sortKey: number;  // timestamp du premier jour du mois pour le tri
    count: number;
    events: TimelineEvent[];
}

// ─── Constantes de mapping (hors classe, calculées une seule fois) ──────────

const EVENT_ICON: Readonly<Record<EventType, string>> = {
    consultation: '🩺',
    prescription: '💊',
    lab_result: '🧪',
    vaccination: '💉',
    hospitalization: '🏥',
    alert: '⚠️',
};

const EVENT_ICON_BG: Readonly<Record<EventType, string>> = {
    consultation: 'bg-blue-50 border border-blue-100',
    prescription: 'bg-indigo-50 border border-indigo-100',
    lab_result: 'bg-purple-50 border border-purple-100',
    vaccination: 'bg-green-50 border border-green-100',
    hospitalization: 'bg-orange-50 border border-orange-100',
    alert: 'bg-red-50 border border-red-100',
};

const EVENT_DOT: Readonly<Record<EventType, string>> = {
    consultation: 'bg-blue-400',
    prescription: 'bg-indigo-400',
    lab_result: 'bg-purple-400',
    vaccination: 'bg-green-400',
    hospitalization: 'bg-orange-400',
    alert: 'bg-red-400',
};

const EVENT_TYPE_LABEL: Readonly<Record<EventType, string>> = {
    consultation: 'Consultation',
    prescription: 'Ordonnance',
    lab_result: 'Analyse',
    vaccination: 'Vaccination',
    hospitalization: 'Hospitalisation',
    alert: 'Alerte',
};

const TYPE_BADGE: Readonly<Record<EventType, string>> = {
    consultation: 'bg-blue-100 text-blue-700',
    prescription: 'bg-indigo-100 text-indigo-700',
    lab_result: 'bg-purple-100 text-purple-700',
    vaccination: 'bg-green-100 text-green-700',
    hospitalization: 'bg-orange-100 text-orange-700',
    alert: 'bg-red-100 text-red-700',
};

const PRIORITY_BAR: Readonly<Record<Priority, string>> = {
    critical: 'bg-gradient-to-r from-red-500 to-red-400',
    high: 'bg-gradient-to-r from-orange-400 to-amber-400',
    medium: 'bg-gradient-to-r from-[#1E40AF] to-[#0ea5e9]',
    low: 'bg-gradient-to-r from-green-400 to-teal-400',
};

const PRIORITY_BORDER: Readonly<Record<Priority, string>> = {
    critical: 'border-red-200',
    high: 'border-orange-200',
    medium: 'border-slate-200',
    low: 'border-slate-200',
};

const PRIORITY_BADGE: Readonly<Record<Priority, string>> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-slate-100 text-slate-600',
    low: 'bg-slate-100 text-slate-600',
};

const PRIORITY_LABEL: Readonly<Record<Priority, string>> = {
    critical: 'Critique',
    high: 'Urgent',
    medium: 'Moyen',
    low: 'Faible',
};

// ─── Types de DateRange ─────────────────────────────────────────────────────
type DateRange = TimelineFilter['dateRange'];

// ─── Composant ──────────────────────────────────────────────────────────────

@Component({
    selector: 'app-time-lines',
    templateUrl: './time-lines.html',
    styleUrls: ['./time-lines.css'],
    imports: [RouterLink, FormsModule, DatePipe]
})
export class TimeLinesComponent implements OnInit, OnDestroy {

    // ── Signaux d'état UI ───────────────────────────────────────────────
    loading = signal<boolean>(true);
    loadingMore = signal<boolean>(false);
    isExporting = signal<boolean>(false);
    showFilters = signal<boolean>(false);

    // ── Données ─────────────────────────────────────────────────────────
    patientId = signal<string>('');
    patientName = signal<string>('');
    userRole = signal<'patient' | 'practitioner' | 'admin'>('practitioner');

    /** Source de vérité : tous les événements du patient */
    events = signal<TimelineEvent[]>([]);
    /** Sous-ensemble filtré + trié, lu par le template */
    filteredEvents = signal<TimelineEvent[]>([]);

    // ── Pagination ──────────────────────────────────────────────────────
    private currentPage = 1;
    private pageSize = 10;
    hasMoreEvents = signal<boolean>(false);
    totalEvents = 0;

    // ── État des filtres (valeurs liées à ngModel) ──────────────────────
    searchTermValue = '';
    dateRangeValue: DateRange = 'all';
    eventTypeValue: EventType | null = null;
    priorityValue: Priority | 'all' = 'all';

    /** Signal dédié au type sélectionné (utilisé dans computed) */
    selectedEventType = signal<EventType | null>(null);
    /** Signal dédié à la priorité sélectionnée (utilisé dans computed) */
    selectedPriority = signal<Priority | 'all'>('all');

    // ── Consentement & notifications ────────────────────────────────────
    consentBanner = signal<{ grantedDate: Date; expiryDate: Date } | null>(null);
    notification = signal<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

    // ── Constante ───────────────────────────────────────────────────────
    readonly currentYear = new Date().getFullYear();

    // ── Signaux calculés ────────────────────────────────────────────────

    /** Nombre d'événements après filtrage */
    filteredCount: Signal<number> = computed(() => this.filteredEvents().length);

    /** Date la plus ancienne parmi les événements filtrés */
    earliestDate: Signal<Date> = computed(() => {
        const evts = this.filteredEvents();
        if (!evts.length) return new Date();
        return new Date(Math.min(...evts.map(e => new Date(e.date).getTime())));
    });

    /** Nombre de filtres actifs (badge sur le bouton Filtres) */
    activeFiltersCount: Signal<number> = computed(() => {
        let n = 0;
        if (this.dateRangeValue !== 'all') n++;
        if (this.selectedEventType() !== null) n++;
        if (this.selectedPriority() !== 'all') n++;
        if (this.searchTermValue.trim()) n++;
        return n;
    });

    /**
     * Statistiques par type pour le bandeau de compteurs cliquables.
     * Calculées sur la liste complète (events), pas filtrée.
     */
    eventStats: Signal<EventStat[]> = computed(() => {
        const evts = this.events();
        const types: { type: EventType; label: string; icon: string }[] = [
            { type: 'consultation', label: 'Consult.', icon: '🩺' },
            { type: 'prescription', label: 'Ordonnances', icon: '💊' },
            { type: 'lab_result', label: 'Analyses', icon: '🧪' },
            { type: 'vaccination', label: 'Vaccins', icon: '💉' },
            { type: 'hospitalization', label: 'Hospit.', icon: '🏥' },
            { type: 'alert', label: 'Alertes', icon: '⚠️' },
        ];
        return types
            .map(t => ({ ...t, count: evts.filter(e => e.type === t.type).length }))
            .filter(t => t.count > 0);
    });

    /**
     * Événements filtrés regroupés par mois, triés du plus récent au plus ancien.
     * Les événements confidentiels sont masqués pour le rôle 'patient'.
     */
    groupedEvents: Signal<EventGroup[]> = computed(() => {
        const role = this.userRole();
        const evts = this.filteredEvents().filter(
            e => !(e.isConfidential && role === 'patient'),
        );

        const map = new Map<string, TimelineEvent[]>();

        for (const event of evts) {
            const d = new Date(event.date);
            const key = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(event);
        }

        return Array.from(map.entries())
            .map(([period, events]) => ({
                period,
                sortKey: new Date(events[0].date).getTime(),
                count: events.length,
                events,
            }))
            .sort((a, b) => b.sortKey - a.sortKey);
    });

    /**
     * Nombre d'alertes/événements critiques dans la liste filtrée.
     * Utile pour afficher un badge d'avertissement dans le header.
     */
    criticalCount: Signal<number> = computed(() =>
        this.filteredEvents().filter(
            e => e.priority === 'critical' || e.type === 'alert',
        ).length,
    );

    // ── Abonnements ─────────────────────────────────────────────────────
    private routeSub!: Subscription;
    private searchSub!: Subscription;
    private readonly searchSubject = new Subject<string>();
    private notificationTimeout?: ReturnType<typeof setTimeout>;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly timelineService: TimelineService,
        private readonly exportService: ExportService,
    ) { }

    // ── Cycle de vie ────────────────────────────────────────────────────

    ngOnInit(): void {
        this.routeSub = this.route.params.subscribe(params => {
            this.patientId.set(params['patientId'] ?? '');
            this.loadPatientInfo();
            this.loadTimeline();
        });

        // Debounce de la recherche textuelle
        this.searchSub = this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(() => this.applyFilters());
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
        this.searchSub?.unsubscribe();
        if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    }

    // ── Chargement ──────────────────────────────────────────────────────

    private loadPatientInfo(): void {
        // TODO: remplacer par un appel PatientService.getById(this.patientId())
        this.patientName.set('KOFFI Jean-Baptiste');
    }

    private loadTimeline(): void {
        this.loading.set(true);
        this.currentPage = 1;

        // En production : this.timelineService.getTimeline(this.patientId(), this.buildFilter())
        setTimeout(() => {
            // Utilise directement MOCK_TIMELINE importé du modèle
            const data: TimelineEvent[] = MOCK_TIMELINE;
            this.events.set(data);
            this.totalEvents = data.length;
            this.applyFilters();
            this.loading.set(false);
        }, 600);
    }

    // ── Filtres ──────────────────────────────────────────────────────────

    /**
     * Construit un objet TimelineFilter depuis l'état courant du composant.
     * Peut être passé directement au service en production.
     */
    private buildFilter(): TimelineFilter {
        return {
            dateRange: this.dateRangeValue,
            searchTerm: this.searchTermValue.trim() || undefined,
            eventType: this.selectedEventType(),
            priorities: this.selectedPriority() !== 'all'
                ? [this.selectedPriority() as Priority]
                : [],
        };
    }

    applyFilters(): void {
        let result = [...this.events()];

        // 1. Filtre par période
        if (this.dateRangeValue !== 'all') {
            const now = new Date();
            const start = this.resolveStartDate(this.dateRangeValue, now);
            result = result.filter(e => new Date(e.date) >= start);
        }

        // 2. Filtre par type d'événement
        const type = this.selectedEventType();
        if (type) {
            result = result.filter(e => e.type === type);
        }

        // 3. Filtre par priorité
        const priority = this.selectedPriority();
        if (priority !== 'all') {
            result = result.filter(e => e.priority === priority);
        }

        // 4. Recherche textuelle (titre, description, facility, praticien, tags)
        const term = this.searchTermValue.trim().toLowerCase();
        if (term) {
            result = result.filter(e =>
                e.title.toLowerCase().includes(term) ||
                (e.description?.toLowerCase().includes(term) ?? false) ||
                e.facility.toLowerCase().includes(term) ||
                e.practitioner.name.toLowerCase().includes(term) ||
                (e.practitioner.specialty?.toLowerCase().includes(term) ?? false) ||
                (e.tags?.some(tag => tag.toLowerCase().includes(term)) ?? false),
            );
        }

        // 5. Tri : du plus récent au plus ancien
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        this.filteredEvents.set(result);
        this.hasMoreEvents.set(result.length > this.pageSize * this.currentPage);
    }

    /** Calcule la date de début selon la plage sélectionnée */
    private resolveStartDate(range: DateRange, now: Date): Date {
        const y = now.getFullYear();
        const m = now.getMonth();
        const d = now.getDate();
        switch (range) {
            case 'month': return new Date(y, m - 1, d);
            case '3months': return new Date(y, m - 3, d);
            case '6months': return new Date(y, m - 6, d);
            case 'year': return new Date(y - 1, m, d);
            default: return new Date(0);
        }
    }

    onSearchChange(): void {
        this.searchSubject.next(this.searchTermValue);
    }

    /** Synchronise ngModel → signal et relance le filtre */
    onEventTypeChange(): void {
        this.selectedEventType.set(this.eventTypeValue);
        this.applyFilters();
    }

    /** Synchronise ngModel → signal et relance le filtre */
    onPriorityChange(): void {
        this.selectedPriority.set(this.priorityValue);
        this.applyFilters();
    }

    clearSearch(): void {
        this.searchTermValue = '';
        this.applyFilters();
    }

    /**
     * Clic sur un compteur de type dans le bandeau :
     * sélectionne le type ou le désélectionne si déjà actif.
     */
    quickFilterByType(type: EventType): void {
        const next = this.selectedEventType() === type ? null : type;
        this.selectedEventType.set(next);
        this.eventTypeValue = next;
        this.applyFilters();
    }

    toggleFilters(): void {
        this.showFilters.update(v => !v);
    }

    resetAllFilters(): void {
        this.searchTermValue = '';
        this.dateRangeValue = 'all';
        this.eventTypeValue = null;
        this.priorityValue = 'all';
        this.selectedEventType.set(null);
        this.selectedPriority.set('all');
        this.applyFilters();
        this.showNotification('Filtres réinitialisés', 'success');
    }

    resetDateFilter(): void {
        this.dateRangeValue = 'all';
        this.applyFilters();
    }

    resetTypeFilter(): void {
        this.eventTypeValue = null;
        this.selectedEventType.set(null);
        this.applyFilters();
    }

    resetPriorityFilter(): void {
        this.priorityValue = 'all';
        this.selectedPriority.set('all');
        this.applyFilters();
    }

    loadMore(): void {
        if (this.loadingMore()) return;
        this.loadingMore.set(true);
        // TODO: appel API avec pagination
        setTimeout(() => {
            this.currentPage++;
            this.hasMoreEvents.set(false); // à adapter selon la réponse API
            this.loadingMore.set(false);
        }, 800);
    }

    // ── Helpers de style ─────────────────────────────────────────────────

    getEventIcon(type: EventType): string {
        return EVENT_ICON[type] ?? '📋';
    }

    getEventIconBg(type: EventType): string {
        return EVENT_ICON_BG[type] ?? 'bg-slate-50 border border-slate-100';
    }

    getEventDotClass(type: EventType): string {
        return EVENT_DOT[type] ?? 'bg-slate-400';
    }

    getCardBorderClass(priority: Priority): string {
        return PRIORITY_BORDER[priority] ?? 'border-slate-200';
    }

    getPriorityBarClass(priority: Priority): string {
        return PRIORITY_BAR[priority] ?? 'bg-slate-200';
    }

    getPriorityBadgeClass(priority: Priority): string {
        return PRIORITY_BADGE[priority] ?? 'bg-slate-100 text-slate-600';
    }

    getPriorityLabel(priority: Priority): string {
        return PRIORITY_LABEL[priority] ?? priority;
    }

    getTypeBadgeClass(type: EventType): string {
        return TYPE_BADGE[type] ?? 'bg-slate-100 text-slate-600';
    }

    getEventTypeLabel(type: EventType | null): string {
        if (!type) return '';
        return EVENT_TYPE_LABEL[type] ?? type;
    }

    getPeriodLabel(range: DateRange): string {
        const labels: Record<DateRange, string> = {
            all: 'Toute la période',
            month: 'Dernier mois',
            '3months': '3 derniers mois',
            '6months': '6 derniers mois',
            year: `Année ${this.currentYear}`,
        };
        return labels[range] ?? range;
    }

    // ── Helpers hospitalisation ──────────────────────────────────────────

    /**
     * Durée d'hospitalisation en jours.
     * Retourne null si la date de sortie est absente.
     */
    getHospitalizationDays(event: TimelineEvent): number | null {
        const h = event.hospitalization;
        if (!h?.dischargeDate) return null;
        const entry = new Date(h.entryDate).getTime();
        const discharge = new Date(h.dischargeDate).getTime();
        return Math.round((discharge - entry) / (1000 * 60 * 60 * 24));
    }

    // ── Helpers mesures / barres de progression ──────────────────────────

    /**
     * Retourne toutes les mesures à afficher pour un événement.
     * Priorité : measurements à plat → dérivé depuis labPanels.
     */
    getMeasurements(event: TimelineEvent): Measurement[] {
        if (event.measurements?.length) return event.measurements;
        if (event.labPanels?.length) {
            return event.labPanels.flatMap(p => p.measurements);
        }
        return [];
    }

    /**
     * Pourcentage pour la barre de progression.
     * Plage = [0 ; normalMax × 1.5], toujours entre 2 % et 100 %.
     */
    getMeasurePercent(m: Measurement): number {
        if (m.normalMax === undefined) {
            // Pas de plage : on affiche 50 % par défaut
            return 50;
        }
        const ceiling = m.normalMax * 1.5;
        return Math.min(Math.max((m.value / ceiling) * 100, 2), 100);
    }

    /** Couleur de la barre selon la position dans la plage normale */
    getMeasureBarClass(m: Measurement): string {
        if (m.normalMin === undefined || m.normalMax === undefined) return 'bg-slate-300';
        if (m.value < m.normalMin || m.value > m.normalMax) return 'bg-red-400';
        const ratio = (m.value - m.normalMin) / (m.normalMax - m.normalMin);
        return ratio < 0.2 || ratio > 0.8 ? 'bg-amber-400' : 'bg-green-400';
    }

    /** Couleur de la valeur chiffrée */
    getMeasureValueClass(m: Measurement): string {
        if (m.normalMin === undefined || m.normalMax === undefined) return 'text-slate-700';
        return (m.value < m.normalMin || m.value > m.normalMax)
            ? 'text-red-600'
            : 'text-green-700';
    }

    /** Fond du badge statut (check / warning) */
    getMeasureStatusBg(m: Measurement): string {
        if (m.normalMin === undefined || m.normalMax === undefined) return 'bg-slate-100';
        return (m.value >= m.normalMin && m.value <= m.normalMax)
            ? 'bg-green-100'
            : 'bg-red-100';
    }

    /** Icône Material du badge statut */
    getMeasureStatusIcon(m: Measurement): 'check' | 'warning' | 'remove' {
        if (m.normalMin === undefined || m.normalMax === undefined) return 'remove';
        return (m.value >= m.normalMin && m.value <= m.normalMax) ? 'check' : 'warning';
    }

    /** Vrai si au moins une mesure est hors plage normale */
    hasAbnormalMeasure(event: TimelineEvent): boolean {
        return this.getMeasurements(event).some(m =>
            m.normalMin !== undefined && m.normalMax !== undefined &&
            (m.value < m.normalMin || m.value > m.normalMax),
        );
    }

    // ── Actions utilisateur ──────────────────────────────────────────────

    onViewEventDetails(eventId: string): void {
        this.router.navigate(['/patient', this.patientId(), 'events', eventId]);
    }

    onEditEvent(eventId: string): void {
        if (this.userRole() !== 'practitioner') {
            this.showNotification('Seuls les praticiens peuvent modifier les événements', 'warning');
            return;
        }
        this.router.navigate(['/patient', this.patientId(), 'events', eventId, 'edit']);
    }

    onDeleteEvent(eventId: string): void {
        if (this.userRole() !== 'practitioner') return;
        if (!confirm('⚠️ Supprimer définitivement cet événement ?\nCette action est irréversible.')) return;

        this.events.update(evts => evts.filter(e => e.id !== eventId));
        this.totalEvents--;
        this.applyFilters();
        this.showNotification('Événement supprimé', 'success');
    }

    onShareEvent(eventId: string): void {
        const token = btoa(`${eventId}:${Date.now()}`).substring(0, 16);
        const shareUrl = `${window.location.origin}/share/${token}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => this.showNotification('Lien copié ! Valable 24 h.', 'success'))
            .catch(() => this.showNotification('Erreur lors de la copie', 'error'));
    }

    onAddNewEvent(): void {
        if (this.userRole() !== 'practitioner') {
            this.showNotification('Fonctionnalité réservée aux professionnels de santé', 'warning');
            return;
        }
        this.router.navigate(['/patient', this.patientId(), 'events', 'new']);
    }

    /** Ouvre l'ordonnance PDF (prescriptionUrl) ou navigue vers la page dédiée */
    viewPrescription(event: TimelineEvent): void {
        if (event.prescriptionUrl) {
            window.open(event.prescriptionUrl, '_blank');
        } else {
            this.router.navigate(['/patient', this.patientId(), 'events', event.id, 'prescription']);
        }
    }

    /** Ouvre le compte rendu (reportUrl ou crf pour hospitalisation) */
    viewReport(event: TimelineEvent): void {
        const url = event.reportUrl ?? event.hospitalization?.crf;
        if (url) {
            window.open(url, '_blank');
        } else {
            this.router.navigate(['/patient', this.patientId(), 'events', event.id, 'report']);
        }
    }

    /** Navigue vers la page détail des résultats d'analyses */
    viewLabResults(event: TimelineEvent): void {
        this.router.navigate(['/patient', this.patientId(), 'events', event.id, 'results']);
    }

    /** Ouvre ou signale une pièce jointe */
    openAttachment(attachment: Attachment): void {
        if (attachment.url) {
            window.open(attachment.url, '_blank');
        } else {
            this.showNotification('Pièce jointe non disponible', 'warning');
        }
    }

    // ── Export ───────────────────────────────────────────────────────────

    async exportTimeline(): Promise<void> {
        // if (this.isExporting() || !this.filteredEvents().length) return;

        // this.isExporting.set(true);
        // this.showNotification("Préparation de l'export…", 'success');

        // try {
        //     const filter: TimelineFilter = {
        //         ...this.buildFilter(),
        //         eventIds: this.filteredEvents().map(e => e.id),
        //     };

        //     const blob = await this.exportService
        //         .exportPatientTimeline(this.patientId(), 'pdf', filter)
        //         .toPromise();

        //     if (!blob) throw new Error('Blob vide');

        //     const url = URL.createObjectURL(blob);
        //     const filename = `DMN_Timeline_${this.patientName().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        //     const anchor = document.createElement('a');
        //     anchor.href = url;
        //     anchor.download = filename;
        //     document.body.appendChild(anchor);
        //     anchor.click();
        //     document.body.removeChild(anchor);
        //     URL.revokeObjectURL(url);

        //     this.showNotification('✅ Export téléchargé', 'success');
        // } catch (err) {
        //     console.error('[Timeline] Export error:', err);
        //     this.showNotification("❌ Échec de l'export. Veuillez réessayer.", 'error');
        // } finally {
        //     this.isExporting.set(false);
        // }
    }

    // ── Consentement ─────────────────────────────────────────────────────

    dismissConsentBanner(): void {
        this.consentBanner.set(null);
    }

    // ── Notifications ─────────────────────────────────────────────────────

    showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
        if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
        this.notification.set({ message, type });
        this.notificationTimeout = setTimeout(() => this.dismissNotification(), 4000);
    }

    dismissNotification(): void {
        this.notification.set(null);
    }
}
