import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MedicalService, AllergyDTO, ExamenDTO } from '../../services/medical.service';

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

    getAllergies(userId?: string): Observable<Allergie[]> {
        if (!userId) return of(MOCK_ALLERGIES);
        return this.medical.getAllergies(userId).pipe(
            map(dtos => dtos.map((dto, index) => this.mapAllergie(dto, index))),
        );
    }

    getExamens(userId?: string): Observable<Examen[]> {
        if (!userId) return of(MOCK_EXAMENS);
        return this.medical.getExamens(userId).pipe(
            map(dtos => dtos.map(dto => this.mapExamen(dto))),
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

// ═══════════════════════════════════════════════════════════════════════════════
//  MOCK DATA (fallback quand userId n'est pas fourni)
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_ALLERGIES: Allergie[] = [
    {
        id: 1, substance: 'Pénicilline G', type: 'Médicaments', sousType: 'Antibiotique',
        icon: 'medication', criticite: 'Élevée', statut: 'Allergie Active',
        reactions: ['Choc Anaphylactique', 'Urticaire généralisée', 'Œdème de Quincke'],
        dateDeclaration: '12/03/2018', declarePar: 'Dr. Ahossi Sébastien',
        notes: 'Risque de réaction croisée avec les Céphalosporines. Porter un bracelet médical.',
    },
    {
        id: 2, substance: 'Lactose (Produits Laitiers)', type: 'Alimentation', sousType: 'Intolérance',
        icon: 'restaurant', criticite: 'Basse', statut: 'Confirmé',
        reactions: ['Douleurs abdominales', 'Ballonnements', 'Inconfort gastrique sévère'],
        dateDeclaration: '05/07/2020', declarePar: 'Dr. Bello Aïssatou',
        notes: 'Régime sans lactose recommandé. Tolérance possible aux fromages affinés.',
    },
    {
        id: 3, substance: 'Acariens / Poussière', type: 'Environnement', sousType: 'Allergie',
        icon: 'psychology', criticite: 'Inconnue', statut: 'Suspecté',
        reactions: ['Rhinite allergique', 'Conjonctivite', 'Éternuements fréquents'],
        dateDeclaration: '22/11/2021', declarePar: 'Dr. Dossou Mireille',
        notes: 'Tests cutanés en attente. Bilan allergologique planifié pour Q1 2024.',
    },
    {
        id: 4, substance: 'Ibuprofène (AINS)', type: 'Médicaments', sousType: 'Anti-inflammatoire',
        icon: 'medication', criticite: 'Basse', statut: 'Actif',
        reactions: ['Urticaire localisée', 'Prurit léger'],
        dateDeclaration: '14/09/2023', declarePar: 'Dr. Kouandété Koffi',
    },
];

const MOCK_EXAMENS: Examen[] = [
    {
        uuid: 'e001', libelle_examen: 'Glycémie à jeun', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '2339-0', valeur: '1.26', unite: 'g/L',
        valeur_min_normal: 0.70, valeur_max_normal: 1.10,
        interpretation: 'Valeur supérieure à la normale. Tendance diabétique à surveiller.',
        image_path: null,
    },
    {
        uuid: 'e002', libelle_examen: 'HbA1c', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '4548-4', valeur: '7.2', unite: '%',
        valeur_min_normal: 4.0, valeur_max_normal: 6.0,
        interpretation: 'Hémoglobine glyquée élevée. Consultation endocrinologue requise.',
        image_path: null,
    },
    {
        uuid: 'e003', libelle_examen: 'Cholestérol LDL', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '13457-7', valeur: '1.62', unite: 'g/L',
        valeur_min_normal: 0.50, valeur_max_normal: 1.60,
        interpretation: 'Légèrement au-dessus de la limite recommandée.',
        image_path: null,
    },
    {
        uuid: 'e004', libelle_examen: 'Sodium (Na+)', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '2951-2', valeur: '141', unite: 'mmol/L',
        valeur_min_normal: 135, valeur_max_normal: 145,
        interpretation: 'Natrémie dans les valeurs de référence.', image_path: null,
    },
    {
        uuid: 'e005', libelle_examen: 'Créatinine', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '2160-0', valeur: '9.1', unite: 'mg/L',
        valeur_min_normal: 7.0, valeur_max_normal: 12.0,
        interpretation: 'Fonction rénale normale.', image_path: null,
    },
    {
        uuid: 'e006', libelle_examen: 'NFS – Hémoglobine', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-04-10'),
        code_loinc: '718-7', valeur: '11.2', unite: 'g/dL',
        valeur_min_normal: 12.0, valeur_max_normal: 17.5,
        interpretation: 'Anémie légère. Supplémentation en fer à envisager.', image_path: null,
    },
    {
        uuid: 'e007', libelle_examen: 'Échographie abdominale', type_examen: 'Échographie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-03-15'),
        code_loinc: '36643-5', valeur: 'N/A', unite: '',
        valeur_min_normal: null, valeur_max_normal: null,
        interpretation: 'Foie homogène, pas de lésion focale. Rate et reins normaux.',
        image_path: '/assets/imagerie/echo-abdomen-2024.jpg',
    },
    {
        uuid: 'e008', libelle_examen: 'Radiographie Thorax (Face)', type_examen: 'Radiologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-03-15'),
        code_loinc: '36643-5', valeur: 'N/A', unite: '',
        valeur_min_normal: null, valeur_max_normal: null,
        interpretation: 'Silhouette cardiaque normale. Pas d\'opacité suspecte.',
        image_path: '/assets/imagerie/radio-thorax-2024.jpg',
    },
    {
        uuid: 'e009', libelle_examen: 'ECG de repos', type_examen: 'Cardiologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-02-20'),
        code_loinc: '11524-6', valeur: '88', unite: 'BPM',
        valeur_min_normal: 60, valeur_max_normal: 100,
        interpretation: 'Rythme sinusal régulier. Intervalle QT normal.',
        image_path: '/assets/imagerie/ecg-2024.jpg',
    },
    {
        uuid: 'e010', libelle_examen: 'TSH (Thyroïde)', type_examen: 'Biologie',
        statut: 'En attente', date_realisation: new Date('2024-05-30'),
        code_loinc: '3016-3', valeur: '—', unite: 'mUI/L',
        valeur_min_normal: 0.4, valeur_max_normal: 4.0,
        interpretation: 'Résultat en attente du laboratoire.', image_path: null,
    },
    {
        uuid: 'e011', libelle_examen: 'Échographie cardiaque (ETT)', type_examen: 'Échographie',
        statut: 'En cours', date_realisation: new Date('2024-05-28'),
        code_loinc: '42148-7', valeur: 'N/A', unite: '',
        valeur_min_normal: null, valeur_max_normal: null,
        interpretation: 'Examen en cours de traitement par le cardiologue.', image_path: null,
    },
];
