from sqlmodel import Session, select
from app.models.practitioner import Practitioner
from app.types.enums import Speciality


class PractitionerRepository:

    @staticmethod
    def create(
        session: Session,
        user_id: str,
        speciality: Speciality,
        order_number: str | None = None,
        organization_id: str | None = None,
    ) -> Practitioner:
        practitioner = Practitioner(
            user_id=user_id,
            speciality=speciality,
            order_number=order_number,
            organization_id=organization_id,
        )
        session.add(practitioner)
        session.flush()
        return practitioner

    @staticmethod
    def get_by_user_id(session: Session, user_id: str) -> Practitioner | None:
        return session.exec(
            select(Practitioner).where(Practitioner.user_id == user_id)
        ).first()

    @staticmethod
    def exists_by_user_id(session: Session, user_id: str) -> bool:
        return PractitionerRepository.get_by_user_id(session, user_id) is not None
