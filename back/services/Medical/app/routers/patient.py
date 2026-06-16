from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.patient import CreatePatientReq, PatientResp, EmergencyContactResp, RelatedPersonResp
from app.services.patient_service import PatientService

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
        emergency_contacts=[
            RelatedPersonResp(
                emergency_contact=EmergencyContactResp(
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
