import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MedicalService, PrescriptionDTO } from '../../../services/medical.service';
import { Prescription, PrescriptionType, PrescriptionStatut, MOCK_PRESCRIPTIONS } from './prescription.model';

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

    getPrescriptions(userId?: string): Observable<Prescription[]> {
        if (!userId) return of(MOCK_PRESCRIPTIONS);
        return this.medical.getPrescriptions(userId).pipe(
            map(dtos => dtos.map(dto => this.mapPrescription(dto))),
        );
    }

    getPrescriptionById(userId: string, uuid: string): Observable<Prescription | undefined> {
        return this.medical.getPrescriptions(userId).pipe(
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
