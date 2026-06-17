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
