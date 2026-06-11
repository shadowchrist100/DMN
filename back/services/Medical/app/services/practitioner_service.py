from sqlmodel import Session
from app.models.practitioner import Practitioner, Speciality


def create_practitioner(
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
    session.commit()
    session.refresh(practitioner)
    return practitioner


def get_practitioner_by_user_id(session: Session, user_id: str) -> Practitioner | None:
    return session.query(Practitioner).where(Practitioner.user_id == user_id).first()
