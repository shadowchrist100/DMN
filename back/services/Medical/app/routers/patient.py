from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.patient import CreatePatientReq, PatientResp, EmergencyContactResp
from app.services.patient_service import PatientService

router = APIRouter(prefix="/api", tags=["patient"])


@router.post("/patients", status_code=201, response_model=PatientResp)
def create_patient(
    body: CreatePatientReq,
    session: Session = Depends(get_session),
):
    patient = PatientService.create(session, body)
    return PatientResp(
        id=str(patient.id),
        user_id=patient.user_id,
        emergency_contacts=[
            EmergencyContactResp(
                id=str(c.id),
                first_name=c.first_name,
                last_name=c.last_name,
                phone=c.phone,
                code_relation=c.code_relation,
            )
            for c in patient.emergency_contacts
        ],
    )
