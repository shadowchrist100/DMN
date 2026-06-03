import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineEvent, EventPriority, EventStatus, BadgeType } from '../../../models/timeline-event.model';

@Component({
    selector: 'app-time-line-events',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './time-line-events.html',
    styleUrls: ['./time-line-events.css']
})
export class TimeLineEvents {
    // ===== INPUTS (Données reçues du parent) =====
    // Utilisation des Signals (Angular 17+)
    event = input.required<TimelineEvent>();
    isCompact = input<boolean>(false);

    // ===== OUTPUTS (Événements émis vers le parent) =====
    viewDetails = output<string>();
    editEvent = output<string>();
    deleteEvent = output<string>();
    shareEvent = output<string>();

    // ===== LOGIQUE MÉTIER & UI =====

    // 1. Gestion des actions
    onViewDetails(): void {
        this.viewDetails.emit(this.event().id);
    }

    onAction(event: Event): void {
        event.stopPropagation(); // Empêche le déclenchement du clic sur la carte entière
        this.viewDetails.emit(this.event().id);
    }

    onEdit(event: Event): void {
        event.stopPropagation();
        this.editEvent.emit(this.event().id);
    }

    canEdit(): boolean {
        // Logique métier : ex: vérifier si l'utilisateur connecté est le créateur ou un admin
        // return this.authService.userRole === 'practitioner';
        return true; // Mock pour l'exemple
    }

    // 2. Helpers de Styling Dynamique
    getNodeColorClass(priority: EventPriority): string {
        const styles: Record<EventPriority, string> = {
            low: 'bg-slate-100 text-slate-600',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-amber-100 text-amber-700 border-2 border-amber-300',
            critical: 'bg-red-100 text-red-700 border-2 border-red-300'
        };
        return styles[priority] || styles['low'];
    }

    getBadgeClass(type: BadgeType): string {
        const styles: Record<BadgeType, string> = {
            completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            alert: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
            urgent: 'bg-red-50 text-red-700 border border-red-200',
            archived: 'bg-slate-100 text-slate-500 border border-slate-200'
        };
        return styles[type] || '';
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

    getStatusLabel(status: EventStatus): string {
        const labels: Record<EventStatus, string> = {
            completed: 'Complété',
            pending: 'En attente',
            cancelled: 'Annulé',
            archived: 'Archivé'
        };
        return labels[status] || status;
    }
}



// import { Component, HostListener, EventEmitter, Input, Output } from '@angular/core';
// import { EventPriority, TimelineEvent, EventStatus } from '../../../models/timeline-event.model';
// import { DatePipe } from '@angular/common';

// @Component({
//     selector: 'app-time-line-events',
//     imports: [DatePipe],
//     templateUrl: './time-line-events.html',
//     styleUrl: './time-line-events.css',
// })
// export class TimeLineEvents {
//     @Input() event!: TimelineEvent;
//     @Input() isLast = false;
//     @Output() viewDetails = new EventEmitter<string>();
//     @Output() editEvent = new EventEmitter<string>();
//     @Output() deleteEvent = new EventEmitter<string>();
//     @Output() shareEvent = new EventEmitter<string>();

//     showOptions = false;
//     optionsPosition = { x: 0, y: 0 };

//     // Helper Math pour les templates
//     Math = Math;

//     getNodeColorClass(priority: EventPriority): string {
//         const classes: Record<EventPriority, string> = {
//             low: 'node-low',
//             medium: 'node-medium',
//             high: 'node-high',
//             critical: 'node-critical'
//         };
//         return classes[priority];
//     }

//     getBadgeClass(type: 'completed' | 'alert' | 'urgent' | 'archived'): string {
//         const classes: Record<string, string> = {
//             completed: 'badge-completed',
//             alert: 'badge-alert',
//             urgent: 'badge-urgent',
//             archived: 'badge-archived'
//         };
//         return classes[type] || '';
//     }

//     getStatusLabel(status: EventStatus): string {
//         const labels: Record<EventStatus, string> = {
//             completed: 'Complété',
//             pending: 'En attente',
//             cancelled: 'Annulé',
//             archived: 'Archivé'
//         };
//         return labels[status];
//     }

//     getActionIcon(type: 'view' | 'edit' | 'download' | 'share'): string {
//         const icons: Record<string, string> = {
//             view: 'visibility',
//             edit: 'edit',
//             download: 'download',
//             share: 'share'
//         };
//         return icons[type] || 'visibility';
//     }

//     canShare(event: TimelineEvent): boolean {
//         // Logique métier: on ne peut partager que si consentement actif
//         return event.consentRequired === false || this.hasActiveConsent(event);
//     }

//     private hasActiveConsent(event: TimelineEvent): boolean {
//         // TODO: Appeler un service de consentement
//         return true; // Mock pour l'exemple
//     }

//     toggleOptions(event: Event): void {
//         event.stopPropagation();
//         this.showOptions = !this.showOptions;

//         if (this.showOptions) {
//             // Positionner le dropdown
//             setTimeout(() => {
//                 const trigger = (event.target as HTMLElement).closest('button');
//                 if (trigger) {
//                     const rect = trigger.getBoundingClientRect();
//                     this.optionsPosition = {
//                         x: rect.right - 192, // 192px = w-48
//                         y: rect.bottom + 4
//                     };
//                 }
//             });
//         }
//     }

//     hideOptions(): void {
//         this.showOptions = false;
//     }

//     @HostListener('document:click', ['$event'])
//     onDocumentClick(event: Event): void {
//         const target = event.target as HTMLElement;
//         if (!target.closest('[data-event-id]') && this.showOptions) {
//             this.hideOptions();
//         }
//     }

//     onAction(): void {
//         if (this.event.actionType === 'view') {
//             this.viewDetails.emit(this.event.id);
//         }
//     }

//     onEdit(): void {
//         this.editEvent.emit(this.event.id);
//     }

//     onDelete(): void {
//         if (confirm('⚠️ Supprimer cet événement de la timeline ?\n\nCette action est irréversible.')) {
//             this.deleteEvent.emit(this.event.id);
//         }
//     }

//     onShare(): void {
//         this.shareEvent.emit(this.event.id);
//     }

// }
