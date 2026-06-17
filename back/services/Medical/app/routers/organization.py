from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from uuid import UUID
from datetime import datetime

from app.database import get_session
from app.schemas.organization import (
    CreateOrganizationReq,
    UpdateOrganizationReq,
    ValidateOrganizationReq,
    OrganizationResp,
)
from app.models.healthcare_system import HealthcareSystem
from app.types.enums import StatutVerification
from app.exceptions import not_found, bad_request

router = APIRouter(prefix="/api", tags=["organization"])


def _to_resp(org: HealthcareSystem) -> OrganizationResp:
    return OrganizationResp(
        id=str(org.id),
        name=org.nom,
        type=org.type,
        city=org.city,
        address=org.address,
        phone=org.phone,
        email=org.email,
        is_actif=org.is_actif,
        verification_status=org.verification_status.value,
        created_by=org.created_by,
        validated_by=org.validated_by,
        validated_at=org.validated_at,
        created_at=org.created_at,
        updated_at=org.updated_at,
    )


@router.post("/organizations", status_code=201, response_model=OrganizationResp)
def create_organization(
    body: CreateOrganizationReq,
    session: Session = Depends(get_session),
):
    org = HealthcareSystem(
        nom=body.name,
        alias=body.name.lower().replace(" ", "_"),
        type=body.type,
        city=body.city,
        address=body.address,
        phone=body.phone or "",
        email=body.email or "",
        is_actif=True,
        verification_status=StatutVerification.EN_ATTENTE,
        created_by=body.created_by,
    )
    session.add(org)
    session.commit()
    session.refresh(org)
    return _to_resp(org)


@router.get("/organizations", response_model=list[OrganizationResp])
def list_organizations(
    status: str | None = Query(None),
    created_by: str | None = Query(None),
    session: Session = Depends(get_session),
):
    query = select(HealthcareSystem)

    if status:
        status_enum = next((s for s in StatutVerification if s.value == status), None)
        if status_enum:
            query = query.where(HealthcareSystem.verification_status == status_enum)

    if created_by:
        query = query.where(HealthcareSystem.created_by == created_by)

    organizations = session.exec(query.order_by(HealthcareSystem.nom)).all()
    return [_to_resp(org) for org in organizations]


@router.get("/organizations/{organization_id}", response_model=OrganizationResp)
def get_organization(
    organization_id: UUID,
    session: Session = Depends(get_session),
):
    org = session.get(HealthcareSystem, organization_id)
    if not org:
        not_found("Organisation introuvable")
    return _to_resp(org)


@router.put("/organizations/{organization_id}", response_model=OrganizationResp)
def update_organization(
    organization_id: UUID,
    body: UpdateOrganizationReq,
    session: Session = Depends(get_session),
):
    org = session.get(HealthcareSystem, organization_id)
    if not org:
        not_found("Organisation introuvable")

    if org.verification_status != StatutVerification.EN_ATTENTE:
        bad_request("Impossible de modifier une organisation déjà traitée")

    update_data = body.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["nom"] = update_data.pop("name")
        update_data["alias"] = update_data["nom"].lower().replace(" ", "_")

    for key, value in update_data.items():
        setattr(org, key, value)

    session.add(org)
    session.commit()
    session.refresh(org)
    return _to_resp(org)


@router.delete("/organizations/{organization_id}")
def delete_organization(
    organization_id: UUID,
    session: Session = Depends(get_session),
):
    org = session.get(HealthcareSystem, organization_id)
    if not org:
        not_found("Organisation introuvable")

    if org.verification_status != StatutVerification.EN_ATTENTE:
        bad_request("Impossible de supprimer une organisation déjà traitée")

    session.delete(org)
    session.commit()
    return {"message": "Organisation supprimée"}


@router.post("/organizations/{organization_id}/validate", response_model=OrganizationResp)
def validate_organization(
    organization_id: UUID,
    body: ValidateOrganizationReq,
    session: Session = Depends(get_session),
):
    org = session.get(HealthcareSystem, organization_id)
    if not org:
        not_found("Organisation introuvable")

    if body.status not in ("active", "suspended"):
        bad_request("Statut invalide. Utilisez 'active' ou 'suspended'")

    if org.verification_status != StatutVerification.EN_ATTENTE:
        bad_request("L'organisation a déjà été traitée")

    org.verification_status = (
        StatutVerification.VALIDE if body.status == "active" else StatutVerification.REJETE
    )
    org.is_actif = body.status == "active"
    org.validated_at = datetime.now()
    if body.validated_by:
        org.validated_by = body.validated_by

    session.add(org)
    session.commit()
    session.refresh(org)
    return _to_resp(org)
