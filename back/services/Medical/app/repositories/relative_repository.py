from uuid import UUID
from typing import Optional
from sqlmodel import Session, select
from app.models.relative import Relative
from app.models.patient_relative import PatientRelative
from app.schemas.patient import RelativeReq, RelativeUpdateReq


class RelativeRepository:

    @staticmethod
    def create(
        session: Session,
        patient_id: UUID,
        data: RelativeReq,
    ) -> Relative:
        relative = Relative(
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            phone=data.phone,
        )
        session.add(relative)
        session.flush()

        patient_relation = PatientRelative(
            patient_id=patient_id,
            relative_id=relative.id,
            code_relation=data.code_relation,
            emergency_contact=True,
        )
        session.add(patient_relation)

        return relative

    @staticmethod
    def get_by_patient_id(
        session: Session,
        patient_id: UUID,
    ) -> list[tuple[Relative, PatientRelative]]:
        query = (
            select(Relative, PatientRelative)
            .join(PatientRelative, PatientRelative.relative_id == Relative.id)
            .where(PatientRelative.patient_id == patient_id)
        )
        return session.exec(query).all()

    @staticmethod
    def get_by_id(session: Session, relative_id: UUID) -> Optional[Relative]:
        return session.get(Relative, relative_id)

    @staticmethod
    def update(
        session: Session,
        relative: Relative,
        data: RelativeUpdateReq,
    ) -> Relative:
        if data.first_name is not None:
            relative.first_name = data.first_name
        if data.last_name is not None:
            relative.last_name = data.last_name
        if data.phone is not None:
            relative.phone = data.phone
        if data.email is not None:
            relative.email = data.email
        session.add(relative)
        return relative

    @staticmethod
    def update_relation(
        session: Session,
        patient_id: UUID,
        relative_id: UUID,
        data: RelativeUpdateReq,
    ) -> Optional[PatientRelative]:
        query = (
            select(PatientRelative)
            .where(PatientRelative.patient_id == patient_id)
            .where(PatientRelative.relative_id == relative_id)
        )
        patient_relation = session.exec(query).first()
        if patient_relation and data.code_relation is not None:
            patient_relation.code_relation = data.code_relation
        if patient_relation and data.emergency_contact is not None:
            patient_relation.emergency_contact = data.emergency_contact
        if patient_relation:
            session.add(patient_relation)
        return patient_relation

    @staticmethod
    def delete(session: Session, relative_id: UUID) -> None:
        relative = session.get(Relative, relative_id)
        if relative:
            session.delete(relative)

    @staticmethod
    def delete_relation(session: Session, patient_id: UUID, relative_id: UUID) -> None:
        query = (
            select(PatientRelative)
            .where(PatientRelative.patient_id == patient_id)
            .where(PatientRelative.relative_id == relative_id)
        )
        patient_relation = session.exec(query).first()
        if patient_relation:
            session.delete(patient_relation)
