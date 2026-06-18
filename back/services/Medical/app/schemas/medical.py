from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class PatientProfileResp(BaseModel):
    id: str
    user_id: str
    blood_type: Optional[str] = None
    rhesus_factor: Optional[str] = None
    date_creation: Optional[datetime] = None


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
    libelle: str
    statut: str
    date_prescription: datetime
    special_instructions: str
    prescripteur_nom: Optional[str] = None
    prescripteur_specialite: Optional[str] = None
    code_loinc: Optional[str] = None
    nature_examination: Optional[str] = None
    code_cvx: Optional[str] = None


class AuthorizationResp(BaseModel):
    id: str
    perimeter: str
    granted_at: date
    expire_at: date
    duration: str
    is_actif: bool
    is_urgence: bool
    authorization_type: str
    practitioner_name: Optional[str] = None
    practitioner_speciality: Optional[str] = None


class DiseaseResp(BaseModel):
    id: str
    code_cim: Optional[str] = None
    libelle: Optional[str] = None
    statut_verification: str
    date: date
    note_clinique: Optional[str] = None


class ConsultationResp(BaseModel):
    id: str
    duree_minutes: Optional[int] = None
    motif: Optional[str] = None
    raisons: Optional[str] = None
    rapport_text: Optional[str] = None
    observations_text: Optional[str] = None
    practitioner_name: Optional[str] = None
    practitioner_speciality: Optional[str] = None
    healthcare_nom: Optional[str] = None


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
    speciality: str
    order_number: Optional[str] = None
    organization_id: Optional[str] = None
    organizations: list[OrganisationInfo] = []


class PatientSummaryResp(BaseModel):
    id: str
    user_id: str
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
    pending_reports: int = 0


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
    patient_user_id: str
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
