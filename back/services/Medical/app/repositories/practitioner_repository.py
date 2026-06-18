from uuid import UUID
from datetime import date, datetime, timedelta
from sqlmodel import Session, select, func, or_
from app.models.practitioner import Practitioner
from app.models.practitioner_role import PractitionerRole
from app.models.medical_act import MedicalAct
from app.models.consultation import Consultation
from app.models.prescription_examen import PrescriptionExamen
from app.models.authorization import Authorization
from app.models.dmn import DMN
from app.models.patient import Patient
from app.models.diagnosis import Diagnosis
from app.models.allergy import Allergy
from app.types.enums import Speciality, TypeActe, Duration as DurationEnum, Perimeter


class PractitionerRepository:

    @staticmethod
    def create(
        session: Session,
        user_id: str,
        speciality: Speciality,
        order_number: str | None = None,
        organization_id: str | None = None,
    ) -> Practitioner:
        practitioner = Practitioner(
            user_id=user_id,
            speciality=speciality,
            order_number=order_number,
            organization_id=organization_id,
        )
        session.add(practitioner)
        session.flush()
        return practitioner

    @staticmethod
    def get_by_user_id(session: Session, user_id: str) -> Practitioner | None:
        return session.exec(
            select(Practitioner).where(Practitioner.user_id == user_id)
        ).first()

    @staticmethod
    def exists_by_user_id(session: Session, user_id: str) -> bool:
        return PractitionerRepository.get_by_user_id(session, user_id) is not None

    @classmethod
    def _get_practitioner_role_ids(cls, session: Session, user_id: str) -> list[UUID]:
        practitioner = cls.get_by_user_id(session, user_id)
        if not practitioner:
            return []
        return list(session.exec(
            select(PractitionerRole.id).where(
                PractitionerRole.practitioner_id == practitioner.id
            )
        ).all())

    @classmethod
    def _get_patient_dmn_ids(cls, session: Session, role_ids: list[UUID]) -> list[UUID]:
        if not role_ids:
            return []
        return list(session.exec(
            select(MedicalAct.dmn_id).where(
                MedicalAct.practitioner_role_id.in_(role_ids),
                MedicalAct.dmn_id.isnot(None),
            ).distinct()
        ).all())

    @classmethod
    def get_dashboard_stats(cls, session: Session, user_id: str) -> dict:
        role_ids = cls._get_practitioner_role_ids(session, user_id)
        dmn_ids = cls._get_patient_dmn_ids(session, role_ids)

        followed_patients = len(dmn_ids)

        month_ago = datetime.combine(date.today() - timedelta(days=30), datetime.min.time())
        new_patients = 0
        if dmn_ids:
            new_patients = len(session.exec(
                select(DMN.id).where(
                    DMN.id.in_(dmn_ids),
                    DMN.date_creation >= month_ago,
                )
            ).all())

        today = date.today()
        week_start = today - timedelta(days=today.weekday())

        consultations_this_week = 0
        completed_visits = 0
        upcoming_visits = 0

        if role_ids:
            acts = session.exec(
                select(MedicalAct, Consultation)
                .outerjoin(Consultation, Consultation.id == MedicalAct.id)
                .where(MedicalAct.practitioner_role_id.in_(role_ids))
                .where(MedicalAct.type_acte == TypeActe.CONSULTATION)
            ).all()

            for medical_act, consultation in acts:
                consultations_this_week += 1
                if consultation and consultation.duree_minutes is not None:
                    completed_visits += 1
                elif consultation and consultation.motif:
                    upcoming_visits += 1

        pending_reports = 0
        if role_ids:
            pending_reports = len(session.exec(
                select(MedicalAct.id).where(
                    MedicalAct.practitioner_role_id.in_(role_ids),
                    MedicalAct.rapport_text.is_(None),
                )
            ).all())

        return {
            "followed_patients": followed_patients,
            "new_patients_this_month": new_patients,
            "consultations_this_week": consultations_this_week,
            "completed_visits": completed_visits,
            "upcoming_visits": upcoming_visits,
            "pending_reports": pending_reports,
        }

    @classmethod
    def get_pending_access_requests(cls, session: Session, user_id: str) -> list[dict]:
        role_ids = cls._get_practitioner_role_ids(session, user_id)
        dmn_ids = cls._get_patient_dmn_ids(session, role_ids)
        if not dmn_ids:
            return []

        authorizations = session.exec(
            select(Authorization, DMN, Patient, Practitioner)
            .join(DMN, DMN.id == Authorization.dmn_id)
            .join(Patient, Patient.id == DMN.patient_id)
            .outerjoin(Practitioner, Practitioner.id == Authorization.practitioner_id)
            .where(Authorization.dmn_id.in_(dmn_ids))
            .where(Authorization.is_actif == False)
            .order_by(Authorization.granted_at.desc())
            .limit(20)
        ).all()

        result = []
        for auth, dmn, patient, practitioner in authorizations:
            result.append({
                "id": str(auth.id),
                "patient_npi": patient.user_id,
                "patient_name": f"Patient {patient.user_id[:8]}",
                "reason": f"Demande d'accès ({auth.authorization_type})",
                "requested_at": auth.granted_at.isoformat() if auth.granted_at else "",
                "urgency": "high" if auth.is_urgence else "medium",
                "requested_by_name": practitioner.user_id if practitioner else "Inconnu",
                "requested_by_role": practitioner.speciality.value if practitioner else "",
                "requested_by_facility": "",
                "expires_at": auth.expire_at.isoformat() if auth.expire_at else "",
            })
        return result

    @staticmethod
    def accept_access_request(
        session: Session,
        request_id: UUID,
    ) -> bool:
        auth = session.get(Authorization, request_id)
        if not auth:
            return False
        auth.is_actif = True
        session.add(auth)
        return True

    @staticmethod
    def decline_access_request(
        session: Session,
        request_id: UUID,
    ) -> bool:
        auth = session.get(Authorization, request_id)
        if not auth:
            return False
        session.delete(auth)
        return True

    @classmethod
    def get_recent_activities(cls, session: Session, user_id: str, limit: int = 10) -> list[dict]:
        role_ids = cls._get_practitioner_role_ids(session, user_id)
        if not role_ids:
            return []

        activities = []

        acts = session.exec(
            select(MedicalAct, Consultation, PractitionerRole, DMN, Patient)
            .outerjoin(Consultation, Consultation.id == MedicalAct.id)
            .join(PractitionerRole, PractitionerRole.id == MedicalAct.practitioner_role_id)
            .join(DMN, DMN.id == MedicalAct.dmn_id)
            .join(Patient, Patient.id == DMN.patient_id)
            .where(MedicalAct.practitioner_role_id.in_(role_ids))
            .order_by(MedicalAct.id.desc())
            .limit(limit)
        ).all()

        for medical_act, consultation, role, dmn, patient in acts:
            action = f"Consultation réalisée" if consultation else f"Acte médical ({medical_act.type_acte})"
            activities.append({
                "id": str(medical_act.id),
                "type": "consultation" if consultation else medical_act.type_acte.lower(),
                "action": action,
                "patient_name": f"Patient {patient.user_id[:8]}" if patient else None,
                "patient_npi": patient.user_id if patient else None,
                "facility": role.role if role else "",
                "timestamp": str(medical_act.id),
                "badge_text": "Finalisé" if medical_act.rapport_text else "En attente",
                "badge_type": "success" if medical_act.rapport_text else "warning",
            })

        return activities[:limit]

    @classmethod
    def get_patient_list(cls, session: Session, user_id: str) -> list[dict]:
        role_ids = cls._get_practitioner_role_ids(session, user_id)
        dmn_ids = cls._get_patient_dmn_ids(session, role_ids)
        if not dmn_ids:
            return []

        patients = session.exec(
            select(Patient).join(DMN, DMN.patient_id == Patient.id).where(
                DMN.id.in_(dmn_ids)
            ).distinct()
        ).all()

        result = []
        for patient in patients:
            dmn = session.exec(
                select(DMN).where(DMN.patient_id == patient.id)
            ).first()

            last_act = session.exec(
                select(MedicalAct).where(
                    MedicalAct.dmn_id == dmn.id,
                    MedicalAct.practitioner_role_id.in_(role_ids),
                ).order_by(MedicalAct.id.desc())
            ).first()

            critical_diagnosis = session.execute(
                select(Diagnosis, Allergy)
                .outerjoin(Allergy, Allergy.id == Diagnosis.id)
                .where(Diagnosis.medical_act_id.in_(
                    select(MedicalAct.id).where(MedicalAct.dmn_id == dmn.id)
                ))
                .where(Diagnosis.type_diagnosis == "allergy")
                .where(Allergy.criticite.in_(["haute", "élevée", "high"]))
            ).first()

            is_critical = critical_diagnosis is not None

            initials = ""
            name = f"Patient {patient.user_id[:8]}"

            result.append({
                "npi": patient.user_id,
                "name": name,
                "initials": initials or patient.user_id[:2].upper(),
                "age": 0,
                "gender": "M",
                "last_contact": str(last_act.id) if last_act else None,
                "priority": "critical" if is_critical else "low",
                "is_critical": is_critical,
                "primary_diagnosis_code": None,
                "primary_diagnosis_label": None,
                "next_appointment_date": None,
                "next_appointment_time": None,
                "active_prescriptions": 0,
            })

        return result

    @staticmethod
    def search_patients(session: Session, query: str) -> list[dict]:
        patients = session.exec(
            select(Patient).where(
                or_(
                    Patient.user_id.ilike(f"%{query}%"),
                )
            ).limit(20)
        ).all()

        result = []
        for patient in patients:
            result.append({
                "user_id": str(patient.user_id),
                "npi": patient.user_id,
                "full_name": None,
                "age": None,
                "gender": None,
                "phone": None,
                "city": None,
            })
        return result

    @classmethod
    def create_access_request(
        cls,
        session: Session,
        practitioner_user_id: str,
        patient_user_id: str,
        reason: str,
        duration: str,
        perimeter: str,
    ) -> dict | None:
        practitioner = cls.get_by_user_id(session, practitioner_user_id)
        if not practitioner:
            return None

        patient = session.exec(
            select(Patient).where(Patient.user_id == patient_user_id)
        ).first()
        if not patient:
            return None

        dmn = session.exec(
            select(DMN).where(DMN.patient_id == patient.id)
        ).first()
        if not dmn:
            return None

        duration_enum = DurationEnum(duration) if duration in [e.value for e in DurationEnum] else DurationEnum.H_24
        perimeter_enum = Perimeter(perimeter) if perimeter in [e.value for e in Perimeter] else Perimeter.ALL
        today = date.today()

        auth = Authorization(
            perimeter=perimeter_enum,
            granted_at=today,
            expire_at=today,
            duration=duration_enum,
            is_actif=False,
            is_urgence=False,
            authorization_type=reason,
            dmn_id=dmn.id,
            practitioner_id=practitioner.id,
        )
        session.add(auth)
        session.flush()
        session.refresh(auth)

        return {
            "id": str(auth.id),
            "status": "pending",
        }
