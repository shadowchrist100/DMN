import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MedicalService, AllergyDTO, ExamenDTO, DashboardSummaryDTO, AlertDTO, AccessLogDTO, PendingAccessRequestDTO, DiseaseDTO } from '../../services/medical.service';
import { AuthStore } from '../../../../core/auth/auth.store';

export type TypeExamen =
    | 'Biologie' | 'Imagerie' | 'Radiologie'
    | 'Échographie' | 'Cardiologie' | 'Autre';

export type StatutExamen =
    | 'Résultat disponible' | 'En attente' | 'En cours' | 'Annulé';

export type StatutValeur = 'normal' | 'eleve' | 'bas' | 'critique' | 'limite' | 'na';

export interface Examen {
    uuid: string;
    libelle_examen: string;
    type_examen: TypeExamen;
    statut: StatutExamen;
    date_realisation: Date;
    code_loinc: string;
    valeur: string;
    unite: string;
    valeur_min_normal: number | null;
    valeur_max_normal: number | null;
    interpretation: string;
    image_path: string | null;
}

export type Criticite = 'Élevée' | 'Modérée' | 'Basse' | 'Inconnue';
export type StatutAllergie = 'Allergie Active' | 'Confirmé' | 'Suspecté' | 'Actif' | 'Résolu';
export type TypeAllergie = 'Médicaments' | 'Alimentation' | 'Environnement' | 'Autre';

export interface Allergie {
    id: number;
    substance: string;
    type: TypeAllergie;
    sousType: string;
    icon: string;
    criticite: Criticite;
    statut: StatutAllergie;
    reactions: string[];
    dateDeclaration: string;
    declarePar: string;
    notes?: string;
}

const CATEGORIE_TO_TYPE: Record<string, TypeAllergie> = {
    'Médicaments': 'Médicaments',
    'Alimentation': 'Alimentation',
    'Alimentaire': 'Alimentation',
    'Environnement': 'Environnement',
    'Environnemental': 'Environnement',
};

const CRITICITE_MAP: Record<string, Criticite> = {
    'haute': 'Élevée',
    'élevée': 'Élevée',
    'elevee': 'Élevée',
    'high': 'Élevée',
    'modérée': 'Modérée',
    'moderee': 'Modérée',
    'medium': 'Modérée',
    'basse': 'Basse',
    'low': 'Basse',
};

const STATUT_CLINIQUE_MAP: Record<string, StatutAllergie> = {
    'active': 'Allergie Active',
    'actif': 'Allergie Active',
    'confirmé': 'Confirmé',
    'confirme': 'Confirmé',
    'suspecté': 'Suspecté',
    'suspecte': 'Suspecté',
    'résolu': 'Résolu',
    'resolu': 'Résolu',
};

const STATUT_VERIF_MAP: Record<string, StatutAllergie> = {
    'CONFIRMED': 'Confirmé',
    'SUSPECTED': 'Suspecté',
    'REJECTED': 'Résolu',
};

@Injectable({ providedIn: 'root' })
export class DashboardService {

    private medical = inject(MedicalService);

    readonly summary = signal<DashboardSummaryDTO | null>(null);
    readonly loading = signal(false);
    readonly pendingRequests = signal<PendingAccessRequestDTO[]>([]);

    private get userId(): string | undefined {
        return AuthStore.userId() || undefined;
    }

    loadSummary(): Observable<DashboardSummaryDTO> {
        const uid = this.userId;
        if (!uid) return of({} as DashboardSummaryDTO);

        this.loading.set(true);
        return this.medical.getDashboardSummary(uid).pipe(
            tap(data => {
                this.summary.set(data);
                this.loading.set(false);
            }),
        );
    }

    getAllergies(userId?: string): Observable<Allergie[]> {
        const uid = userId || this.userId;
        if (!uid) return of([]);
        return this.medical.getAllergies(uid).pipe(
            map(dtos => dtos.map((dto, index) => this.mapAllergie(dto, index))),
        );
    }

    getExamens(userId?: string): Observable<Examen[]> {
        const uid = userId || this.userId;
        if (!uid) return of([]);
        return this.medical.getExamens(uid).pipe(
            map(dtos => dtos.map(dto => this.mapExamen(dto))),
        );
    }

    getPathologies(userId?: string): Observable<DiseaseDTO[]> {
        const uid = userId || this.userId;
        if (!uid) return of([]);
        return this.medical.getPathologies(uid);
    }

    getAlerts(userId?: string): Observable<AlertDTO[]> {
        const uid = userId || this.userId;
        if (!uid) return of([]);
        return this.medical.getDashboardAlerts(uid);
    }

    getAccessLog(userId?: string): Observable<AccessLogDTO[]> {
        const uid = userId || this.userId;
        if (!uid) return of([]);
        return this.medical.getDashboardAccessLog(uid);
    }

    loadPendingRequests(): Observable<PendingAccessRequestDTO[]> {
        const uid = this.userId;
        if (!uid) return of([]);
        return this.medical.getPendingAccessRequests(uid).pipe(
            tap(data => this.pendingRequests.set(data)),
        );
    }

    respondToRequest(requestId: string, action: 'accept' | 'decline', perimeter?: string, duration?: string): Observable<{ status: string }> {
        const uid = this.userId;
        if (!uid) throw new Error('User not authenticated');
        return this.medical.respondToAccessRequest(uid, requestId, { action, perimeter, duration }).pipe(
            tap(() => {
                this.pendingRequests.update(list => list.filter(r => r.id !== requestId));
            }),
        );
    }

    private mapAllergie(dto: AllergyDTO, index: number): Allergie {
        const rawType = dto.categorie || '';
        const type: TypeAllergie = CATEGORIE_TO_TYPE[rawType] || 'Autre';
        const criticite: Criticite = CRITICITE_MAP[dto.criticite.toLowerCase()] || 'Inconnue';
        const statutClinique = STATUT_CLINIQUE_MAP[dto.statut_clinique.toLowerCase()];
        const statutVerif = STATUT_VERIF_MAP[dto.statut_verification];
        const statut: StatutAllergie = statutClinique || statutVerif || 'Actif';

        return {
            id: index + 1,
            substance: dto.substance,
            type,
            sousType: rawType,
            icon: type === 'Médicaments' ? 'medication'
                : type === 'Alimentation' ? 'restaurant'
                : type === 'Environnement' ? 'psychology' : 'warning',
            criticite,
            statut,
            reactions: dto.reactions || [],
            dateDeclaration: dto.date_declaration,
            declarePar: '',
            notes: dto.notes || undefined,
        };
    }

    private mapExamen(dto: ExamenDTO): Examen {
        const type_examen = this.toTypeExamen(dto.type_examen);
        const statut = dto.valeur && dto.valeur !== '—' && dto.valeur !== ''
            ? 'Résultat disponible' as StatutExamen
            : 'En attente' as StatutExamen;

        return {
            uuid: dto.uuid,
            libelle_examen: dto.libelle_examen,
            type_examen,
            statut,
            date_realisation: dto.date_realisation ? new Date(dto.date_realisation) : new Date(),
            code_loinc: dto.code_loinc,
            valeur: dto.valeur,
            unite: '',
            valeur_min_normal: null,
            valeur_max_normal: null,
            interpretation: dto.interpretation,
            image_path: dto.image_path,
        };
    }

    private toTypeExamen(raw: string): TypeExamen {
        const lower = raw.toLowerCase();
        if (lower.includes('biologie') || lower.includes('labo')) return 'Biologie';
        if (lower.includes('radiologie') || lower.includes('radio')) return 'Radiologie';
        if (lower.includes('échographie') || lower.includes('echo')) return 'Échographie';
        if (lower.includes('cardiologie') || lower.includes('ecg')) return 'Cardiologie';
        if (lower.includes('imagerie') || lower.includes('irm') || lower.includes('scanner')) return 'Imagerie';
        if (lower.includes('analyse')) return 'Biologie';
        return 'Autre';
    }
}

