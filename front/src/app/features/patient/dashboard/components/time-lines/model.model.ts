// ─── Types de base ─────────────────────────────────────────────────────────────

export type EventType =
    | 'consultation'
    | 'prescription'
    | 'lab_result'
    | 'vaccination'
    | 'hospitalization'
    | 'alert';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type AttachmentType = 'pdf' | 'image' | 'other';

// ─── Sous-modèles ──────────────────────────────────────────────────────────────

export interface Practitioner {
    id: string;
    name: string;
    specialty?: string;
    rpps?: string; // Numéro RPPS (identifiant national praticien)
}

export interface Attachment {
    id: string;
    name: string;
    type: AttachmentType;
    url?: string;
    sizeKb?: number;
    uploadedAt?: Date | string;
}

/**
 * Une mesure issue d'un bilan (ex: glycémie, tension, IMC…).
 * normalMin / normalMax permettent d'afficher les barres de progression
 * avec indication visuelle hors-norme.
 */
export interface Measurement {
    name: string;        // ex: "Glycémie à jeun"
    value: number;       // valeur mesurée
    unit: string;        // ex: "g/L", "mmHg", "kg/m²"
    normalMin?: number;  // borne basse de la plage normale
    normalMax?: number;  // borne haute de la plage normale
    comment?: string;    // remarque du biologiste / médecin
}

export interface Medication {
    name: string;       // DCI ou nom commercial
    dosage?: string;    // ex: "500 mg"
    frequency?: string; // ex: "2x/jour"
    durationDays?: number;
    refillable?: boolean;
}

export interface Vaccine {
    name: string;         // ex: "Tdca-Polio (Repevax)"
    lot?: string;         // numéro de lot
    dose?: number;        // numéro de dose dans le schéma (1, 2, rappel…)
    site?: string;        // ex: "Bras gauche"
    nextDoseDate?: Date | string;
}

export interface LabPanel {
    name: string;          // ex: "NFS", "Bilan lipidique"
    measurements: Measurement[];
}

export interface HospitalizationDetails {
    ward?: string;           // ex: "Cardiologie"
    entryDate: Date | string;
    dischargeDate?: Date | string;
    diagnosis?: string;
    surgeries?: string[];
    crf?: string;            // compte rendu de fin d'hospitalisation (URL ou contenu)
}

// ─── Modèle principal ──────────────────────────────────────────────────────────

export interface TimelineEvent {
    // ── Identité ──────────────────────────────────────────────────────────
    id: string;
    type: EventType;
    priority: Priority;

    // ── Quand / Où / Qui ──────────────────────────────────────────────────
    date: Date | string;
    facility: string;         // établissement ou cabinet
    practitioner: Practitioner;

    // ── Contenu principal ─────────────────────────────────────────────────
    title: string;
    description?: string;

    // ── Données spécifiques selon le type ─────────────────────────────────

    /** Consultation : compte rendu libre */
    reportUrl?: string;

    /** Ordonnance : liste des médicaments prescrits */
    medications?: Medication[];

    /** Ordonnance : URL du PDF de l'ordonnance */
    prescriptionUrl?: string;

    /** Analyses : panneaux regroupant les mesures */
    labPanels?: LabPanel[];

    /**
     * Analyses (accès rapide à plat) : toutes les mesures sans regroupement.
     * Utilisé par les barres de progression dans la timeline.
     */
    measurements?: Measurement[];

    /** Vaccination */
    vaccine?: Vaccine;

    /** Hospitalisation */
    hospitalization?: HospitalizationDetails;

    // ── Pièces jointes génériques ─────────────────────────────────────────
    attachments?: Attachment[];

    // ── Métadonnées ───────────────────────────────────────────────────────
    tags?: string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy?: string;       // id du praticien qui a saisi l'événement
    isConfidential?: boolean; // masqué pour certains rôles
    source?: 'manual' | 'import' | 'device'; // origine de la donnée
}

// ─── Filtre timeline ───────────────────────────────────────────────────────────

export interface TimelineFilter {
    dateRange: 'all' | 'month' | '3months' | '6months' | 'year';
    searchTerm?: string;
    eventType?: EventType | null;
    eventTypes?: EventType[];
    priorities?: Priority[];
    facilities?: string[];
    showOnlyAlerts?: boolean;
    eventIds?: string[];
}

// ─── Données mock ──────────────────────────────────────────────────────────────

export const MOCK_TIMELINE: TimelineEvent[] = [
    {
        id: 'evt-001',
        type: 'lab_result',
        priority: 'high',
        date: new Date('2025-11-12T08:30:00'),
        facility: 'Laboratoire BioAfrique, Cotonou',
        practitioner: { id: 'prat-01', name: 'Dr. Adéola MENSAH', specialty: 'Biologiste' },
        title: 'Bilan sanguin complet — NFS + Biochimie',
        description: 'Contrôle de suivi post-traitement. Légère anémie normocytaire et glycémie limite.',
        labPanels: [
            {
                name: 'Numération Formule Sanguine',
                measurements: [
                    { name: 'Hémoglobine', value: 10.8, unit: 'g/dL', normalMin: 12, normalMax: 17 },
                    { name: 'Hématocrite', value: 33, unit: '%', normalMin: 36, normalMax: 52 },
                    { name: 'Globules blancs', value: 6.2, unit: 'G/L', normalMin: 4, normalMax: 10 },
                    { name: 'Plaquettes', value: 210, unit: 'G/L', normalMin: 150, normalMax: 400 },
                ],
            },
            {
                name: 'Biochimie',
                measurements: [
                    { name: 'Glycémie à jeun', value: 1.18, unit: 'g/L', normalMin: 0.70, normalMax: 1.10 },
                    { name: 'Créatinine', value: 82, unit: 'µmol/L', normalMin: 60, normalMax: 110 },
                    { name: 'Cholestérol LDL', value: 1.4, unit: 'g/L', normalMin: 0, normalMax: 1.60 },
                ],
            },
        ],
        measurements: [
            { name: 'Hémoglobine', value: 10.8, unit: 'g/dL', normalMin: 12, normalMax: 17 },
            { name: 'Glycémie à jeun', value: 1.18, unit: 'g/L', normalMin: 0.70, normalMax: 1.10 },
            { name: 'Globules blancs', value: 6.2, unit: 'G/L', normalMin: 4, normalMax: 10 },
            { name: 'Plaquettes', value: 210, unit: 'G/L', normalMin: 150, normalMax: 400 },
            { name: 'Créatinine', value: 82, unit: 'µmol/L', normalMin: 60, normalMax: 110 },
        ],
        attachments: [
            { id: 'att-001', name: 'Résultats NFS.pdf', type: 'pdf', sizeKb: 420 },
        ],
        tags: ['anémie', 'glycémie', 'suivi'],
        source: 'manual',
        createdAt: new Date('2025-11-12T09:00:00'),
    },
    {
        id: 'evt-002',
        type: 'consultation',
        priority: 'medium',
        date: new Date('2025-10-03T10:00:00'),
        facility: 'Clinique Les Cocotiers, Cotonou',
        practitioner: { id: 'prat-02', name: 'Dr. Romuald AGOSSOU', specialty: 'Médecin généraliste' },
        title: 'Consultation de suivi — Anémie ferriprive',
        description: 'Le patient présente une fatigue persistante. Bilan prescrit. Supplémentation en fer recommandée. Réévaluation dans 6 semaines.',
        reportUrl: '/reports/evt-002.pdf',
        attachments: [
            { id: 'att-002', name: 'Compte rendu consultation.pdf', type: 'pdf', sizeKb: 180 },
        ],
        tags: ['fatigue', 'anémie', 'suivi'],
        source: 'manual',
        createdAt: new Date('2025-10-03T11:30:00'),
    },
    {
        id: 'evt-003',
        type: 'prescription',
        priority: 'medium',
        date: new Date('2025-10-03T11:15:00'),
        facility: 'Clinique Les Cocotiers, Cotonou',
        practitioner: { id: 'prat-02', name: 'Dr. Romuald AGOSSOU', specialty: 'Médecin généraliste' },
        title: 'Ordonnance — Supplémentation fer + vitamines',
        description: 'Traitement de 3 mois. Prise avec jus d\'orange pour favoriser l\'absorption.',
        medications: [
            { name: 'Tardyferon', dosage: '80 mg', frequency: '1 cp/jour', durationDays: 90, refillable: false },
            { name: 'Vitamine C', dosage: '500 mg', frequency: '2x/jour', durationDays: 90, refillable: true },
            { name: 'Acide folique', dosage: '5 mg', frequency: '1 cp/jour', durationDays: 30, refillable: false },
        ],
        prescriptionUrl: '/prescriptions/evt-003.pdf',
        tags: ['fer', 'vitamines'],
        source: 'manual',
    },
    {
        id: 'evt-004',
        type: 'vaccination',
        priority: 'low',
        date: new Date('2025-08-20T09:00:00'),
        facility: 'Centre de Santé de Godomey',
        practitioner: { id: 'prat-03', name: 'Inf. Clarisse HOUNTO', specialty: 'Infirmière' },
        title: 'Vaccination — Fièvre typhoïde (rappel)',
        description: 'Rappel décennal. Pas de réaction locale signalée.',
        vaccine: {
            name: 'Typherix (GSK)',
            lot: 'ABCDE1234',
            dose: 2,
            site: 'Bras gauche (deltoïde)',
            nextDoseDate: new Date('2035-08-20'),
        },
        tags: ['vaccin', 'typhoïde', 'rappel'],
        source: 'import',
    },
    {
        id: 'evt-005',
        type: 'hospitalization',
        priority: 'critical',
        date: new Date('2025-06-10T14:00:00'),
        facility: 'CNHU-HKM Cotonou',
        practitioner: { id: 'prat-04', name: 'Dr. Gaston DOSSOU', specialty: 'Hématologue' },
        title: 'Hospitalisation — Crise drépanocytaire (J3)',
        description: 'Admission en urgence pour douleurs thoraciques aiguës. Prise en charge par hydratation IV, antalgiques et transfusion.',
        hospitalization: {
            ward: 'Hématologie',
            entryDate: new Date('2025-06-10T14:00:00'),
            dischargeDate: new Date('2025-06-17T11:00:00'),
            diagnosis: 'Crise vaso-occlusive — drépanocytose SS',
            surgeries: [],
            crf: '/reports/evt-005-crf.pdf',
        },
        attachments: [
            { id: 'att-005a', name: 'Compte rendu hospitalisation.pdf', type: 'pdf', sizeKb: 980 },
            { id: 'att-005b', name: 'Radio thorax.jpg', type: 'image', sizeKb: 1200 },
        ],
        tags: ['drépanocytose', 'urgence', 'hospitalisation'],
        source: 'import',
        createdAt: new Date('2025-06-17T12:00:00'),
    },
    {
        id: 'evt-006',
        type: 'alert',
        priority: 'critical',
        date: new Date('2025-06-09T03:15:00'),
        facility: 'CNHU-HKM Cotonou — Urgences',
        practitioner: { id: 'prat-05', name: 'Dr. Félicia KPADE', specialty: 'Urgentiste' },
        title: '⚠️ Alerte — Saturation O₂ critique (SpO₂ < 88%)',
        description: 'Détresse respiratoire aiguë. Pose d\'oxygénothérapie 6 L/min. Transfert en hématologie.',
        tags: ['urgence', 'oxygène', 'alerte'],
        source: 'device',
    },
];