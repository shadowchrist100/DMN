import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MedicalService, PrescriptionDTO } from '../../../services/medical.service';
import { Prescription, PrescriptionType, PrescriptionStatut } from './prescription.model';
import { AuthStore } from '../../../../../core/auth/auth.store';

const TYPE_MAP: Record<string, PrescriptionType> = {
    'EXAMINATION': 'analyse',
    'VACCIN': 'medicament',
};

const STATUT_MAP: Record<string, PrescriptionStatut> = {
    'EN_COURS': 'actif',
    'DISPENSE': 'termine',
    'ANNULE': 'annule',
    'TERMINE': 'termine',
};

@Injectable({ providedIn: 'root' })
export class PrescriptionService {

    private medical = inject(MedicalService);

    private get userId(): string | null {
        return AuthStore.userId();
    }

    getPrescriptions(userId?: string): Observable<Prescription[]> {
        const uid = userId || this.userId;
        if (!uid) return of([]);
        return this.medical.getPrescriptions(uid).pipe(
            map(dtos => dtos.map(dto => this.mapPrescription(dto))),
        );
    }

    getPrescriptionById(uuid: string): Observable<Prescription | undefined> {
        const uid = this.userId;
        if (!uid) return of(undefined);
        return this.medical.getPrescriptions(uid).pipe(
            map(dtos => {
                const dto = dtos.find(p => p.uuid === uuid);
                return dto ? this.mapPrescription(dto) : undefined;
            }),
        );
    }

    exportPrescriptions(): Observable<Blob> {
        const content = 'Export des prescriptions DMN\n\n';
        const blob = new Blob([content], { type: 'text/csv' });
        return of(blob);
    }

    private mapPrescription(dto: PrescriptionDTO): Prescription {
        const type = TYPE_MAP[dto.type_prescription] || 'medicament';
        const statut = STATUT_MAP[dto.statut] || 'en_attente';

        return {
            uuid: dto.uuid,
            type,
            libelle: dto.libelle,
            statut,
            date_prescription: dto.date_prescription,
            instructions_speciales: dto.special_instructions,
            code_substance_code: dto.code_loinc || dto.code_cvx || undefined,
            prescripteur: dto.prescripteur_nom || undefined,
            specialite_prescripteur: dto.prescripteur_specialite || undefined,
        } as Prescription;
    }
}
