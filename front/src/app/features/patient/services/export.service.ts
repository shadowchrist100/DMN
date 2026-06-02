// export.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TimelineFilter } from '../models/timeline-event.model';
// import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {

    private apiUrl = `$/export`;

    constructor(private http: HttpClient) { }

    /**
     * Exporte la timeline d'un patient
     */
    exportPatientTimeline(
        patientId: string,
        format: 'pdf' | 'csv' | 'json',
        options?: { eventIds?: string[] } & Partial<TimelineFilter>
    ): Observable<Blob> {

        let params = new HttpParams()
            .set('patient_id', patientId)
            .set('format', format)
            .set('include_attachments', 'true')
            .set('watermark', 'true'); // Filigrane "CONFIDENTIEL"

        // Ajouter les filtres
        if (options?.dateRange) params = params.set('period', options.dateRange);
        if (options?.eventTypes?.length) params = params.set('types', options.eventTypes.join(','));
        if (options?.eventIds?.length) params = params.set('event_ids', options.eventIds.join(','));

        // En-têtes pour le PDF
        const headers = {
            'Accept': format === 'pdf' ? 'application/pdf' :
                format === 'csv' ? 'text/csv' : 'application/json',
            'X-Export-By': 'DMN-Portal',
            'X-Generated-At': new Date().toISOString()
        };

        return this.http.get(`${this.apiUrl}/timeline`, {
            params,
            headers,
            responseType: 'blob'
        });
    }

    /**
     * Exporte un événement spécifique
     */
    exportEvent(eventId: string, format: 'pdf' | 'json' = 'pdf'): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/events/${eventId}`, {
            params: { format },
            responseType: 'blob'
        });
    }
}