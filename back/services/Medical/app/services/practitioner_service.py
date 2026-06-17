from datetime import date
from sqlmodel import Session, select
from app.schemas.practitioner import CreatePractitionerReq
from app.repositories.practitioner_repository import PractitionerRepository
from app.exceptions import conflict, not_found, bad_request
from app.models.practitioner import Practitioner
from app.models.practitioner_role import PractitionerRole
from app.models.healthcare_system import HealthcareSystem
from app.types.enums import StatutVerification


class PractitionerService:

    @staticmethod
    def create(session: Session, req: CreatePractitionerReq) -> Practitioner:
        if PractitionerRepository.exists_by_user_id(session, req.user_id):
            conflict("Un praticien avec ce user_id existe déjà")

        if req.organization_id:
            org = session.exec(
                select(HealthcareSystem).where(HealthcareSystem.id == req.organization_id)
            ).first()
            if not org:
                not_found("Organisation introuvable")
            if org.verification_status != StatutVerification.VALIDE:
                bad_request("L'organisation référencée n'est pas vérifiée")

        practitioner = PractitionerRepository.create(
            session,
            user_id=req.user_id,
            speciality=req.specialty,
            order_number=req.order_number,
            organization_id=req.organization_id,
        )

        if req.organization_id:
            role = PractitionerRole(
                practitioner_id=practitioner.id,
                health_care_system_id=org.id,
                role="medecin",
                start_date=date.today(),
            )
            session.add(role)

        session.commit()
        session.refresh(practitioner)
        return practitioner

    @staticmethod
    def get_by_user_id(session: Session, user_id: str) -> Practitioner | None:
        return PractitionerRepository.get_by_user_id(session, user_id)
