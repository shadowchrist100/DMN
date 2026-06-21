from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import Session, select
from datetime import date, timedelta
from uuid import UUID

from app.database import get_session
from app.models.authorization import Authorization
from app.models.dmn import DMN
from app.models.patient import Patient
from app.models.practitioner import Practitioner
from app.types.enums import Perimeter, Duration
from app.config import settings
from app.schemas.medical import MedicalActCreatedResp

router = APIRouter(prefix="/api/internal", tags=["internal"])


def verify_internal_key(x_api_key: str = Header(...)):
    expected = getattr(settings, "internal_api_key", None)
    if not expected or x_api_key != expected:
        raise HTTPException(status_code=403, detail="Accès interne refusé")


@router.post("/authorizations/urgence", response_model=MedicalActCreatedResp)
def create_emergency_authorization(
    patient_user_id: str,
    practitioner_user_id: str,
    type_autorisation: str,
    auteur_id: str,
    session: Session = Depends(get_session),
    _auth=Depends(verify_internal_key),
):
    patient = session.exec(
        select(Patient).where(Patient.user_id == patient_user_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    dmn = session.exec(
        select(DMN).where(DMN.patient_id == patient.id)
    ).first()
    if not dmn:
        raise HTTPException(status_code=404, detail="Dossier médical introuvable")

    practitioner = session.exec(
        select(Practitioner).where(Practitioner.user_id == practitioner_user_id)
    ).first()
    if not practitioner:
        raise HTTPException(status_code=404, detail="Praticien introuvable")

    today = date.today()
    auth = Authorization(
        perimeter=Perimeter.ALL,
        granted_at=today,
        expire_at=today + timedelta(hours=2),
        duration=Duration.H_2,
        is_actif=True,
        is_urgence=True,
        authorization_type="Protocole d'urgence",
        type_autorisation=type_autorisation,
        auteur_autorisation_id=auteur_id,
        dmn_id=dmn.id,
        practitioner_id=practitioner.id,
    )
    session.add(auth)
    session.commit()
    session.refresh(auth)

    return MedicalActCreatedResp(id=str(auth.id))
