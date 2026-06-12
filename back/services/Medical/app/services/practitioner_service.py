from sqlmodel import Session
from app.schemas.practitioner import CreatePractitionerReq
from app.repositories.practitioner_repository import PractitionerRepository
from app.exceptions import conflict
from app.models.practitioner import Practitioner


class PractitionerService:

    @staticmethod
    def create(session: Session, req: CreatePractitionerReq) -> Practitioner:
        if PractitionerRepository.exists_by_user_id(session, req.user_id):
            conflict("Un praticien avec ce user_id existe déjà")

        practitioner = PractitionerRepository.create(
            session,
            user_id=req.user_id,
            speciality=req.specialty,
            order_number=req.order_number,
            organization_id=req.organization_id,
        )

        session.commit()
        session.refresh(practitioner)
        return practitioner

    @staticmethod
    def get_by_user_id(session: Session, user_id: str) -> Practitioner | None:
        return PractitionerRepository.get_by_user_id(session, user_id)
