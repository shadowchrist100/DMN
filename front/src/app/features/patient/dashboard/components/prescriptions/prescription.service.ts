import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Prescription, MOCK_PRESCRIPTIONS } from './prescription.model';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {

    getPrescriptions(): Observable<Prescription[]> {
        return of(MOCK_PRESCRIPTIONS).pipe(delay(400));
    }

    getPrescriptionById(uuid: string): Observable<Prescription | undefined> {
        return of(MOCK_PRESCRIPTIONS.find(p => p.uuid === uuid)).pipe(delay(200));
    }

    exportPrescriptions(): Observable<Blob> {
        const content = 'Export des prescriptions DMN\n\n';
        const blob = new Blob([content], { type: 'text/csv' });
        return of(blob).pipe(delay(500));
    }
}
