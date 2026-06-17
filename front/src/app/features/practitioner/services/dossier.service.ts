import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MedicalPractitionerService } from './medical-practitioner.service';
import { MedicalService } from '../../patient/services/medical.service';

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

const SEVERITE_MAP: Record<string, AllergieSeverite> = {
  'Élevée': 'severe',
  'haute': 'severe',
  'Modérée': 'moderee',
  'Basse': 'legere',
  'legere': 'legere',
};

const STATUT_MAP: Record<string, AllergieStatut> = {
  'Allergie Active': 'active',
  'active': 'active',
  'Actif': 'active',
  'Confirmé': 'active',
  'Suspecté': 'active',
  'Résolu': 'resolue',
  'resolue': 'resolue',
};

@Injectable({ providedIn: 'root' })
export class DossierService {
  private medicalPrac = inject(MedicalPractitionerService);
  private medical = inject(MedicalService);

  getAllergies(patientUserId?: string): Promise<Allergie[]> {
    if (!patientUserId) return Promise.resolve(MOCK_ALLERGIES);
    return firstValueFrom(this.medical.getAllergies(patientUserId)).then(dtos =>
      dtos.map(dto => ({
        id: dto.id,
        nom: dto.substance,
        type: this.mapAllergieType(dto.categorie),
        severite: SEVERITE_MAP[dto.criticite.toLowerCase()] || 'moderee',
        statut: STATUT_MAP[dto.statut_clinique.toLowerCase()] || 'active',
        reaction: dto.reactions.join(', ') || '',
        dateDiagnostic: new Date(dto.date_declaration),
        notes: dto.notes || undefined,
      }))
    );
  }

  getExamens(patientUserId?: string): Promise<Examen[]> {
    if (!patientUserId) return Promise.resolve(MOCK_EXAMENS);
    return firstValueFrom(this.medical.getExamens(patientUserId)).then(dtos =>
      dtos.map(dto => ({
        id: dto.uuid,
        type: 'analyse' as const,
        nom: dto.libelle_examen,
        description: dto.interpretation,
        date: dto.date_realisation ? new Date(dto.date_realisation) : new Date(),
        prescripteur: '',
        laboratoire: '',
        statut: (dto.valeur && dto.valeur !== '—' ? 'valide' : 'en_cours') as 'valide' | 'en_cours',
        conclusion: dto.interpretation,
      }))
    );
  }

  getHistorique(patientUserId?: string): Promise<EvenementHistorique[]> {
    if (!patientUserId) return Promise.resolve(MOCK_HISTORIQUE);
    return firstValueFrom(this.medicalPrac.getPatientConsultations(patientUserId)).then(dtos =>
      dtos.map(dto => ({
        id: dto.id,
        type: 'consultation' as const,
        titre: 'Consultation',
        description: dto.raisons || dto.rapport_text || '',
        date: new Date(),
        medecin: dto.practitioner_name || '',
        etablissement: dto.healthcare_nom || '',
        statut: 'Finalisé',
      }))
    );
  }

  getPathologies(patientUserId?: string): Promise<Pathologie[]> {
    if (!patientUserId) return Promise.resolve(MOCK_PATHOLOGIES);
    return firstValueFrom(this.medicalPrac.getPatientPathologies(patientUserId)).then(dtos =>
      dtos.map(dto => ({
        id: dto.id,
        code: dto.code_cim || '',
        nom: dto.libelle || '',
        type: 'chronique' as const,
        statut: (dto.statut_verification === 'CONFIRMED' ? 'active' : 'resolue') as 'active' | 'resolue',
        severite: 'Modérée',
        dateDiagnostic: new Date(dto.date),
        notes: dto.note_clinique || undefined,
      }))
    );
  }

  getTraitements(_patientUserId?: string): Promise<Traitement[]> {
    return Promise.resolve(MOCK_TRAITEMENTS);
  }

  getVaccins(patientUserId?: string): Promise<Vaccin[]> {
    if (!patientUserId) return Promise.resolve(MOCK_VACCINS);
    return firstValueFrom(this.medicalPrac.getPatientVaccinations(patientUserId)).then(dtos =>
      dtos.map(dto => ({
        id: dto.id,
        nom: `Vaccination ${dto.batch_number || ''}`,
        statut: 'a_jour' as const,
        doses: dto.sequence_dose || 1,
        dosesRequises: 1,
        derniereDose: undefined,
        prochainRappel: dto.next_reminder ? new Date(dto.next_reminder) : undefined,
        effetsIndesirables: dto.note || undefined,
      }))
    );
  }

  private mapAllergieType(categorie: string): AllergieType {
    const lower = categorie.toLowerCase();
    if (lower.includes('médicament') || lower.includes('medicament')) return 'medicamenteuse';
    if (lower.includes('aliment')) return 'alimentaire';
    if (lower.includes('environnement') || lower.includes('respiratoire')) return 'respiratoire';
    return 'cutanee';
  }
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ALLERGIES: Allergie[] = [
  { id: 'ALL-001', nom: 'Pénicilline', type: 'medicamenteuse', severite: 'severe', statut: 'active', reaction: 'Choc anaphylactique (oedème de Quincke, hypotension)', dateDiagnostic: new Date('2015-03-12'), notes: 'Contre-indication formelle aux bêta-lactamines.' },
  { id: 'ALL-002', nom: 'Arachides', type: 'alimentaire', severite: 'moderee', statut: 'active', reaction: 'Urticaire généralisée, prurit buccal', dateDiagnostic: new Date('2018-07-22') },
  { id: 'ALL-003', nom: 'Lactose', type: 'alimentaire', severite: 'legere', statut: 'active', reaction: 'Troubles digestifs', dateDiagnostic: new Date('2020-01-15') },
];

const MOCK_EXAMENS: Examen[] = [
  { id: 'EXM-001', type: 'analyse', nom: 'Bilan Lipidique', description: 'Profil lipidique complet', date: new Date('2024-10-05'), prescripteur: 'Dr. S. AGOSSA', laboratoire: 'Labo National', statut: 'anormal', resultats: [{ label: 'Cholestérol total', valeur: '2.45', unite: 'g/L', norme: '1.50 - 2.20', horsNorme: true }], conclusion: 'Hyperlipidémie mixte confirmée.' },
  { id: 'EXM-002', type: 'analyse', nom: 'NFS', description: 'Numération Formule Sanguine', date: new Date('2024-10-05'), prescripteur: 'Dr. S. AGOSSA', laboratoire: 'Labo National', statut: 'valide', resultats: [{ label: 'Hémoglobine', valeur: '14.2', unite: 'g/dL', norme: '13.0 - 17.0', horsNorme: false }], conclusion: 'Bilan sans anomalie.' },
  { id: 'EXM-003', type: 'analyse', nom: 'Glycémie à Jeun', description: 'Glycémie veineuse à jeun', date: new Date('2024-10-05'), prescripteur: 'Dr. S. AGOSSA', laboratoire: 'Labo National', statut: 'anormal', resultats: [{ label: 'Glycémie', valeur: '1.12', unite: 'g/L', norme: '0.70 - 1.10', horsNorme: true }], conclusion: 'Glycémie légèrement élevée.' },
  { id: 'EXM-004', type: 'imagerie', nom: 'Radiographie Thoracique', description: 'Cliché thoracique face + profil', date: new Date('2024-08-20'), prescripteur: 'Dr. K. KOUANDETÉ', laboratoire: 'CIM Calavi', statut: 'valide', conclusion: 'Cardiomégalie modérée.' },
  { id: 'EXM-005', type: 'ecg', nom: 'ECG de Repos', description: '12 dérivations', date: new Date('2024-08-20'), prescripteur: 'Dr. S. AGOSSA', laboratoire: 'Hôpital de Zone Calavi', statut: 'en_cours', conclusion: 'Rythme sinusal régulier.' },
];

const MOCK_HISTORIQUE: EvenementHistorique[] = [
  { id: 'EVT-001', type: 'consultation', titre: 'Consultation Générale', description: 'Suivi HTA -- TA 145/92.', date: new Date('2024-10-12'), medecin: 'Dr. S. AGOSSA', etablissement: 'Hôpital de Zone Calavi', statut: 'Finalisé' },
  { id: 'EVT-002', type: 'analyse', titre: 'Bilan de Routine', description: 'Glycémie 1.12 g/L.', date: new Date('2024-10-05'), medecin: 'Dr. S. AGOSSA', etablissement: 'Labo National', statut: 'Validé' },
  { id: 'EVT-003', type: 'prescription', titre: 'Renouvellement Ordonnance', description: 'Amlodipine 5mg + Atorvastatine 20mg.', date: new Date('2024-09-15'), medecin: 'Dr. S. AGOSSA', etablissement: 'Hôpital de Zone Calavi', statut: 'Signé' },
  { id: 'EVT-004', type: 'hospitalisation', titre: 'Appendicectomie', description: 'Intervention sans complication.', date: new Date('2023-04-18'), medecin: 'Dr. A. HOUNKPE', etablissement: 'CNHU-HKM Cotonou', statut: 'Sorti' },
];

const MOCK_PATHOLOGIES: Pathologie[] = [
  { id: 'PAT-001', code: 'I10', nom: 'Hypertension artérielle essentielle', type: 'chronique', statut: 'active', severite: 'Modérée', dateDiagnostic: new Date('2018-03-15') },
  { id: 'PAT-002', code: 'E78.0', nom: 'Hypercholestérolémie essentielle', type: 'chronique', statut: 'controlee', severite: 'Légère', dateDiagnostic: new Date('2020-06-22') },
  { id: 'PAT-003', code: 'K35.8', nom: 'Appendicite aiguë', type: 'antecedent', statut: 'resolue', severite: 'Sévère', dateDiagnostic: new Date('2023-04-18'), dateResolution: new Date('2023-04-25') },
];

const MOCK_TRAITEMENTS: Traitement[] = [
  { id: 'TRT-001', medicament: 'Amlodipine', dosage: '5', forme: 'comprimé', frequence: '1 cp/jour le matin', voie: 'orale', dateDebut: new Date('2024-09-15'), dateFin: new Date('2024-12-14'), statut: 'actif', prescripteur: 'Dr. S. AGOSSA', diagnosticAssocie: 'I10', renouvelable: true },
  { id: 'TRT-002', medicament: 'Atorvastatine', dosage: '20', forme: 'comprimé', frequence: '1 cp/jour le soir', voie: 'orale', dateDebut: new Date('2024-09-15'), dateFin: new Date('2025-03-14'), statut: 'actif', prescripteur: 'Dr. S. AGOSSA', diagnosticAssocie: 'E78.0', renouvelable: true },
  { id: 'TRT-003', medicament: 'Aspégic', dosage: '100', forme: 'comprimé', frequence: '1 cp/jour', voie: 'orale', dateDebut: new Date('2024-04-15'), dateFin: new Date('2024-10-15'), statut: 'a_expirer', prescripteur: 'Dr. K. KOUANDETÉ', diagnosticAssocie: 'I25.1', renouvelable: true },
];

const MOCK_VACCINS: Vaccin[] = [
  { id: 'VAC-001', nom: 'COVID-19', statut: 'a_jour', doses: 3, dosesRequises: 3, derniereDose: new Date('2023-10-15') },
  { id: 'VAC-002', nom: 'Fièvre Jaune', statut: 'a_jour', doses: 1, dosesRequises: 1, derniereDose: new Date('2020-03-10') },
  { id: 'VAC-003', nom: 'Grippe Saisonnière', statut: 'a_jour', doses: 1, dosesRequises: 1, derniereDose: new Date('2024-04-05') },
  { id: 'VAC-004', nom: 'Tétanos (dT)', statut: 'rappel_du', doses: 1, dosesRequises: 1, derniereDose: new Date('2018-06-15'), prochainRappel: new Date('2023-06-15') },
];
