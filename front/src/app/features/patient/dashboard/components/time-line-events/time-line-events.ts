import { Component, HostListener,EventEmitter, Input, Output } from '@angular/core';
import { EventPriority, TimelineEvent, EventStatus } from '../../../models/timeline-event.model';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-time-line-events',
    imports: [DatePipe],
    templateUrl: './time-line-events.html',
    styleUrl: './time-line-events.css',
})
export class TimeLineEvents {
    @Input() event!: TimelineEvent;
    @Input() isLast = false;
    @Output() viewDetails = new EventEmitter<string>();
    @Output() editEvent = new EventEmitter<string>();
    @Output() deleteEvent = new EventEmitter<string>();
    @Output() shareEvent = new EventEmitter<string>();

    showOptions = false;
    optionsPosition = { x: 0, y: 0 };

    // Helper Math pour les templates
    Math = Math;

    getNodeColorClass(priority: EventPriority): string {
        const classes: Record<EventPriority, string> = {
            low: 'node-low',
            medium: 'node-medium',
            high: 'node-high',
            critical: 'node-critical'
        };
        return classes[priority];
    }

    getBadgeClass(type: 'completed' | 'alert' | 'urgent' | 'archived'): string {
        const classes: Record<string, string> = {
            completed: 'badge-completed',
            alert: 'badge-alert',
            urgent: 'badge-urgent',
            archived: 'badge-archived'
        };
        return classes[type] || '';
    }

    getStatusLabel(status: EventStatus): string {
        const labels: Record<EventStatus, string> = {
            completed: 'Complété',
            pending: 'En attente',
            cancelled: 'Annulé',
            archived: 'Archivé'
        };
        return labels[status];
    }

    getActionIcon(type: 'view' | 'edit' | 'download' | 'share'): string {
        const icons: Record<string, string> = {
            view: 'visibility',
            edit: 'edit',
            download: 'download',
            share: 'share'
        };
        return icons[type] || 'visibility';
    }

    canShare(event: TimelineEvent): boolean {
        // Logique métier: on ne peut partager que si consentement actif
        return event.consentRequired === false || this.hasActiveConsent(event);
    }

    private hasActiveConsent(event: TimelineEvent): boolean {
        // TODO: Appeler un service de consentement
        return true; // Mock pour l'exemple
    }

    toggleOptions(event: Event): void {
        event.stopPropagation();
        this.showOptions = !this.showOptions;

        if (this.showOptions) {
            // Positionner le dropdown
            setTimeout(() => {
                const trigger = (event.target as HTMLElement).closest('button');
                if (trigger) {
                    const rect = trigger.getBoundingClientRect();
                    this.optionsPosition = {
                        x: rect.right - 192, // 192px = w-48
                        y: rect.bottom + 4
                    };
                }
            });
        }
    }

    hideOptions(): void {
        this.showOptions = false;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-event-id]') && this.showOptions) {
            this.hideOptions();
        }
    }

    onAction(): void {
        if (this.event.actionType === 'view') {
            this.viewDetails.emit(this.event.id);
        }
    }

    onEdit(): void {
        this.editEvent.emit(this.event.id);
    }

    onDelete(): void {
        if (confirm('⚠️ Supprimer cet événement de la timeline ?\n\nCette action est irréversible.')) {
            this.deleteEvent.emit(this.event.id);
        }
    }

    onShare(): void {
        this.shareEvent.emit(this.event.id);
    }

}
