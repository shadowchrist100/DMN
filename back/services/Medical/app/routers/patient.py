from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.auth import CurrentUser, verify_jwt
from app.deps import check_owner
from app.schemas.patient import (
    CreatePatientReq, PatientResp,
    RelativeResp, RelatedPersonResp,
)
from app.schemas.medical import (
    PatientProfileResp, AllergyResp, ExamenResp,
    PrescriptionResp, AuthorizationResp,
    DiseaseResp, ConsultationResp, VaccinationResp,
)
from app.services.patient_service import PatientService
from app.repositories.medical_repository import MedicalRepository
from app.models.authorization import Authorization
from app.models.practitioner import Practitioner
from app.exceptions import not_found

router = APIRouter(prefix="/api", tags=["patient"])


@router.post("/patients", status_code=201, response_model=PatientResp)
def create_patient(
    body: CreatePatientReq,
    session: Session = Depends(get_session),
):
    patient = PatientService.create(session, body)
    related = PatientService.get_related_persons(session, patient.id)

    return PatientResp(
        id=str(patient.id),
        user_id=patient.user_id,
        relatives=[
            RelatedPersonResp(
                relative=RelativeResp(
                    id=str(contact.id),
                    first_name=contact.first_name,
                    last_name=contact.last_name,
                    phone=contact.phone,
                ),
                code_relation=relation.code_relation,
            )
            for contact, relation in related
        ],
    )


@router.get("/patients/by-user/{user_id}", response_model=PatientProfileResp)
def get_patient_profile(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    patient = MedicalRepository.get_patient_by_user_id(session, user_id)
    if not patient:
        not_found("Patient introuvable")

    dmn = MedicalRepository.get_dmn_by_patient_id(session, patient.id)

    return PatientProfileResp(
        id=str(patient.id),
        user_id=patient.user_id,
        blood_type=dmn.blood_type if dmn else None,
        rhesus_factor=dmn.rhesus_factor if dmn else None,
        date_creation=dmn.date_creation if dmn else None,
    )


@router.post("/patients/by-user/{user_id}/dmn", status_code=201)
def create_patient_dmn(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    dmn = PatientService.create_dmn(session, user_id)
    return {
        "id": str(dmn.id),
        "patient_id": str(dmn.patient_id),
        "date_creation": dmn.date_creation,
    }



@router.get("/patients/by-user/{user_id}/allergies", response_model=list[AllergyResp])
def get_patient_allergies(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    allergies = MedicalRepository.get_allergies(session, user_id)
    result = []
    for a in allergies:
        reactions = (
            [r.strip() for r in a["reactions_text"].split(",") if r.strip()]
            if a.get("reactions_text") else []
        )
        libelle = a.get("libelle") or ""
        nature = a.get("nature_allergie")
        substance = f"{libelle} ({nature})" if nature else libelle

        result.append(AllergyResp(
            id=str(a["id"]),
            substance=substance,
            categorie=a.get("categorie") or "",
            criticite=a.get("criticite") or "",
            statut_clinique=a.get("statut_clinique") or "",
            statut_verification=a.get("statut_verification") or "",
            reactions=reactions,
            date_declaration=a["discover_at"],
            notes=a.get("note_clinique"),
        ))
    return result


@router.get("/patients/by-user/{user_id}/examens", response_model=list[ExamenResp])
def get_patient_examens(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    examens = MedicalRepository.get_examens(session, user_id)
    result = []
    for e in examens:
        result.append(ExamenResp(
            uuid=str(e["id"]),
            libelle_examen=e.get("libelle_examen") or "",
            type_examen=e.get("type_examen") or "",
            code_loinc=e.get("code_loinc") or "",
            valeur=e.get("value") or "",
            interpretation=e.get("interpretation") or "",
            image_path=e.get("image_path"),
            raisons=e.get("raisons"),
            rapport_text=e.get("rapport_text"),
            observations_text=e.get("observations_text"),
        ))
    return result


@router.get("/patients/by-user/{user_id}/prescriptions", response_model=list[PrescriptionResp])
def get_patient_prescriptions(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    prescriptions = MedicalRepository.get_prescriptions(session, user_id)
    result = []
    for p in prescriptions:
        libelle = p.get("examen_libelle") or p.get("vaccine_libelle") or ""

        result.append(PrescriptionResp(
            uuid=str(p["id"]),
            type_prescription=p["type_prescription"],
            libelle=libelle,
            statut=p["statut"],
            date_prescription=p["date_prescription"],
            special_instructions=p.get("special_instructions") or "",
            code_loinc=p.get("code_loinc"),
            nature_examination=p.get("nature_examination"),
            code_cvx=p.get("code_cvx"),
        ))
    return result


@router.get("/patients/by-user/{user_id}/authorizations", response_model=list[AuthorizationResp])
def get_patient_authorizations(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    authorizations = MedicalRepository.get_authorizations(session, user_id)
    result = []
    for a in authorizations:
        practitioner_name = None
        practitioner_speciality = None
        if a.practitioner_id:
            p = session.get(Practitioner, a.practitioner_id)
            if p:
                practitioner_name = p.user_id
                practitioner_speciality = p.speciality.value if p.speciality else None

        result.append(AuthorizationResp(
            id=str(a.id),
            perimeter=a.perimeter.value,
            granted_at=a.granted_at,
            expire_at=a.expire_at,
            duration=a.duration.value,
            is_actif=a.is_actif,
            is_urgence=a.is_urgence,
            authorization_type=a.authorization_type,
            practitioner_name=practitioner_name,
            practitioner_speciality=practitioner_speciality,
        ))
    return result


@router.get("/patients/by-user/{user_id}/pathologies", response_model=list[DiseaseResp])
def get_patient_pathologies(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    diseases = MedicalRepository.get_diseases(session, user_id)
    result = []
    for d in diseases:
        result.append(DiseaseResp(
            id=str(d["id"]),
            code_cim=d.get("ref_code"),
            libelle=d.get("ref_libelle"),
            statut_verification=d.get("statut_verification") or "",
            date=d["date"],
            note_clinique=d.get("note_clinique"),
        ))
    return result


@router.get("/patients/by-user/{user_id}/consultations", response_model=list[ConsultationResp])
def get_patient_consultations(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    consultations = MedicalRepository.get_consultations(session, user_id)
    result = []
    for c in consultations:
        pr_name = None
        pr_speciality = None
        hc_nom = None

        result.append(ConsultationResp(
            id=str(c["id"]),
            duree_minutes=c.get("duree_minutes"),
            motif=c.get("motif"),
            raisons=c.get("raisons"),
            rapport_text=c.get("rapport_text"),
            observations_text=c.get("observations_text"),
            practitioner_name=c.get("practitioner_user_id"),
            practitioner_speciality=c.get("speciality"),
            healthcare_nom=c.get("healthcare_nom"),
        ))
    return result


@router.get("/patients/by-user/{user_id}/vaccinations", response_model=list[VaccinationResp])
def get_patient_vaccinations(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    vaccinations = MedicalRepository.get_vaccinations(session, user_id)
    result = []
    for v in vaccinations:
        result.append(VaccinationResp(
            id=str(v["id"]),
            injection_site=v.get("injection_site"),
            sequence_dose=v.get("sequence_dose"),
            batch_number=v.get("batch_number"),
            next_reminder=v.get("next_reminder"),
            note=v.get("note"),
            raisons=v.get("raisons"),
            rapport_text=v.get("rapport_text"),
        ))
    return result
