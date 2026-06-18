from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.database import get_session
from app.auth import CurrentUser, verify_jwt
from app.schemas.medical import (
    VitalConstantRefResp,
    DiagnosisRefResp,
    MedicationRefResp,
)
from app.models.vital_constant_reference import VitalConstantReference
from app.models.diagnosis_reference import DiagnosisReference
from app.models.medication_reference import MedicationReference

router = APIRouter(prefix="/api", tags=["references"])


@router.get("/vital-constant-references", response_model=list[VitalConstantRefResp])
def get_vital_constant_refs(
    session: Session = Depends(get_session),
    _current_user: CurrentUser = Depends(verify_jwt),
):
    refs = session.exec(select(VitalConstantReference)).all()
    return [
        VitalConstantRefResp(code=r.code, nom=r.nom, unite_mesure=r.unite_mesure)
        for r in refs
    ]


@router.get("/diagnosis-references", response_model=list[DiagnosisRefResp])
def get_diagnosis_refs(
    q: str = "",
    session: Session = Depends(get_session),
    _current_user: CurrentUser = Depends(verify_jwt),
):
    query = select(DiagnosisReference)
    if q:
        query = query.where(
            DiagnosisReference.libelle.ilike(f"%{q}%")
            | DiagnosisReference.code_cid11.ilike(f"%{q}%")
        )
    refs = session.exec(query.order_by(DiagnosisReference.code_cid11).limit(50)).all()
    return [
        DiagnosisRefResp(
            id=str(r.id),
            code_cid11=r.code_cid11,
            libelle=r.libelle,
            type_ref="maladie",
        )
        for r in refs
    ]


@router.get("/medication-references", response_model=list[MedicationRefResp])
def get_medication_refs(
    q: str = "",
    session: Session = Depends(get_session),
    _current_user: CurrentUser = Depends(verify_jwt),
):
    query = select(MedicationReference)
    if q:
        query = query.where(
            MedicationReference.nom_commercial.ilike(f"%{q}%")
            | MedicationReference.dc_nom.ilike(f"%{q}%")
        )
    refs = session.exec(query.order_by(MedicationReference.nom_commercial).limit(50)).all()
    return [
        MedicationRefResp(
            id=str(r.id),
            code_medicament=r.code_medicament,
            nom_commercial=r.nom_commercial,
            dc_nom=r.dc_nom,
            forme_galenique=r.forme_galenique,
        )
        for r in refs
    ]
