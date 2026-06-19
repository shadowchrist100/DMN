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
        return AuthStore.userId();
    }

    /**
     * Récupère la timeline complète d'un patient via le dashboard endpoint
     */
    getTimeline(patientId?: string, filters?: TimelineFilter): Observable<TimelineEvent[]> {
        const uid = patientId || this.userId;
        if (!uid) return of([]);

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
            facility: dto.facility || '',
            practitioner: {
                name: dto.practitioner_name || 'Inconnu',
                role: dto.practitioner_role || 'Médecin',
            },
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


}