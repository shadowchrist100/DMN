from fastapi import HTTPException
from sqlmodel import Session, select

from app.auth import CurrentUser
from app.models.practitioner import Practitioner
from app.models.patient import Patient
from app.models.authorization import Authorization
from app.models.dmn import DMN

ADMIN_ROLES = ("admin", "admin_medical")


def check_owner(user_id: str, current_user: CurrentUser) -> None:
    if user_id == current_user.id or user_id == current_user.npi:
        return
    if current_user.role in ADMIN_ROLES:
        return
    raise HTTPException(status_code=403, detail="Accès non autorisé à ces données")


def check_patient_access(user_id: str, current_user: CurrentUser, session: Session) -> None:
    """Autorise le patient lui-même, les admins, ou un praticien avec Authorisation active."""
    if user_id == current_user.id or user_id == current_user.npi:
        return
    if current_user.role in ADMIN_ROLES:
        return
    if current_user.role == "practitioner":
        patient = session.exec(
            select(Patient).where(Patient.user_id == user_id)
        ).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient introuvable")
        dmn = session.exec(
            select(DMN).where(DMN.patient_id == patient.id)
        ).first()
        if not dmn:
            raise HTTPException(status_code=403, detail="Dossier médical introuvable")
        practitioner = session.exec(
            select(Practitioner).where(Practitioner.user_id == current_user.id)
        ).first()
        if not practitioner:
            raise HTTPException(status_code=403, detail="Profil praticien introuvable")
        auth = session.exec(
            select(Authorization).where(
                Authorization.practitioner_id == practitioner.id,
                Authorization.dmn_id == dmn.id,
                Authorization.is_actif == True,
            )
        ).first()
        if auth:
            return
    raise HTTPException(status_code=403, detail="Accès non autorisé à ces données")
