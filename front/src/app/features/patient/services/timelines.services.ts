import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { TimelineEvent, TimelineFilter, EventType } from '../models/timeline-event.model';
import { API } from '../../../core/config/api.config';
import { AuthStore } from '../../../core/auth/auth.store';
import { MedicalService, TimelineEventDTO } from './medical.service';

@Injectable({ providedIn: 'root' })
export class TimelineService {
    private http = inject(HttpClient);
    private medicalService = inject(MedicalService);

    private get userId(): string | undefined {
        return AuthStore.user()?.identity?.npi?.toString();
    }

    /**
     * Récupère la timeline complète d'un patient via le dashboard endpoint
     */
    getTimeline(patientId?: string, filters?: TimelineFilter): Observable<TimelineEvent[]> {
        const uid = patientId || this.userId;
        if (!uid) return of(this.getMockTimeline());

        return this.medicalService.getDashboardTimeline(uid).pipe(
            map(dtos => dtos.map(dto => this.mapToTimelineEvent(dto))),
            catchError(error => {
                console.error('Erreur chargement timeline:', error);
                return throwError(() => new Error('Impossible de charger l\'historique médical'));
            })
        );
    }

    private mapToTimelineEvent(dto: TimelineEventDTO): TimelineEvent {
        return {
            id: dto.id,
            type: dto.type as EventType,
            title: dto.title,
            description: dto.description || undefined,
            date: new Date(dto.date),
            facility: dto.facility || undefined,
            practitioner: dto.practitioner_name ? {
                name: dto.practitioner_name,
                role: dto.practitioner_role || 'Médecin',
            } : undefined,
            priority: dto.priority as 'low' | 'medium' | 'high' | 'critical',
            status: dto.status as 'pending' | 'completed' | 'archived',
            diagnosis: dto.diagnosis || undefined,
            notes: dto.notes || undefined,
            icon: dto.icon,
            badge: dto.badge_text ? {
                text: dto.badge_text,
                type: (dto.badge_type as 'completed' | 'pending' | 'alert' | 'archived') || 'completed',
            } : undefined,
            createdAt: new Date(dto.date),
            isEditable: false,
            consentRequired: true,
        };
    }

    /**
     * Ajoute un nouvel événement à la timeline
     */
    addEvent(patientId: string, event: Partial<TimelineEvent>): Observable<TimelineEvent> {
        return this.http.post<TimelineEvent>(
            `${API.MEDICAL_BASE_URL}/patient/${patientId}/timeline/events`,
            { ...event, createdAt: new Date() }
        ).pipe(
            catchError(error => {
                console.error('Erreur ajout événement:', error);
                return throwError(() => new Error('Échec de l\'enregistrement'));
            })
        );
    }

    /**
     * Met à jour un événement existant
     */
    updateEvent(patientId: string, eventId: string, updates: Partial<TimelineEvent>): Observable<TimelineEvent> {
        return this.http.patch<TimelineEvent>(
            `${API.MEDICAL_BASE_URL}/patient/${patientId}/timeline/events/${eventId}`,
            { ...updates, updatedAt: new Date() }
        );
    }

    /**
     * Supprime un événement (soft delete)
     */
    deleteEvent(patientId: string, eventId: string): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(
            `${API.MEDICAL_BASE_URL}/patient/${patientId}/timeline/events/${eventId}`
        );
    }

    /**
     * Exporte la timeline en PDF
     */
    exportTimeline(patientId: string, format: 'pdf' | 'csv' | 'json', filters?: TimelineFilter): Observable<Blob> {
        let params = new HttpParams().set('format', format);

        if (filters?.dateRange) params = params.set('period', filters.dateRange);
        if (filters?.eventTypes?.length) params = params.set('types', filters.eventTypes.join(','));

        return this.http.get(`${API.MEDICAL_BASE_URL}/patient/${patientId}/timeline/export`, {
            params,
            responseType: 'blob'
        });
    }

    /**
     * Mock data pour développement
     */
    getMockTimeline(): TimelineEvent[] {
        return [
            {
                id: 'evt-001',
                type: 'consultation' as EventType,
                title: 'Consultation Générale - Suivi HTA',
                description: 'Contrôle trimestriel de l\'hypertension artérielle',
                date: new Date('2024-01-15T14:30:00'),
                facility: 'Hôpital de Zone de Calavi',
                practitioner: { name: 'Dr. Sévérin Adjaho', role: 'Médecin Généraliste' },
                priority: 'medium',
                status: 'completed',
                diagnosis: 'HTA contrôlée, poursuite du traitement',
                notes: 'Patient observant, pas d\'effets secondaires rapportés.',
                createdAt: new Date('2024-01-15T14:30:00'),
                isEditable: false,
                consentRequired: true,
                icon: 'stethoscope',
                badge: { text: 'Complété', type: 'completed' },
            },
            {
                id: 'evt-002',
                type: 'lab_result' as EventType,
                title: 'Bilan Sanguin Complet',
                date: new Date('2024-01-10T08:15:00'),
                facility: 'Laboratoire BIO-BENIN',
                practitioner: { name: 'Dr. Amina Soumanou', role: 'Biologiste Médicale' },
                priority: 'high',
                status: 'completed',
                notes: 'Légère élévation de la glycémie et du cholestérol.',
                createdAt: new Date('2024-01-10T08:15:00'),
                isEditable: false,
                consentRequired: true,
                icon: 'biotech',
                badge: { text: '2 valeurs hors norme', type: 'alert' },
            },
        ];
    }
}