import { Component, signal, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalPractitionerService } from '../../services/medical-practitioner.service';
import { AuthStore } from '../../../../core/auth/auth.store';
import type {
  VitalConstantRefDTO, DiagnosisRefDTO, MedicationRefDTO,
  VitalConstantEntry, DiagnosisEntry, MedicationPrescriptionEntry,
  ExamenPrescriptionEntry, VaccinePrescriptionEntry, CareInstructionEntry,
} from '../../services/medical-practitioner.service';

export interface MedicalActState {
  typeActe: string;
  motif: string;
  raisons: string;
  observations: string;
  dureeMinutes: number | null;
  vitalConstants: VitalConstantEntry[];
  diagnoses: DiagnosisEntry[];
  medications: MedicationPrescriptionEntry[];
  examens: ExamenPrescriptionEntry[];
  vaccines: VaccinePrescriptionEntry[];
  careInstructions: CareInstructionEntry[];
}

export type WizardStep = 'type' | 'consultation' | 'diagnostics' | 'prescriptions' | 'review';

@Component({
  selector: 'app-nouvel-acte-medical',
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvel-acte-medical.html',
})
export class NouvelActeMedical {
  private service = inject(MedicalPractitionerService);
  protected auth = AuthStore;

  close = output<void>();
  saved = output<string>();

  patientUserId = input<string>('');

  // État du wizard
  currentStep = signal<WizardStep>('type');
  saving = signal(false);
  error = signal('');

  stepLabels: Record<WizardStep, string> = {
    type: "Type d'acte",
    consultation: 'Consultation',
    diagnostics: 'Diagnostics',
    prescriptions: 'Prescriptions',
    review: 'Récapitulatif',
  };

  stepOrder: WizardStep[] = ['type', 'consultation', 'diagnostics', 'prescriptions', 'review'];

  currentStepIndex = computed(() => this.stepOrder.indexOf(this.currentStep()));

  // Données du formulaire
  state = signal<MedicalActState>({
    typeActe: 'Consultation',
    motif: '',
    raisons: '',
    observations: '',
    dureeMinutes: null,
    vitalConstants: [],
    diagnoses: [],
    medications: [],
    examens: [],
    vaccines: [],
    careInstructions: [],
  });

  // Références chargées
  vitalConstantRefs = signal<VitalConstantRefDTO[]>([]);
  diagnosisRefs = signal<DiagnosisRefDTO[]>([]);
  diagnosisSearchQuery = signal('');
  medicationRefs = signal<MedicationRefDTO[]>([]);
  medicationSearchQuery = signal('');

  // Constantes vitales temporaires
  newVitalConstantCode = signal('');
  newVitalConstantValue = signal<number | null>(null);

  get vitalConstantNom(): string {
    const ref = this.vitalConstantRefs().find(r => r.code === this.newVitalConstantCode());
    return ref ? `${ref.nom} (${ref.unite_mesure})` : '';
  }

  // Diagnostic temporaire
  newDiagnosisRefId = signal('');
  newDiagnosisNote = signal('');
  newDiagnosisStatus = signal('confirmed');

  get diagnosisSearchResults(): DiagnosisRefDTO[] {
    const q = this.diagnosisSearchQuery().toLowerCase();
    if (!q) return this.diagnosisRefs().slice(0, 10);
    return this.diagnosisRefs().filter(r =>
      r.libelle.toLowerCase().includes(q) || r.code_cid11.toLowerCase().includes(q)
    ).slice(0, 20);
  }

  get selectedDiagnosisName(): string {
    const ref = this.diagnosisRefs().find(r => r.id === this.newDiagnosisRefId());
    return ref ? `${ref.code_cid11} — ${ref.libelle}` : '';
  }

  // Médicament temporaire
  newMedicationRefId = signal('');
  newMedicationPosologie = signal('');
  newMedicationDuree = signal<number | null>(null);

  get medicationSearchResults(): MedicationRefDTO[] {
    const q = this.medicationSearchQuery().toLowerCase();
    if (!q) return [];
    return this.medicationRefs().filter(r =>
      r.nom_commercial.toLowerCase().includes(q) || r.dc_nom.toLowerCase().includes(q)
    ).slice(0, 20);
  }

  get selectedMedicationName(): string {
    const ref = this.medicationRefs().find(r => r.id === this.newMedicationRefId());
    return ref ? ref.nom_commercial : '';
  }

  ngOnInit() {
    this.service.getVitalConstantRefs().subscribe(refs => this.vitalConstantRefs.set(refs));
    this.service.getDiagnosisRefs().subscribe(refs => this.diagnosisRefs.set(refs));
  }

  updateState(key: keyof MedicalActState, value: any) {
    this.state.update(s => ({ ...s, [key]: value }));
  }

  // ── Navigation ────────────────────────────────────────────────────────

  goToStep(step: WizardStep) {
    this.currentStep.set(step);
  }

  nextStep() {
    const idx = this.currentStepIndex();
    if (idx < this.stepOrder.length - 1) {
      this.currentStep.set(this.stepOrder[idx + 1]);
    }
  }

  prevStep() {
    const idx = this.currentStepIndex();
    if (idx > 0) {
      this.currentStep.set(this.stepOrder[idx - 1]);
    }
  }

  // ── Constantes vitales ─────────────────────────────────────────────────

  addVitalConstant() {
    if (!this.newVitalConstantCode() || this.newVitalConstantValue() === null) return;
    const exists = this.state().vitalConstants.some(v => v.code === this.newVitalConstantCode());
    if (exists) return;
    this.state.update(s => ({
      ...s,
      vitalConstants: [...s.vitalConstants, {
        code: this.newVitalConstantCode(),
        valeur: this.newVitalConstantValue()!,
      }],
    }));
    this.newVitalConstantCode.set('');
    this.newVitalConstantValue.set(null);
  }

  removeVitalConstant(code: string) {
    this.state.update(s => ({
      ...s,
      vitalConstants: s.vitalConstants.filter(v => v.code !== code),
    }));
  }

  // ── Diagnostics ────────────────────────────────────────────────────────

  searchDiagnosis() {
    this.service.getDiagnosisRefs(this.diagnosisSearchQuery()).subscribe(refs => {
      this.diagnosisRefs.set(refs);
    });
  }

  addDiagnosis() {
    if (!this.newDiagnosisRefId()) return;
    const ref = this.diagnosisRefs().find(r => r.id === this.newDiagnosisRefId());
    if (!ref) return;
    this.state.update(s => ({
      ...s,
      diagnoses: [...s.diagnoses, {
        diagnosis_ref_id: this.newDiagnosisRefId(),
        note_clinique: this.newDiagnosisNote() || undefined,
        statut_verification: this.newDiagnosisStatus(),
      }],
    }));
    this.newDiagnosisRefId.set('');
    this.newDiagnosisNote.set('');
    this.newDiagnosisStatus.set('confirmed');
  }

  removeDiagnosis(index: number) {
    this.state.update(s => ({
      ...s,
      diagnoses: s.diagnoses.filter((_, i) => i !== index),
    }));
  }

  getDiagnosisLabel(refId: string): string {
    const ref = this.diagnosisRefs().find(r => r.id === refId);
    return ref ? `${ref.code_cid11} - ${ref.libelle}` : refId;
  }

  // ── Médicaments ────────────────────────────────────────────────────────

  searchMedications() {
    this.service.getMedicationRefs(this.medicationSearchQuery()).subscribe(refs => {
      this.medicationRefs.set(refs);
    });
  }

  addMedication() {
    if (!this.newMedicationRefId() || !this.newMedicationPosologie() || !this.newMedicationDuree()) return;
    this.state.update(s => ({
      ...s,
      medications: [...s.medications, {
        medication_ref_id: this.newMedicationRefId(),
        posologie: this.newMedicationPosologie(),
        duree_jours: this.newMedicationDuree()!,
      }],
    }));
    this.newMedicationRefId.set('');
    this.newMedicationPosologie.set('');
    this.newMedicationDuree.set(null);
    this.medicationSearchQuery.set('');
    this.medicationRefs.set([]);
  }

  removeMedication(index: number) {
    this.state.update(s => ({
      ...s,
      medications: s.medications.filter((_, i) => i !== index),
    }));
  }

  getMedicationName(refId: string): string {
    const ref = this.medicationRefs().find(r => r.id === refId);
    return ref ? ref.nom_commercial : refId;
  }

  // ── Examens prescrits ──────────────────────────────────────────────────

  newExamenLibelle = signal('');
  newExamenNature = signal('LABORATOIRE');

  addExamen() {
    if (!this.newExamenLibelle()) return;
    this.state.update(s => ({
      ...s,
      examens: [...s.examens, {
        libelle: this.newExamenLibelle(),
        nature_examination: this.newExamenNature(),
      }],
    }));
    this.newExamenLibelle.set('');
    this.newExamenNature.set('LABORATOIRE');
  }

  removeExamen(index: number) {
    this.state.update(s => ({
      ...s,
      examens: s.examens.filter((_, i) => i !== index),
    }));
  }

  // ── Vaccins ────────────────────────────────────────────────────────────

  newVaccinLibelle = signal('');

  addVaccin() {
    if (!this.newVaccinLibelle()) return;
    this.state.update(s => ({
      ...s,
      vaccines: [...s.vaccines, { libelle: this.newVaccinLibelle() }],
    }));
    this.newVaccinLibelle.set('');
  }

  removeVaccin(index: number) {
    this.state.update(s => ({
      ...s,
      vaccines: s.vaccines.filter((_, i) => i !== index),
    }));
  }

  // ── Instructions de soins ──────────────────────────────────────────────

  newSoinDescription = signal('');
  newSoinType = signal('rehabilitation');
  newSoinSeances = signal<number | null>(null);

  addCareInstruction() {
    if (!this.newSoinDescription()) return;
    this.state.update(s => ({
      ...s,
      careInstructions: [...s.careInstructions, {
        sous_type: this.newSoinType(),
        description_generale: this.newSoinDescription(),
        nombre_seances: this.newSoinSeances() || undefined,
      }],
    }));
    this.newSoinDescription.set('');
    this.newSoinSeances.set(null);
  }

  removeCareInstruction(index: number) {
    this.state.update(s => ({
      ...s,
      careInstructions: s.careInstructions.filter((_, i) => i !== index),
    }));
  }

  // ── Sauvegarde ─────────────────────────────────────────────────────────

  submit() {
    this.saving.set(true);
    this.error.set('');

    const s = this.state();
    const body = {
      type_acte: s.typeActe,
      motif: s.motif || undefined,
      raisons: s.raisons || undefined,
      observations_text: s.observations || undefined,
      duree_minutes: s.dureeMinutes || undefined,
      vital_constants: s.vitalConstants,
      diagnoses: s.diagnoses,
      medications: s.medications,
      examens: s.examens,
      vaccines: s.vaccines,
      care_instructions: s.careInstructions,
    };

    const identity = this.auth.user()?.identity;
    const userId = identity?.npi?.toString();
    if (!userId) {
      this.error.set('Utilisateur non identifié');
      this.saving.set(false);
      return;
    }

    this.service.createMedicalAct(userId, this.patientUserId(), body).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.saved.emit(res.id);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || "Erreur lors de l'enregistrement de l'acte médical");
      },
    });
  }
}
