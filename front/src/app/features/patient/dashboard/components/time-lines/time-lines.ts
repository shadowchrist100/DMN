import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, NgModule } from '@angular/core';
import { TimelineEvent, TimelineFilter, EventType } from '../../../models/timeline-event.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TimelineService } from '../../../services/timelines.services';
import { ExportService } from '../../../services/export.service';
import { DatePipe } from '@angular/common';
import { TimeLineEvents } from "../time-line-events/time-line-events";
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-time-lines',
    imports: [RouterLink, DatePipe, TimeLineEvents, FormsModule ],
    templateUrl: './time-lines.html',
    styleUrl: './time-lines.css',
})
export class TimeLines implements OnInit, OnDestroy {
    // État de la vue
    loading = true;
    loadingMore = false;
    isExporting = false;

    // Données
    patientId = '';
    patientName = '';
    userRole: 'patient' | 'practitioner' | 'admin' = 'practitioner';
    events: TimelineEvent[] = [];
    filteredEvents: TimelineEvent[] = [];

    // Pagination
    currentPage = 1;
    pageSize = 10;
    hasMoreEvents = false;
    totalEvents = 0;

    // Filtres
    filters: TimelineFilter = {
        dateRange: 'all',
        eventTypes: [],
        priorities: [],
        facilities: []
    };
    selectedEventType: EventType | null = null;
    searchSubject = new Subject<string>();

    // Consentement
    consentBanner: { grantedDate: Date; expiryDate: Date } | null = null;

    // Notifications
    notification: { type: 'success' | 'error' | 'warning'; message: string } | null = null;

    private routeSub!: Subscription;
    private searchSub!: Subscription;

    // Helper pour le template
    currentYear = new Date().getFullYear();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private timelineService: TimelineService,
        private exportService: ExportService,
        // private consentService: ConsentService
    ) { }

    get filteredCount(): number {
        return this.filteredEvents.length;
    }

    ngOnInit(): void {
        // Récupérer l'ID patient depuis la route
        this.routeSub = this.route.params.subscribe(params => {
            this.patientId = params['patientId'];
            this.loadPatientInfo();
            this.loadTimeline();
            this.checkConsent();
        });

        // Debounce pour la recherche
        this.searchSubject = new Subject<string>();
        this.searchSub = this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(term => {
            this.filters.searchTerm = term;
            this.applyFilters();
        });
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
        this.searchSub?.unsubscribe();
    }

    private loadPatientInfo(): void {
        // TODO: Appeler un service patient
        this.patientName = 'KOFFI Jean-Baptiste'; // Mock
    }

    private loadTimeline(): void {
        this.loading = true;

        // En prod: this.timelineService.getTimeline(this.patientId, this.filters)
        // Pour la démo, on utilise les mock data
        setTimeout(() => {
            this.events = this.timelineService.getMockTimeline();
            this.totalEvents = this.events.length;
            this.hasMoreEvents = false;
            this.applyFilters();
            this.loading = false;
        }, 600);
    }

    private checkConsent(): void {
        // Vérifier si un consentement actif existe pour cet accès
        // const consent = this.consentService.getActiveConsent(this.patientId);
        // if (consent && this.userRole === 'practitioner') {
        //     this.consentBanner = {
        //         grantedDate: consent.grantedAt,
        //         expiryDate: consent.expiresAt
        //     };
        // }
    }

    // ===== GESTION DES FILTRES =====

    applyFilters(): void {
        let filtered = [...this.events];

        // Filtre par période
        if (this.filters.dateRange !== 'all') {
            const now = new Date();
            let startDate: Date;

            switch (this.filters.dateRange) {
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    break;
                case '6months':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    break;
                default:
                    startDate = new Date(0);
            }

            filtered = filtered.filter(e => new Date(e.date) >= startDate);
        }

        // Filtre par type
        if (this.selectedEventType) {
            filtered = filtered.filter(e => e.type === this.selectedEventType);
        }

        // Filtre alertes uniquement
        if (this.filters.showOnlyAlerts) {
            filtered = filtered.filter(e =>
                e.priority === 'high' || e.priority === 'critical' || e.type === 'alert'
            );
        }

        // Recherche textuelle
        if (this.filters.searchTerm) {
            const term = this.filters.searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(term) ||
                e.description?.toLowerCase().includes(term) ||
                e.facility.toLowerCase().includes(term) ||
                e.practitioner.name.toLowerCase().includes(term)
            );
        }

        // Trier par date décroissante
        this.filteredEvents = filtered.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Mettre à jour la pagination
        this.hasMoreEvents = this.filteredEvents.length > this.pageSize;
        this.currentPage = 1;
    }

    onSearchChange(): void {
        this.searchSubject.next(this.filters.searchTerm || '');
    }

    clearSearch(): void {
        this.filters.searchTerm = '';
        this.applyFilters();
    }

    resetFilters(): void {
        this.filters = {
            dateRange: 'all',
            eventTypes: [],
            priorities: [],
            facilities: []
        };
        this.selectedEventType = null;
        this.filters.searchTerm = '';
        this.applyFilters();
        this.showNotification('Filtres réinitialisés', 'success');
    }

    loadMore(): void {
        if (this.loadingMore) return;

        this.loadingMore = true;

        // Simulation chargement page suivante
        setTimeout(() => {
            // En prod: charger plus d'événements depuis l'API
            this.currentPage++;
            this.hasMoreEvents = false; // Pour la démo
            this.loadingMore = false;
        }, 800);
    }

    // ===== ACTIONS UTILISATEUR =====

    onViewEventDetails(eventId: string): void {
        this.router.navigate(['/patient', this.patientId, 'events', eventId]);
    }

    onEditEvent(eventId: string): void {
        if (this.userRole !== 'practitioner') {
            this.showNotification('Seuls les praticiens peuvent modifier les événements', 'warning');
            return;
        }
        this.router.navigate(['/patient', this.patientId, 'events', eventId, 'edit']);
    }

    onDeleteEvent(eventId: string): void {
        if (this.userRole !== 'practitioner') return;

        if (confirm('⚠️ Supprimer définitivement cet événement ?\n\nCette action ne peut pas être annulée.')) {
            // TODO: Appel API de suppression
            this.events = this.events.filter(e => e.id !== eventId);
            this.applyFilters();
            this.totalEvents--;
            this.showNotification('Événement supprimé', 'success');
        }
    }

    onShareEvent(eventId: string): void {
        // Générer un lien de partage sécurisé
        const shareToken = btoa(`${eventId}:${Date.now()}`).substring(0, 16);
        const shareUrl = `${window.location.origin}/share/${shareToken}`;

        // Copier dans le presse-papier
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showNotification('Lien de partage copié ! Valable 24h.', 'success');
        }).catch(() => {
            this.showNotification('Erreur lors de la copie du lien', 'error');
        });
    }

    onAddNewEvent(): void {
        if (this.userRole !== 'practitioner') {
            this.showNotification('Fonctionnalité réservée aux professionnels de santé', 'warning');
            return;
        }
        this.router.navigate(['/patient', this.patientId, 'events', 'new']);
    }

    // ===== EXPORT =====

    async exportTimeline(): Promise<void> {
        if (this.isExporting || !this.filteredEvents.length) return;

        this.isExporting = true;
        this.showNotification('Préparation de l\'export...', 'success');

        try {
            const blob = await this.exportService.exportPatientTimeline(
                this.patientId,
                'pdf',
                { ...this.filters, eventIds: this.filteredEvents.map(e => e.id) }
            ).toPromise();

            // Télécharger le fichier
            if (!blob) throw new Error('Export service returned no data');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DMN_Timeline_${this.patientName.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showNotification('✅ Export téléchargé avec succès', 'success');

            // Logger l'action pour l'audit
            console.log('Export timeline:', { patientId: this.patientId, format: 'pdf', eventCount: this.filteredEvents.length });

        } catch (error) {
            console.error('Erreur export:', error);
            this.showNotification('❌ Échec de l\'export. Veuillez réessayer.', 'error');
        } finally {
            this.isExporting = false;
        }
    }

    // ===== CONSENTEMENT =====

    viewConsentDetails(): void {
        this.router.navigate(['/patient', this.patientId, 'consent']);
    }

    dismissConsentBanner(): void {
        this.consentBanner = null;
    }

    // ===== NOTIFICATIONS =====

    showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
        this.notification = { message, type };
        // Auto-dismiss après 4 secondes
        setTimeout(() => this.dismissNotification(), 4000);
    }

    dismissNotification(): void {
        this.notification = null;
    }

}
