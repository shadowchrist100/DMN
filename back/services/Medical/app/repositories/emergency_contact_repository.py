from uuid import UUID
from sqlmodel import Session
from app.models.emergency_contact import EmergencyContact
from app.models.related_person import RelatedPerson
from app.schemas.patient import EmergencyContactReq


class EmergencyContactRepository:

    @staticmethod
    def create(
        session: Session,
        patient_id: UUID,
        data: EmergencyContactReq,
    ) -> EmergencyContact:
        contact = EmergencyContact(
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
        )
        session.add(contact)
        session.flush()

        relation = RelatedPerson(
            patient_id=patient_id,
            emergency_contact_id=contact.id,
            code_relation=data.code_relation,
        )
        session.add(relation)

        return contact
