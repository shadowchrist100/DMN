// ─── Types ─────────────────────────────────────────────────────────────────────

export type PrescriptionType =
    | 'medicament'
    | 'analyse'
    | 'vaccin'
    | 'soins'
    | 'biologie'
    | 'radiographie'
    | 'echographie'
    | 'scanner'
    | 'irm'
    | 'autre';

export type PrescriptionStatut =
    | 'actif'
    | 'termine'
    | 'annule'
    | 'en_attente'
    | 'suspendu';

// ─── Modèle principal ──────────────────────────────────────────────────────────

export interface Prescription {
    uuid: string;
    type: PrescriptionType;
    libelle: string;
    code_substance_code?: string;       // Code ATC ou CIS pour médicaments
    forme_galenique?: string;           // comprimé, gélule, sirop, injection…
    dosage?: string;                    // ex: "500"
    unite_dosage?: string;              // ex: "mg", "µg", "UI"
    posologie_texte?: string;           // ex: "1 comprimé matin et soir"
    frequence?: string;                 // ex: "2x/jour", "1x/semaine"
    duree_jour?: number;                // durée en jours
    instructions_speciales?: string;    // ex: "à prendre pendant le repas"
    statut: PrescriptionStatut;

    // ── Enrichissements liés à la consultation ──────────────────────────
    prescripteur?: string;              // nom du médecin
    specialite_prescripteur?: string;
    date_prescription?: Date | string;
    date_fin?: Date | string;           // calculée : date_prescription + duree_jour
    visite_id?: string;                 // référence à la visite / consultation
    renouvelable?: boolean;
    ordonnance_url?: string;            // lien PDF
}

// ─── Filtre & pagination ───────────────────────────────────────────────────────

export type PrescriptionFilter = 'all' | PrescriptionStatut;
export type PrescriptionPeriod = 'all' | '6months' | 'year' | 'custom';

export interface PrescriptionPage {
    items: Prescription[];
    total: number;
    page: number;
    pageSize: number;
}