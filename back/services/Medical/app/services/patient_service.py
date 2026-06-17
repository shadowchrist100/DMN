from uuid import UUID
from sqlmodel import Session, select
from app.schemas.patient import CreatePatientReq
from app.repositories.patient_repository import PatientRepository
from app.repositories.relative_repository import RelativeRepository
from app.exceptions import conflict
from app.models.patient import Patient
from app.models.patient_relative import PatientRelative
from app.models.relative import Relative


class PatientService:

    @staticmethod
    def create(session: Session, req: CreatePatientReq) -> Patient:
        if PatientRepository.exists_by_user_id(session, req.user_id):
            conflict("Un patient avec ce user_id existe déjà")

        patient = PatientRepository.create(session, req.user_id)

        if req.relative:
            RelativeRepository.create(
                session, patient.id, req.relative
            )

        session.commit()
        session.refresh(patient)
        return patient

    @staticmethod
    def get_by_user_id(session: Session, user_id: str) -> Patient | None:
        return PatientRepository.get_by_user_id(session, user_id)

    @staticmethod
    def get_related_persons(
        session: Session, patient_id: UUID
    ) -> list[tuple[Relative, PatientRelative]]:
        statement = (
            select(Relative, PatientRelative)
            .join(PatientRelative, PatientRelative.relative_id == Relative.id)
            .where(PatientRelative.patient_id == patient_id)
        )
        results = session.exec(statement).all()
        return [(contact, relation) for contact, relation in results]
