from uuid import UUID
from sqlmodel import Session, select
from app.models.patient import Patient


class PatientRepository:

    @staticmethod
    def create(session: Session, user_id: str, first_name: str | None = None, last_name: str | None = None) -> Patient:
        patient = Patient(user_id=user_id, first_name=first_name, last_name=last_name)
        session.add(patient)
        session.flush()
        return patient

    @staticmethod
    def get_by_user_id(session: Session, user_id: str) -> Patient | None:
        return session.exec(
            select(Patient).where(Patient.user_id == user_id)
        ).first()

    @staticmethod
    def exists_by_user_id(session: Session, user_id: str) -> bool:
        return PatientRepository.get_by_user_id(session, user_id) is not None
