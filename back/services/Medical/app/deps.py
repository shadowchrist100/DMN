from datetime import date
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
        today = date.today()
        auth = session.exec(
            select(Authorization).where(
                Authorization.practitioner_id == practitioner.id,
                Authorization.dmn_id == dmn.id,
                Authorization.is_actif == True,
                Authorization.expire_at >= today,
            )
        ).first()
        if auth:
            return
        expired = session.exec(
            select(Authorization).where(
                Authorization.practitioner_id == practitioner.id,
                Authorization.dmn_id == dmn.id,
                Authorization.expire_at < today,
            )
        ).first()
        if expired:
            raise HTTPException(
                status_code=403,
                detail="Votre autorisation d'accès à ce dossier a expiré. Veuillez faire une nouvelle demande d'accès."
            )
    raise HTTPException(status_code=403, detail="Accès non autorisé à ces données")


def get_practitioner_access_status(user_id: str, current_user: CurrentUser, session: Session) -> dict:
    """Vérifie le statut d'accès d'un praticien à un dossier patient sans lever d'exception.
    
    Retourne un dict avec:
    - has_access: bool
    - status: 'active' | 'expired' | 'none'
    - message: str
    """
    result = {"has_access": False, "status": "none", "message": "Vous n'avez pas d'autorisation d'accès à ce dossier."}
    
    if user_id == current_user.id or current_user.role in ADMIN_ROLES:
        return {"has_access": True, "status": "active", "message": ""}
    
    if current_user.role != "practitioner":
        return result
    
    patient = session.exec(
        select(Patient).where(Patient.user_id == user_id)
    ).first()
    if not patient:
        return {**result, "message": "Patient introuvable"}
    
    dmn = session.exec(
        select(DMN).where(DMN.patient_id == patient.id)
    ).first()
    if not dmn:
        return {**result, "message": "Dossier médical introuvable"}
    
    practitioner = session.exec(
        select(Practitioner).where(Practitioner.user_id == current_user.id)
    ).first()
    if not practitioner:
        return {**result, "message": "Profil praticien introuvable"}
    
    today = date.today()
    
    active = session.exec(
        select(Authorization).where(
            Authorization.practitioner_id == practitioner.id,
            Authorization.dmn_id == dmn.id,
            Authorization.is_actif == True,
            Authorization.expire_at >= today,
        )
    ).first()
    if active:
        return {
            "has_access": True,
            "status": "active",
            "message": "",
            "granted_at": active.granted_at.isoformat() if active.granted_at else None,
            "expire_at": active.expire_at.isoformat() if active.expire_at else None,
        }
    
    expired = session.exec(
        select(Authorization).where(
            Authorization.practitioner_id == practitioner.id,
            Authorization.dmn_id == dmn.id,
            Authorization.expire_at < today,
        )
    ).first()
    if expired:
        return {
            "has_access": False,
            "status": "expired",
            "message": "Votre autorisation d'accès a expiré. Veuillez faire une nouvelle demande.",
            "expire_at": expired.expire_at.isoformat() if expired.expire_at else None,
        }
    
    return result
