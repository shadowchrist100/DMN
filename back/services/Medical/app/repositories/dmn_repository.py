from uuid import UUID
from sqlmodel import Session, select
from app.models.dmn import DMN
from app.models.patient import Patient


class DMNRepository:

    @staticmethod
    def get_by_patient_id(session: Session, patient_id: UUID) -> DMN | None:
        return session.exec(
            select(DMN).where(DMN.patient_id == patient_id)
        ).first()

    @staticmethod
    def get_by_user_id(session: Session, user_id: str) -> DMN | None:
        patient = session.exec(
            select(Patient).where(Patient.user_id == user_id)
        ).first()
        if not patient:
            return None
        return session.exec(
            select(DMN).where(DMN.patient_id == patient.id)
        ).first()
