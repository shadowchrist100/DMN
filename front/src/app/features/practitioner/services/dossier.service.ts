import { Injectable } from '@angular/core';

export type AllergieSeverite = 'severe' | 'moderee' | 'legere';
export type AllergieStatut = 'active' | 'resolue';
export type AllergieType = 'medicamenteuse' | 'alimentaire' | 'respiratoire' | 'cutanee';

export interface Allergie {
  id: string;
  nom: string;
  type: AllergieType;
  severite: AllergieSeverite;
  statut: AllergieStatut;
  reaction: string;
  dateDiagnostic: Date;
  notes?: string;
}

export interface AnalyseResultat {
  label: string;
  valeur: string;
  unite: string;
  norme: string;
  horsNorme: boolean;
}

export interface Examen {
  id: string;
  type: 'analyse' | 'imagerie' | 'ecg';
  nom: string;
  description: string;
  date: Date;
  prescripteur: string;
  laboratoire: string;
  statut: 'en_cours' | 'valide' | 'anormal';
  resultats?: AnalyseResultat[];
  conclusion?: string;
}

export interface EvenementHistorique {
  id: string;
  type: 'consultation' | 'hospitalisation' | 'analyse' | 'vaccination' | 'prescription';
  titre: string;
  description: string;
  date: Date;
  medecin: string;
  etablissement: string;
  statut: string;
}

export interface Pathologie {
  id: string;
  code: string;
  nom: string;
  type: 'chronique' | 'aigue' | 'antecedent';
  statut: 'active' | 'controlee' | 'resolue';
  severite: string;
  dateDiagnostic: Date;
  dateResolution?: Date;
  notes?: string;
}

export interface Traitement {
  id: string;
  medicament: string;
  dosage: string;
  forme: string;
  frequence: string;
  voie: string;
  dateDebut: Date;
  dateFin: Date;
  statut: 'actif' | 'a_expirer' | 'termine';
  prescripteur: string;
  diagnosticAssocie?: string;
  renouvelable: boolean;
}

export interface Vaccin {
  id: string;
  nom: string;
  statut: 'a_jour' | 'rappel_du' | 'en_retard' | 'non_fait';
  doses: number;
  dosesRequises: number;
  derniereDose?: Date;
  prochainRappel?: Date;
  dateValidite?: Date;
  effetsIndesirables?: string;
}

@Injectable({ providedIn: 'root' })
export class DossierService {
  getAllergies(): Promise<Allergie[]> {
    return Promise.resolve([
      {
        id: 'ALL-001',
        nom: 'Pénicilline',
        type: 'medicamenteuse',
        severite: 'severe',
        statut: 'active',
        reaction: 'Choc anaphylactique (œdème de Quincke, hypotension)',
        dateDiagnostic: new Date('2015-03-12'),
        notes: 'Contre-indication formelle aux bêta-lactamines. Carte d\'allergie délivrée.',
      },
      {
        id: 'ALL-002',
        nom: 'Arachides',
        type: 'alimentaire',
        severite: 'moderee',
        statut: 'active',
        reaction: 'Urticaire généralisée, prurit buccal',
        dateDiagnostic: new Date('2018-07-22'),
      },
      {
        id: 'ALL-003',
        nom: 'Lactose',
        type: 'alimentaire',
        severite: 'legere',
        statut: 'active',
        reaction: 'Troubles digestifs (ballonnements, diarrhée)',
        dateDiagnostic: new Date('2020-01-15'),
      },
      {
        id: 'ALL-004',
        nom: 'Amoxicilline',
        type: 'medicamenteuse',
        severite: 'moderee',
        statut: 'resolue',
        reaction: 'Éruption cutanée maculo-papuleuse',
        dateDiagnostic: new Date('2019-11-08'),
        notes: 'Fausse alerte — test de provocation négatif (2023)',
      },
    ]);
  }

  getExamens(): Promise<Examen[]> {
    return Promise.resolve([
      {
        id: 'EXM-001',
        type: 'analyse',
        nom: 'Bilan Lipidique',
        description: 'Profil lipidique complet (CT, HDL, LDL, TG)',
        date: new Date('2024-10-05'),
        prescripteur: 'Dr. S. AGOSSA',
        laboratoire: 'Laboratoire National de Santé Publique',
        statut: 'anormal',
        resultats: [
          { label: 'Cholestérol total', valeur: '2.45', unite: 'g/L', norme: '1.50 - 2.20', horsNorme: true },
          { label: 'HDL Cholestérol', valeur: '0.45', unite: 'g/L', norme: '> 0.40', horsNorme: false },
          { label: 'LDL Cholestérol', valeur: '1.60', unite: 'g/L', norme: '< 1.30', horsNorme: true },
          { label: 'Triglycérides', valeur: '1.80', unite: 'g/L', norme: '< 1.50', horsNorme: true },
        ],
        conclusion: 'Hyperlipidémie mixte confirmée. Poursuite atorvastatine. Contrôle dans 3 mois.',
      },
      {
        id: 'EXM-002',
        type: 'analyse',
        nom: 'Numération Formule Sanguine',
        description: 'NFS complète',
        date: new Date('2024-10-05'),
        prescripteur: 'Dr. S. AGOSSA',
        laboratoire: 'Laboratoire National de Santé Publique',
        statut: 'valide',
        resultats: [
          { label: 'Hémoglobine', valeur: '14.2', unite: 'g/dL', norme: '13.0 - 17.0', horsNorme: false },
          { label: 'Globules Blancs', valeur: '7500', unite: '/mm³', norme: '4000 - 10000', horsNorme: false },
          { label: 'Plaquettes', valeur: '280000', unite: '/mm³', norme: '150000 - 450000', horsNorme: false },
        ],
        conclusion: 'Bilan sans anomalie significative.',
      },
      {
        id: 'EXM-003',
        type: 'analyse',
        nom: 'Bilan Rénal',
        description: 'Créatinine, urée, ionogramme',
        date: new Date('2024-09-15'),
        prescripteur: 'Dr. S. AGOSSA',
        laboratoire: 'Laboratoire National de Santé Publique',
        statut: 'valide',
        resultats: [
          { label: 'Créatinine', valeur: '9.5', unite: 'mg/L', norme: '7.0 - 12.0', horsNorme: false },
          { label: 'Urée', valeur: '0.35', unite: 'g/L', norme: '0.20 - 0.45', horsNorme: false },
        ],
        conclusion: 'Fonction rénale normale.',
      },
      {
        id: 'EXM-004',
        type: 'analyse',
        nom: 'Glycémie à Jeun',
        description: 'Glycémie veineuse à jeun',
        date: new Date('2024-10-05'),
        prescripteur: 'Dr. S. AGOSSA',
        laboratoire: 'Laboratoire National de Santé Publique',
        statut: 'anormal',
        resultats: [
          { label: 'Glycémie', valeur: '1.12', unite: 'g/L', norme: '0.70 - 1.10', horsNorme: true },
        ],
        conclusion: 'Glycémie à jeun légèrement élevée. Surveillance diététique. Contrôle dans 3 mois.',
      },
      {
        id: 'EXM-005',
        type: 'imagerie',
        nom: 'Radiographie Thoracique',
        description: 'Cliché thoracique face + profil',
        date: new Date('2024-08-20'),
        prescripteur: 'Dr. K. KOUANDETÉ',
        laboratoire: 'Centre d\'Imagerie Médicale Calavi',
        statut: 'valide',
        conclusion: 'Cardiomégalie modérée. Pas de foyer pulmonaire. Poursuite surveillance HTA.',
      },
      {
        id: 'EXM-006',
        type: 'imagerie',
        nom: 'Échographie Cardiaque',
        description: 'Échocardiographie transthoracique',
        date: new Date('2024-06-10'),
        prescripteur: 'Dr. K. KOUANDETÉ',
        laboratoire: 'CNHU-HKM Cotonou',
        statut: 'valide',
        conclusion: 'Hypertrophie ventriculaire gauche modérée. Fraction d\'éjection préservée (55%).',
      },
      {
        id: 'EXM-007',
        type: 'ecg',
        nom: 'ECG de Repos',
        description: 'Électrocardiogramme 12 dérivations',
        date: new Date('2024-08-20'),
        prescripteur: 'Dr. S. AGOSSA',
        laboratoire: 'Hôpital de Zone Calavi',
        statut: 'en_cours',
        conclusion: 'Rythme sinusal régulier. Signes d\'hypertrophie ventriculaire gauche. Pas d\'ischémie.',
      },
    ]);
  }

  getHistorique(): Promise<EvenementHistorique[]> {
    return Promise.resolve([
      {
        id: 'EVT-001',
        type: 'consultation',
        titre: 'Consultation Générale',
        description: 'Suivi HTA — TA 145/92. Céphalées matinales. Observance confirmée.',
        date: new Date('2024-10-12'),
        medecin: 'Dr. S. AGOSSA',
        etablissement: 'Hôpital de Zone Calavi',
        statut: 'Finalisé',
      },
      {
        id: 'EVT-002',
        type: 'analyse',
        titre: 'Bilan de Routine',
        description: 'Glycémie 1.12 g/L. Bilan lipidique anormal. NFS normale.',
        date: new Date('2024-10-05'),
        medecin: 'Dr. S. AGOSSA',
        etablissement: 'Laboratoire National de Santé Publique',
        statut: 'Validé',
      },
      {
        id: 'EVT-003',
        type: 'prescription',
        titre: 'Renouvellement Ordonnance',
        description: 'Amlodipine 5mg + Atorvastatine 20mg. 3 mois.',
        date: new Date('2024-09-15'),
        medecin: 'Dr. S. AGOSSA',
        etablissement: 'Hôpital de Zone Calavi',
        statut: 'Signé',
      },
      {
        id: 'EVT-004',
        type: 'consultation',
        titre: 'Consultation Cardiologie',
        description: 'Suivi cardiologique annuel. Échographie cardiaque prescrite.',
        date: new Date('2024-08-20'),
        medecin: 'Dr. K. KOUANDETÉ',
        etablissement: 'CNHU-HKM Cotonou',
        statut: 'Finalisé',
      },
      {
        id: 'EVT-005',
        type: 'analyse',
        titre: 'Bilan Rénal',
        description: 'Créatinine 9.5 mg/L. Urée 0.35 g/L. Fonction rénale normale.',
        date: new Date('2024-09-15'),
        medecin: 'Dr. S. AGOSSA',
        etablissement: 'Laboratoire National de Santé Publique',
        statut: 'Validé',
      },
      {
        id: 'EVT-006',
        type: 'hospitalisation',
        titre: 'Appendicectomie',
        description: 'Hospitalisation pour appendicite aiguë. Intervention sans complication.',
        date: new Date('2023-04-18'),
        medecin: 'Dr. A. HOUNKPE',
        etablissement: 'CNHU-HKM Cotonou',
        statut: 'Sorti',
      },
    ]);
  }

  getPathologies(): Promise<Pathologie[]> {
    return Promise.resolve([
      {
        id: 'PAT-001',
        code: 'I10',
        nom: 'Hypertension artérielle essentielle',
        type: 'chronique',
        statut: 'active',
        severite: 'Modérée',
        dateDiagnostic: new Date('2018-03-15'),
      },
      {
        id: 'PAT-002',
        code: 'E78.0',
        nom: 'Hypercholestérolémie essentielle',
        type: 'chronique',
        statut: 'controlee',
        severite: 'Légère',
        dateDiagnostic: new Date('2020-06-22'),
      },
      {
        id: 'PAT-003',
        code: 'M54.5',
        nom: 'Lombalgie basse',
        type: 'aigue',
        statut: 'active',
        severite: 'Modérée',
        dateDiagnostic: new Date('2024-08-10'),
      },
      {
        id: 'PAT-004',
        code: 'K35.8',
        nom: 'Appendicite aiguë',
        type: 'antecedent',
        statut: 'resolue',
        severite: 'Sévère',
        dateDiagnostic: new Date('2023-04-18'),
        dateResolution: new Date('2023-04-25'),
      },
      {
        id: 'PAT-005',
        code: 'U07.1',
        nom: 'COVID-19',
        type: 'antecedent',
        statut: 'resolue',
        severite: 'Modérée',
        dateDiagnostic: new Date('2021-03-02'),
        dateResolution: new Date('2021-03-16'),
      },
    ]);
  }

  getTraitements(): Promise<Traitement[]> {
    return Promise.resolve([
      {
        id: 'TRT-001',
        medicament: 'Amlodipine',
        dosage: '5',
        forme: 'comprimé',
        frequence: '1 cp/jour le matin',
        voie: 'orale',
        dateDebut: new Date('2024-09-15'),
        dateFin: new Date('2024-12-14'),
        statut: 'actif',
        prescripteur: 'Dr. S. AGOSSA',
        diagnosticAssocie: 'I10 — Hypertension artérielle',
        renouvelable: true,
      },
      {
        id: 'TRT-002',
        medicament: 'Atorvastatine',
        dosage: '20',
        forme: 'comprimé',
        frequence: '1 cp/jour le soir',
        voie: 'orale',
        dateDebut: new Date('2024-09-15'),
        dateFin: new Date('2025-03-14'),
        statut: 'actif',
        prescripteur: 'Dr. S. AGOSSA',
        diagnosticAssocie: 'E78.0 — Hypercholestérolémie',
        renouvelable: true,
      },
      {
        id: 'TRT-003',
        medicament: 'Aspégic',
        dosage: '100',
        forme: 'comprimé',
        frequence: '1 cp/jour',
        voie: 'orale',
        dateDebut: new Date('2024-04-15'),
        dateFin: new Date('2024-10-15'),
        statut: 'a_expirer',
        prescripteur: 'Dr. K. KOUANDETÉ',
        diagnosticAssocie: 'I25.1 — Maladie coronarienne',
        renouvelable: true,
      },
    ]);
  }

  getVaccins(): Promise<Vaccin[]> {
    return Promise.resolve([
      {
        id: 'VAC-001',
        nom: 'COVID-19',
        statut: 'a_jour',
        doses: 3,
        dosesRequises: 3,
        derniereDose: new Date('2023-10-15'),
        effetsIndesirables: 'Aucun',
      },
      {
        id: 'VAC-002',
        nom: 'Fièvre Jaune',
        statut: 'a_jour',
        doses: 1,
        dosesRequises: 1,
        derniereDose: new Date('2020-03-10'),
        dateValidite: new Date('2030-03-10'),
      },
      {
        id: 'VAC-003',
        nom: 'Grippe Saisonnière',
        statut: 'a_jour',
        doses: 1,
        dosesRequises: 1,
        derniereDose: new Date('2024-04-05'),
        prochainRappel: new Date('2025-04-05'),
      },
      {
        id: 'VAC-004',
        nom: 'Hépatite B',
        statut: 'a_jour',
        doses: 3,
        dosesRequises: 3,
        derniereDose: new Date('2019-11-20'),
      },
      {
        id: 'VAC-005',
        nom: 'Tétanos (dT)',
        statut: 'rappel_du',
        doses: 1,
        dosesRequises: 1,
        derniereDose: new Date('2018-06-15'),
        prochainRappel: new Date('2023-06-15'),
      },
      {
        id: 'VAC-006',
        nom: 'BCG',
        statut: 'a_jour',
        doses: 1,
        dosesRequises: 1,
        derniereDose: new Date('1986-01-01'),
        effetsIndesirables: 'Cicatrice vaccinale',
      },
    ]);
  }
}
