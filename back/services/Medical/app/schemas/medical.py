from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class PatientProfileResp(BaseModel):
    id: str
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    blood_type: Optional[str] = None
    rhesus_factor: Optional[str] = None
    date_creation: Optional[datetime] = None
    taille: Optional[float] = None
    poids: Optional[float] = None


class AllergyResp(BaseModel):
    id: str
    substance: str
    categorie: str
    criticite: str
    statut_clinique: str
    statut_verification: str
    reactions: list[str]
    date_declaration: date
    notes: Optional[str] = None
    declare_par: Optional[str] = None


class ExamenResp(BaseModel):
    uuid: str
    libelle_examen: str
    type_examen: str
    code_loinc: str
    valeur: str
    interpretation: str
    image_path: Optional[str] = None
    date_realisation: Optional[datetime] = None
    raisons: Optional[str] = None
    rapport_text: Optional[str] = None
    observations_text: Optional[str] = None


class PrescriptionResp(BaseModel):
    uuid: str
    type_prescription: str
    libelle: str = ""
    statut: str
    date_prescription: Optional[datetime] = None
    special_instructions: str = ""
    prescripteur_nom: Optional[str] = None
    prescripteur_specialite: Optional[str] = None
    code_loinc: Optional[str] = None
    nature_examination: Optional[str] = None
    code_cvx: Optional[str] = None
    examen_libelle: Optional[str] = None
    vaccine_libelle: Optional[str] = None
    nom_commercial: Optional[str] = None
    dc_nom: Optional[str] = None
    forme_galenique: Optional[str] = None
    posologie: Optional[str] = None
    duree_jours: Optional[int] = None
    sous_type: Optional[str] = None
    description_generale: Optional[str] = None
    nombre_seances: Optional[int] = None


class AuthorizationResp(BaseModel):
    id: str
    perimeter: str
    granted_at: date
    expire_at: date
    duration: str
    is_actif: bool
    is_urgence: bool
    authorization_type: str
    type_autorisation: str = "access_request"
    auteur_autorisation_id: Optional[str] = None
    practitioner_name: Optional[str] = None
    practitioner_speciality: Optional[str] = None


class DiseaseResp(BaseModel):
    id: str
    code_cim: Optional[str] = None
    libelle: Optional[str] = None
    statut_verification: str
    date: date
    note_clinique: Optional[str] = None


class VitalConstantResp(BaseModel):
    code: str
    valeur: float
    nom: Optional[str] = None
    unite_mesure: Optional[str] = None


class DiagnosisResp(BaseModel):
    id: str
    statut_verification: str
    note_clinique: Optional[str] = None
    code_cim: Optional[str] = None
    libelle: Optional[str] = None


class MedicationResp(BaseModel):
    id: str
    nom_commercial: Optional[str] = None
    dc_nom: Optional[str] = None
    forme_galenique: Optional[str] = None
    posologie: Optional[str] = None
    duree_jours: Optional[int] = None


class ExamenPrescriptionResp(BaseModel):
    id: str
    code_loinc: Optional[str] = None
    libelle: Optional[str] = None
    nature_examination: Optional[str] = None
    special_instructions: Optional[str] = None
    statut: Optional[str] = None


class VaccinePrescriptionResp(BaseModel):
    id: str
    code_cvx: Optional[str] = None
    libelle: Optional[str] = None
    special_instructions: Optional[str] = None
    statut: Optional[str] = None


class CareInstructionResp(BaseModel):
    id: str
    sous_type: Optional[str] = None
    description_generale: Optional[str] = None
    nombre_seances: Optional[int] = None
    frequence_hebdo: Optional[int] = None
    objectifs: Optional[str] = None
    titre_consigne: Optional[str] = None
    recommandations: Optional[str] = None


class ConsultationResp(BaseModel):
    id: str
    type_acte: str = "CONSULTATION"
    created_at: Optional[str] = None
    duree_minutes: Optional[int] = None
    motif: Optional[str] = None
    raisons: Optional[str] = None
    rapport_text: Optional[str] = None
    observations_text: Optional[str] = None
    practitioner_name: Optional[str] = None
    practitioner_speciality: Optional[str] = None
    healthcare_nom: Optional[str] = None
    vital_constants: list[VitalConstantResp] = []
    diagnoses: list[DiagnosisResp] = []
    medications: list[MedicationResp] = []
    exam_prescriptions: list[ExamenPrescriptionResp] = []
    vaccine_prescriptions: list[VaccinePrescriptionResp] = []
    care_instructions: list[CareInstructionResp] = []


class VaccinationResp(BaseModel):
    id: str
    injection_site: Optional[str] = None
    sequence_dose: Optional[int] = None
    batch_number: Optional[str] = None
    next_reminder: Optional[date] = None
    note: Optional[str] = None
    raisons: Optional[str] = None
    rapport_text: Optional[str] = None


class OrganisationInfo(BaseModel):
    id: str
    nom: str
    type: str
    role: str
    is_actif: bool
    verification_status: str
    start_date: date
    end_date: Optional[date] = None


class AddPractitionerRoleReq(BaseModel):
    organization_id: str
    role: str = "medecin"
    start_date: date
    end_date: Optional[date] = None


class PractitionerProfileResp(BaseModel):
    id: str
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    speciality: str
    order_number: Optional[str] = None
    organization_id: Optional[str] = None
    organizations: list[OrganisationInfo] = []


class PractitionerUpdateReq(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    speciality: Optional[str] = None
    order_number: Optional[str] = None


class PatientSummaryResp(BaseModel):
    id: str
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    blood_type: Optional[str] = None
    last_consultation: Optional[str] = None


class AlertResp(BaseModel):
    id: str
    type: str  # prescription, urgence, examen, info
    message: str
    date: str
    auteur: Optional[str] = None


class AccessLogResp(BaseModel):
    id: str
    qui: str
    role: str
    date: str
    icon: str


class DashboardStatsResp(BaseModel):
    examens_count: int
    prescriptions_count: int
    allergies_count: int
    consentements_count: int
    pathologies_count: int
    consultations_count: int
    vaccinations_count: int


class DashboardSummaryResp(BaseModel):
    profile: PatientProfileResp
    stats: DashboardStatsResp
    alerts: list[AlertResp]
    access_logs: list[AccessLogResp]


class TimelineEventResp(BaseModel):
    id: str
    type: str
    title: str
    description: Optional[str] = None
    date: str
    facility: Optional[str] = None
    practitioner_name: Optional[str] = None
    practitioner_role: Optional[str] = None
    priority: str
    status: str
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    icon: str
    badge_text: Optional[str] = None
    badge_type: Optional[str] = None


class PractitionerDashboardStatsResp(BaseModel):
    followed_patients: int = 0
    new_patients_this_month: int = 0
    consultations_this_week: int = 0
    completed_visits: int = 0
    upcoming_visits: int = 0


class AccessRequestResp(BaseModel):
    id: str
    patient_npi: str
    patient_name: str
    reason: str
    requested_at: str
    urgency: str
    requested_by_name: str
    requested_by_role: str
    requested_by_facility: str
    expires_at: str


class PractitionerConsentResp(BaseModel):
    id: str
    patient_npi: str
    patient_name: str
    perimeter: str
    duration: str
    status: str          # "active" | "pending" | "expired"
    granted_at: Optional[str] = None
    expires_at: Optional[str] = None
    is_urgence: bool = False
    reason: str = ""


class PractitionerActivityResp(BaseModel):
    id: str
    type: str
    action: str
    patient_name: Optional[str] = None
    patient_npi: Optional[str] = None
    facility: str
    timestamp: str
    badge_text: Optional[str] = None
    badge_type: Optional[str] = None


class PatientSearchResult(BaseModel):
    user_id: str
    npi: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None


class CreateAccessRequestReq(BaseModel):
    patient_user_id: str = ""
    practitioner_user_id: str = ""
    reason: str = ""
    duration: str = "24h"
    perimeter: str = "all"


class PendingAccessRequestResp(BaseModel):
    id: str
    practitioner_user_id: str
    practitioner_name: str
    practitioner_speciality: str
    reason: str
    requested_at: str
    perimeter: str
    duration: str


class RespondAccessRequestReq(BaseModel):
    action: str  # "accept" or "decline"
    perimeter: Optional[str] = None
    duration: Optional[str] = None


# ─── Références ────────────────────────────────────────────────────────────────

class VitalConstantRefResp(BaseModel):
    code: str
    nom: str
    unite_mesure: str


class DiagnosisRefResp(BaseModel):
    id: str
    code_cid11: str
    libelle: str
    type_ref: str = "maladie"  # "maladie" | "allergy"


class MedicationRefResp(BaseModel):
    id: str
    code_medicament: str
    nom_commercial: str
    dc_nom: str
    forme_galenique: str


class ExaminationRefResp(BaseModel):
    id: str
    code: str
    libelle: str
    nature: str


class VaccineRefResp(BaseModel):
    id: str
    code_cvx: str
    libelle: str


# ─── Création d'acte médical ───────────────────────────────────────────────────

class VitalConstantEntry(BaseModel):
    code: str
    valeur: float


class DiagnosisEntry(BaseModel):
    diagnosis_ref_id: str
    note_clinique: Optional[str] = None
    statut_verification: str = "confirmed"  # "confirmed" | "suspected"


class MedicationPrescriptionEntry(BaseModel):
    medication_ref_id: str
    posologie: str
    duree_jours: int
    description_generale: Optional[str] = None


class ExamenPrescriptionEntry(BaseModel):
    code_loinc: Optional[str] = None
    libelle: str
    nature_examination: str = "LABORATOIRE"
    special_instructions: Optional[str] = None
    valeur: Optional[str] = None
    interpretation: Optional[str] = None
    type_examen: str = "BILAN"


class VaccinePrescriptionEntry(BaseModel):
    code_cvx: Optional[str] = None
    libelle: str
    special_instructions: Optional[str] = None
    injection_site: Optional[str] = None
    sequence_dose: Optional[int] = None
    batch_number: Optional[str] = None
    next_reminder: Optional[date] = None
    note: Optional[str] = None


class CareInstructionEntry(BaseModel):
    sous_type: str = "rehabilitation"
    nombre_seances: Optional[int] = None
    frequence_hebdo: Optional[str] = None
    objectifs: Optional[str] = None
    titre_consigne: Optional[str] = None
    recommandations: Optional[str] = None
    description_generale: Optional[str] = None


class CreateMedicalActReq(BaseModel):
    type_acte: str = "Consultation"
    motif: Optional[str] = None
    raisons: Optional[str] = None
    observations_text: Optional[str] = None
    duree_minutes: Optional[int] = None
    prescription_examen_id: Optional[str] = None
    organization_id: Optional[str] = None

    vital_constants: list[VitalConstantEntry] = []

    diagnoses: list[DiagnosisEntry] = []

    medications: list[MedicationPrescriptionEntry] = []
    examens: list[ExamenPrescriptionEntry] = []
    vaccines: list[VaccinePrescriptionEntry] = []
    care_instructions: list[CareInstructionEntry] = []


class MedicalActCreatedResp(BaseModel):
    id: str
    status: str = "created"


class CreateEmergencyAuthorizationReq(BaseModel):
    patient_user_id: str
    practitioner_user_id: str
    type_autorisation: str
    auteur_id: str
