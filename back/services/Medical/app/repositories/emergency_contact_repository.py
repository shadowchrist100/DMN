from uuid import UUID
from sqlmodel import Session
from app.models.emergency_contact import EmergencyContact
from app.schemas.patient import EmergencyContactReq


class EmergencyContactRepository:

    @staticmethod
    def create(
        session: Session,
        patient_id: UUID,
        data: EmergencyContactReq,
    ) -> EmergencyContact:
        contact = EmergencyContact(
            patient_id=patient_id,
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            code_relation=data.code_relation,
        )
        session.add(contact)
        session.flush()
        return contact
