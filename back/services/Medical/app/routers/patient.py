from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from uuid import UUID

from app.database import get_session
from app.auth import CurrentUser, verify_jwt
from app.deps import check_owner, check_patient_access
from app.schemas.patient import (
    CreatePatientReq, PatientResp,
    RelativeReq, RelativeResp, RelatedPersonResp,
    RelativeUpdateReq, PatientProfileUpdateReq,
)
from app.schemas.medical import (
    PatientProfileResp, AllergyResp, ExamenResp,
    PrescriptionResp, AuthorizationResp,
    DiseaseResp, ConsultationResp, VaccinationResp,
    DashboardSummaryResp, DashboardStatsResp,
    AlertResp, AccessLogResp, TimelineEventResp,
    PendingAccessRequestResp, RespondAccessRequestReq,
)
from app.services.patient_service import PatientService
from app.repositories.medical_repository import MedicalRepository
from app.repositories.relative_repository import RelativeRepository
from app.models.authorization import Authorization
from app.models.practitioner import Practitioner
from app.models.patient import Patient
from app.models.patient_relative import PatientRelative
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
        first_name=patient.first_name,
        last_name=patient.last_name,
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
    check_patient_access(user_id, current_user, session)
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
    check_patient_access(user_id, current_user, session)
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
    check_patient_access(user_id, current_user, session)
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
    check_patient_access(user_id, current_user, session)
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
    check_patient_access(user_id, current_user, session)
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
    check_patient_access(user_id, current_user, session)
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
    check_patient_access(user_id, current_user, session)
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
    check_patient_access(user_id, current_user, session)
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


# ═══════════════════════════════════════════════════════════════════════════════
#  RELATIVES / CONTACTS CRUD
# ═══════════════════════════════════════════════════════════════════════════════


@router.get("/patients/by-user/{user_id}/relatives", response_model=list[RelatedPersonResp])
def get_patient_relatives(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_patient_access(user_id, current_user, session)
    patient = MedicalRepository.get_patient_by_user_id(session, user_id)
    if not patient:
        not_found("Patient introuvable")

    related = PatientService.get_related_persons(session, patient.id)
    return [
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
    ]


@router.post("/patients/by-user/{user_id}/relatives", status_code=201, response_model=RelatedPersonResp)
def create_patient_relative(
    user_id: str,
    body: RelativeReq,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    patient = MedicalRepository.get_patient_by_user_id(session, user_id)
    if not patient:
        not_found("Patient introuvable")

    contact = RelativeRepository.create(session, patient.id, body)
    session.commit()
    session.refresh(contact)

    relation = session.exec(
        select(PatientRelative)
        .where(PatientRelative.patient_id == patient.id)
        .where(PatientRelative.relative_id == contact.id)
    ).first()

    return RelatedPersonResp(
        relative=RelativeResp(
            id=str(contact.id),
            first_name=contact.first_name,
            last_name=contact.last_name,
            phone=contact.phone,
        ),
        code_relation=relation.code_relation if relation else body.code_relation,
    )


@router.put("/patients/by-user/{user_id}/relatives/{relative_id}", response_model=RelatedPersonResp)
def update_patient_relative(
    user_id: str,
    relative_id: UUID,
    body: RelativeUpdateReq,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    patient = MedicalRepository.get_patient_by_user_id(session, user_id)
    if not patient:
        not_found("Patient introuvable")

    relative = RelativeRepository.get_by_id(session, relative_id)
    if not relative:
        not_found("Contact introuvable")

    relative = RelativeRepository.update(session, relative, body)
    RelativeRepository.update_relation(session, patient.id, relative_id, body)
    session.commit()
    session.refresh(relative)

    relation = session.exec(
        select(PatientRelative)
        .where(PatientRelative.patient_id == patient.id)
        .where(PatientRelative.relative_id == relative.id)
    ).first()

    return RelatedPersonResp(
        relative=RelativeResp(
            id=str(relative.id),
            first_name=relative.first_name,
            last_name=relative.last_name,
            phone=relative.phone,
        ),
        code_relation=relation.code_relation if relation else "",
    )


@router.delete("/patients/by-user/{user_id}/relatives/{relative_id}", status_code=204)
def delete_patient_relative(
    user_id: str,
    relative_id: UUID,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    patient = MedicalRepository.get_patient_by_user_id(session, user_id)
    if not patient:
        not_found("Patient introuvable")

    RelativeRepository.delete_relation(session, patient.id, relative_id)
    RelativeRepository.delete(session, relative_id)
    session.commit()


# ═══════════════════════════════════════════════════════════════════════════════
#  DASHBOARD — agrégation des données pour la vue d'accueil
# ═══════════════════════════════════════════════════════════════════════════════


@router.get("/patients/by-user/{user_id}/dashboard/summary", response_model=DashboardSummaryResp)
def get_patient_dashboard_summary(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_patient_access(user_id, current_user, session)
    patient = MedicalRepository.get_patient_by_user_id(session, user_id)
    if not patient:
        not_found("Patient introuvable")

    dmn = MedicalRepository.get_dmn_by_patient_id(session, patient.id)

    profile = PatientProfileResp(
        id=str(patient.id),
        user_id=patient.user_id,
        blood_type=dmn.blood_type if dmn else None,
        rhesus_factor=dmn.rhesus_factor if dmn else None,
        date_creation=dmn.date_creation if dmn else None,
    )

    stats_data = MedicalRepository.get_dashboard_stats(session, user_id)
    stats = DashboardStatsResp(**stats_data)

    raw_alerts = MedicalRepository.get_alerts(session, user_id)
    alerts = [AlertResp(**a) for a in raw_alerts]

    raw_logs = MedicalRepository.get_access_log(session, user_id)
    access_logs = [AccessLogResp(**l) for l in raw_logs]

    return DashboardSummaryResp(
        profile=profile,
        stats=stats,
        alerts=alerts,
        access_logs=access_logs,
    )


@router.get("/patients/by-user/{user_id}/dashboard/stats", response_model=DashboardStatsResp)
def get_patient_dashboard_stats(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_patient_access(user_id, current_user, session)
    stats = MedicalRepository.get_dashboard_stats(session, user_id)
    return DashboardStatsResp(**stats)


@router.get("/patients/by-user/{user_id}/dashboard/alerts", response_model=list[AlertResp])
def get_patient_dashboard_alerts(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_patient_access(user_id, current_user, session)
    raw = MedicalRepository.get_alerts(session, user_id)
    return [AlertResp(**a) for a in raw]


@router.get("/patients/by-user/{user_id}/dashboard/access-log", response_model=list[AccessLogResp])
def get_patient_dashboard_access_log(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_patient_access(user_id, current_user, session)
    raw = MedicalRepository.get_access_log(session, user_id)
    return [AccessLogResp(**l) for l in raw]


@router.get("/patients/by-user/{user_id}/dashboard/timeline", response_model=list[TimelineEventResp])
def get_patient_dashboard_timeline(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_patient_access(user_id, current_user, session)
    events = MedicalRepository.get_timeline(session, user_id)
    return [TimelineEventResp(**e) for e in events]


# ═══════════════════════════════════════════════════════════════════════════════
#  PROFIL PATIENT — mise à jour des informations médicales
# ═══════════════════════════════════════════════════════════════════════════════


@router.put("/patients/by-user/{user_id}/profile", response_model=PatientProfileResp)
def update_patient_profile(
    user_id: str,
    body: PatientProfileUpdateReq,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    patient = MedicalRepository.get_patient_by_user_id(session, user_id)
    if not patient:
        not_found("Patient introuvable")

    dmn = MedicalRepository.get_dmn_by_patient_id(session, patient.id)
    if not dmn:
        from app.services.patient_service import PatientService
        dmn = PatientService.create_dmn(session, user_id)

    if body.blood_type is not None:
        dmn.blood_type = body.blood_type
    if body.rhesus_factor is not None:
        dmn.rhesus_factor = body.rhesus_factor

    session.add(dmn)
    session.commit()
    session.refresh(dmn)

    return PatientProfileResp(
        id=str(patient.id),
        user_id=patient.user_id,
        blood_type=dmn.blood_type,
        rhesus_factor=dmn.rhesus_factor,
        date_creation=dmn.date_creation,
    )


@router.get("/patients/by-user/{user_id}/access-requests/pending", response_model=list[PendingAccessRequestResp])
def get_pending_access_requests(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    requests = MedicalRepository.get_pending_access_requests(session, user_id)
    return [PendingAccessRequestResp(**r) for r in requests]


@router.put("/patients/by-user/{user_id}/access-requests/{request_id}/respond")
def respond_to_access_request(
    user_id: str,
    request_id: UUID,
    body: RespondAccessRequestReq,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    ok = MedicalRepository.respond_to_access_request(
        session,
        request_id=request_id,
        action=body.action,
        perimeter=body.perimeter,
        duration=body.duration,
    )
    if not ok:
        not_found("Demande d'accès introuvable")
    session.commit()
    return {"status": body.action}
