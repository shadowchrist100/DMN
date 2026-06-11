from uuid import UUID
from sqlmodel import Session
from app.models.patient import Patient
from app.models.emergencyContacts import EmergencyContact
from datetime import date


def create_patient(
    session: Session,
    user_id: str,
    emergency_contact: dict | None = None,
) -> Patient:
    patient = Patient(
        user_id=user_id,
    )
    session.add(patient)
    session.flush()

    if emergency_contact:
        contact = EmergencyContact(
            patient_id=patient.id,
            first_name=emergency_contact.get("first_name"),
            last_name=emergency_contact.get("last_name"),
            phone=emergency_contact.get("phone"),
            code_relation=emergency_contact.get("code_relation"),
        )
        session.add(contact)

    session.commit()
    session.refresh(patient)
    return patient


def get_patient_by_user_id(session: Session, user_id: str) -> Patient | None:
    return session.query(Patient).where(Patient.user_id == user_id).first()
