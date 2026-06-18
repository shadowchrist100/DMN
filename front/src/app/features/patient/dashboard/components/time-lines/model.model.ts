// ─── Types de base ─────────────────────────────────────────────────────────────

export type EventType =
    | 'consultation'
    | 'prescription'
    | 'lab_result'
    | 'vaccination'
    | 'hospitalization'
    | 'imaging'
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
    dateRange: 'all' | 'month' | '6months' | 'year' | 'custom';
    searchTerm?: string;
    eventType?: EventType | null;
    eventTypes?: EventType[];
    priorities?: Priority[];
    facilities?: string[];
    showOnlyAlerts?: boolean;
    eventIds?: string[];
}

