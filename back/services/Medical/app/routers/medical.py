from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pydantic import BaseModel

from app.database import get_session
from app.services.patient_service import create_patient
from app.services.practitioner_service import create_practitioner
from app.models.practitioner import Speciality

router = APIRouter(prefix="/api", tags=["medical"])


class EmergencyContactSchema(BaseModel):
    first_name: str
    last_name: str
    phone: str
    code_relation: str


class CreatePatientRequest(BaseModel):
    user_id: str
    emergency_contact: EmergencyContactSchema | None = None


class CreatePractitionerRequest(BaseModel):
    user_id: str
    specialty: Speciality
    order_number: str | None = None
    organization_id: str | None = None


@router.post("/patients", status_code=201)
def create_patient_endpoint(
    body: CreatePatientRequest,
    session: Session = Depends(get_session),
):
    contact_data = body.emergency_contact.model_dump() if body.emergency_contact else None
    patient = create_patient(
        session=session,
        user_id=body.user_id,
        emergency_contact=contact_data,
    )
    return {
        "id": str(patient.id),
        "user_id": patient.user_id,
        "emergency_contacts": [
            {
                "id": str(c.id),
                "first_name": c.first_name,
                "last_name": c.last_name,
                "phone": c.phone,
                "code_relation": c.code_relation,
            }
            for c in patient.emergency_contacts
        ],
    }


@router.post("/practitioners", status_code=201)
def create_practitioner_endpoint(
    body: CreatePractitionerRequest,
    session: Session = Depends(get_session),
):
    practitioner = create_practitioner(
        session=session,
        user_id=body.user_id,
        speciality=body.specialty,
        order_number=body.order_number,
        organization_id=body.organization_id,
    )
    return {
        "id": str(practitioner.id),
        "user_id": practitioner.user_id,
        "speciality": practitioner.speciality.value,
        "order_number": practitioner.order_number,
        "organization_id": practitioner.organization_id,
    }
