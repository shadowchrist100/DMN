from uuid import UUID
from sqlmodel import Session
from app.models.relative import Relative
from app.models.patient_relative import PatientRelative
from app.schemas.patient import RelativeReq


class RelativeRepository:

    @staticmethod
    def create(
        session: Session,
        patient_id: UUID,
        data: RelativeReq,
    ) -> Relative:
        contact = Relative(
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
        )
        session.add(contact)
        session.flush()

        relation = PatientRelative(
            patient_id=patient_id,
            relative_id=contact.id,
            code_relation=data.code_relation,
        )
        session.add(relation)

        return contact
