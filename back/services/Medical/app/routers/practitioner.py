from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from uuid import UUID

from app.database import get_session
from app.auth import CurrentUser, verify_jwt
from app.deps import check_owner
from app.schemas.practitioner import CreatePractitionerReq, PractitionerResp
from app.schemas.medical import (
    PractitionerProfileResp, PatientSummaryResp,
    OrganisationInfo, AddPractitionerRoleReq,
)
from app.services.practitioner_service import PractitionerService
from app.models.practitioner import Practitioner
from app.models.practitioner_role import PractitionerRole
from app.models.healthcare_system import HealthcareSystem
from app.models.medical_act import MedicalAct
from app.models.dmn import DMN
from app.models.patient import Patient
from app.exceptions import not_found, bad_request
from app.types.enums import StatutVerification

router = APIRouter(prefix="/api", tags=["practitioner"])


@router.post("/practitioners", status_code=201, response_model=PractitionerResp)
def create_practitioner(
    body: CreatePractitionerReq,
    session: Session = Depends(get_session),
):
    practitioner = PractitionerService.create(session, body)
    return PractitionerResp(
        id=str(practitioner.id),
        user_id=practitioner.user_id,
        speciality=practitioner.speciality.value,
        order_number=practitioner.order_number,
        organization_id=practitioner.organization_id,
    )


@router.get("/practitioners/by-user/{user_id}", response_model=PractitionerProfileResp)
def get_practitioner_profile(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    practitioner = session.exec(
        select(Practitioner).where(Practitioner.user_id == user_id)
    ).first()

    if not practitioner:
        not_found("Praticien introuvable")

    roles = session.exec(
        select(PractitionerRole).where(PractitionerRole.practitioner_id == practitioner.id)
    ).all()

    organizations = []
    for role in roles:
        org = session.exec(
            select(HealthcareSystem).where(HealthcareSystem.id == role.health_care_system_id)
        ).first()
        if org:
            organizations.append(OrganisationInfo(
                id=str(org.id),
                nom=org.nom,
                type=org.type,
                role=role.role,
                is_actif=org.is_actif,
                verification_status=org.verification_status.value,
                start_date=role.start_date,
                end_date=role.end_date,
            ))

    return PractitionerProfileResp(
        id=str(practitioner.id),
        user_id=practitioner.user_id,
        speciality=practitioner.speciality.value,
        order_number=practitioner.order_number,
        organization_id=practitioner.organization_id,
        organizations=organizations,
    )


@router.post("/practitioners/by-user/{user_id}/roles", status_code=201, response_model=OrganisationInfo)
def add_practitioner_role(
    user_id: str,
    body: AddPractitionerRoleReq,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    practitioner = session.exec(
        select(Practitioner).where(Practitioner.user_id == user_id)
    ).first()
    if not practitioner:
        not_found("Praticien introuvable")

    org = session.exec(
        select(HealthcareSystem).where(HealthcareSystem.id == body.organization_id)
    ).first()
    if not org:
        not_found("Organisation introuvable")
    if org.verification_status != StatutVerification.VALIDE:
        bad_request("L'organisation référencée n'est pas vérifiée")

    role = PractitionerRole(
        practitioner_id=practitioner.id,
        health_care_system_id=org.id,
        role=body.role,
        start_date=body.start_date,
        end_date=body.end_date,
    )
    session.add(role)
    session.commit()
    session.refresh(role)

    return OrganisationInfo(
        id=str(org.id),
        nom=org.nom,
        type=org.type,
        role=role.role,
        is_actif=org.is_actif,
        verification_status=org.verification_status.value,
        start_date=role.start_date,
        end_date=role.end_date,
    )


@router.get("/practitioners/by-user/{user_id}/patients", response_model=list[PatientSummaryResp])
def get_practitioner_patients(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(verify_jwt),
):
    check_owner(user_id, current_user)
    practitioner = session.exec(
        select(Practitioner).where(Practitioner.user_id == user_id)
    ).first()

    if not practitioner:
        not_found("Praticien introuvable")

    role_ids = session.exec(
        select(PractitionerRole.id).where(
            PractitionerRole.practitioner_id == practitioner.id
        )
    ).all()

    if not role_ids:
        return []

    dmn_ids = session.exec(
        select(MedicalAct.dmn_id).where(
            MedicalAct.practitioner_role_id.in_(role_ids),
            MedicalAct.dmn_id.isnot(None),
        ).distinct()
    ).all()

    if not dmn_ids:
        return []

    patients = session.exec(
        select(Patient).join(DMN, DMN.patient_id == Patient.id).where(
            DMN.id.in_(dmn_ids)
        ).distinct()
    ).all()

    result = []
    for patient in patients:
        dmn = session.exec(
            select(DMN).where(DMN.patient_id == patient.id)
        ).first()

        last_act = session.exec(
            select(MedicalAct).where(
                MedicalAct.dmn_id == dmn.id,
                MedicalAct.practitioner_role_id.in_(role_ids),
            ).order_by(MedicalAct.id.desc())
        ).first()

        result.append(PatientSummaryResp(
            id=str(patient.id),
            user_id=patient.user_id,
            blood_type=dmn.blood_type if dmn else None,
            last_consultation=str(last_act.id) if last_act else None,
        ))

    return result
