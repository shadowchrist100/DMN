from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.practitioner import CreatePractitionerReq, PractitionerResp
from app.services.practitioner_service import PractitionerService

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
