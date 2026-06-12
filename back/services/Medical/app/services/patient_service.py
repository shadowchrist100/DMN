from sqlmodel import Session
from app.schemas.patient import CreatePatientReq, PatientResp, EmergencyContactResp
from app.repositories.patient_repository import PatientRepository
from app.repositories.emergency_contact_repository import EmergencyContactRepository
from app.exceptions import conflict
from app.models.patient import Patient


class PatientService:

    @staticmethod
    def create(session: Session, req: CreatePatientReq) -> Patient:
        if PatientRepository.exists_by_user_id(session, req.user_id):
            conflict("Un patient avec ce user_id existe déjà")

        patient = PatientRepository.create(session, req.user_id)

        if req.emergency_contact:
            EmergencyContactRepository.create(
                session, patient.id, req.emergency_contact
            )

        session.commit()
        session.refresh(patient)
        return patient

    @staticmethod
    def get_by_user_id(session: Session, user_id: str) -> Patient | None:
        return PatientRepository.get_by_user_id(session, user_id)
