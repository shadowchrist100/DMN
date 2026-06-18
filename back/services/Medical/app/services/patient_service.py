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

        patient = PatientRepository.create(session, req.user_id, req.first_name, req.last_name)

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

    @staticmethod
    def create_dmn(session: Session, user_id: str):
        from app.exceptions import not_found, conflict
        from app.repositories.dmn_repository import DMNRepository
        from app.models.dmn import DMN

        patient = PatientRepository.get_by_user_id(session, user_id)
        if not patient:
            not_found("Patient introuvable")
        
        if DMNRepository.get_by_patient_id(session, patient.id):
            conflict("Un DMN existe déjà pour ce patient")

        dmn = DMN(patient_id=patient.id)
        session.add(dmn)
        session.commit()
        session.refresh(dmn)
        return dmn
