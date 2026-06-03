// ─── Types ─────────────────────────────────────────────────────────────────────

export type PrescriptionType =
    | 'medicament'
    | 'analyse'
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
    verifie_ia?: boolean;               // flag IA DMN
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

// ─── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_PRESCRIPTIONS: Prescription[] = [
    // ── ACTIFS ────────────────────────────────────────────────────────────
    {
        uuid: 'presc-001',
        type: 'medicament',
        libelle: 'Amoxicilline',
        code_substance_code: 'J01CA04',
        forme_galenique: 'Gélule',
        dosage: '500',
        unite_dosage: 'mg',
        posologie_texte: '1 gélule, 3 fois par jour',
        frequence: '3x/jour',
        duree_jour: 7,
        instructions_speciales: 'À prendre pendant les repas',
        statut: 'actif',
        prescripteur: 'Dr. Koffi Mensah',
        specialite_prescripteur: 'Cardiologie',
        date_prescription: new Date('2023-10-17'),
        date_fin: new Date('2023-10-24'),
        visite_id: 'VST-4022',
        renouvelable: false,
        verifie_ia: true,
        ordonnance_url: '/ordonnances/presc-001.pdf',
    },
    {
        uuid: 'presc-002',
        type: 'medicament',
        libelle: 'Ibuprofène',
        code_substance_code: 'M01AE01',
        forme_galenique: 'Comprimé',
        dosage: '400',
        unite_dosage: 'mg',
        posologie_texte: 'Si besoin, maximum 3 par jour',
        frequence: 'Si besoin (max 3/j)',
        duree_jour: 5,
        instructions_speciales: 'Ne pas dépasser 3 comprimés par jour. Prendre avec un grand verre d\'eau.',
        statut: 'actif',
        prescripteur: 'Dr. Koffi Mensah',
        specialite_prescripteur: 'Cardiologie',
        date_prescription: new Date('2023-10-17'),
        date_fin: new Date('2023-10-22'),
        visite_id: 'VST-4022',
        renouvelable: false,
        verifie_ia: true,
    },
    // ── EXAMENS / ANALYSES ────────────────────────────────────────────────
    {
        uuid: 'presc-003',
        type: 'analyse',
        libelle: 'Numération Formule Sanguine (NFS)',
        code_substance_code: 'B-NFS',
        posologie_texte: 'Prélèvement à jeun',
        instructions_speciales: 'À réaliser dans les 48h. Jeûne de 12h requis.',
        statut: 'en_attente',
        prescripteur: 'Dr. Romuald Agossou',
        specialite_prescripteur: 'Médecine générale',
        date_prescription: new Date('2023-10-20'),
        visite_id: 'VST-4030',
        verifie_ia: false,
    },
    {
        uuid: 'presc-004',
        type: 'radiographie',
        libelle: 'Radiographie thoracique (face)',
        code_substance_code: 'RAD-THORAX-F',
        instructions_speciales: 'Debout, inspiration bloquée. Apporter les radios antérieures.',
        statut: 'termine',
        prescripteur: 'Dr. Koffi Mensah',
        specialite_prescripteur: 'Cardiologie',
        date_prescription: new Date('2023-09-14'),
        visite_id: 'VST-3900',
        verifie_ia: true,
        ordonnance_url: '/ordonnances/presc-004.pdf',
    },
    {
        uuid: 'presc-005',
        type: 'echographie',
        libelle: 'Échographie abdominale',
        code_substance_code: 'ECH-ABD',
        posologie_texte: 'À jeun depuis 6h',
        instructions_speciales: 'Jeûne de 6h obligatoire. Vessie pleine recommandée.',
        statut: 'en_attente',
        prescripteur: 'Dr. Agnès Dossou',
        specialite_prescripteur: 'Gastro-entérologie',
        date_prescription: new Date('2023-10-18'),
        visite_id: 'VST-4025',
        verifie_ia: false,
    },
    // ── HISTORIQUE ────────────────────────────────────────────────────────
    {
        uuid: 'presc-006',
        type: 'medicament',
        libelle: 'Paracétamol',
        code_substance_code: 'N02BE01',
        forme_galenique: 'Comprimé',
        dosage: '1000',
        unite_dosage: 'mg',
        posologie_texte: '1 comprimé toutes les 8h',
        frequence: '3x/jour',
        duree_jour: 3,
        statut: 'termine',
        prescripteur: 'Dr. Sikirou Amadou',
        specialite_prescripteur: 'Médecine générale',
        date_prescription: new Date('2023-09-12'),
        visite_id: 'VST-3880',
        renouvelable: false,
        verifie_ia: true,
        ordonnance_url: '/ordonnances/presc-006.pdf',
    },
    {
        uuid: 'presc-007',
        type: 'biologie',
        libelle: 'Bilan lipidique complet',
        code_substance_code: 'B-LIPID',
        posologie_texte: 'Prélèvement à jeun (12h)',
        instructions_speciales: 'Cholestérol total, LDL, HDL, triglycérides. Jeûne strict 12h.',
        statut: 'termine',
        prescripteur: 'Dr. Koffi Mensah',
        specialite_prescripteur: 'Cardiologie',
        date_prescription: new Date('2023-08-05'),
        verifie_ia: true,
        ordonnance_url: '/ordonnances/presc-007.pdf',
    },
    {
        uuid: 'presc-008',
        type: 'medicament',
        libelle: 'Metformine',
        code_substance_code: 'A10BA02',
        forme_galenique: 'Comprimé',
        dosage: '500',
        unite_dosage: 'mg',
        posologie_texte: '2 comprimés par jour au repas',
        frequence: '2x/jour',
        duree_jour: 30,
        statut: 'termine',
        prescripteur: 'Dr. Agnès Dossou',
        specialite_prescripteur: 'Endocrinologie',
        date_prescription: new Date('2023-08-05'),
        visite_id: 'VST-3800',
        renouvelable: true,
        verifie_ia: false,
        ordonnance_url: '/ordonnances/presc-008.pdf',
    },
    {
        uuid: 'presc-009',
        type: 'medicament',
        libelle: 'Amlodipine',
        code_substance_code: 'C08CA01',
        forme_galenique: 'Comprimé',
        dosage: '5',
        unite_dosage: 'mg',
        posologie_texte: '1 comprimé le matin',
        frequence: '1x/jour',
        duree_jour: 90,
        statut: 'annule',
        prescripteur: 'Dr. Koffi Mensah',
        specialite_prescripteur: 'Cardiologie',
        date_prescription: new Date('2023-05-20'),
        visite_id: 'VST-3500',
        renouvelable: true,
        verifie_ia: false,
    },
    {
        uuid: 'presc-010',
        type: 'scanner',
        libelle: 'Scanner thoracique avec injection',
        code_substance_code: 'SCAN-THOR',
        instructions_speciales: 'Bilan de créatinine requis avant injection. Arrêt Metformine 48h avant.',
        statut: 'annule',
        prescripteur: 'Dr. Gaston Dossou',
        specialite_prescripteur: 'Pneumologie',
        date_prescription: new Date('2023-06-15'),
        verifie_ia: false,
    },
];