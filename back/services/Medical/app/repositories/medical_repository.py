from uuid import UUID
from sqlmodel import Session, select, text
from app.models.patient import Patient
from app.models.dmn import DMN
from app.models.medical_act import MedicalAct
from app.models.diagnosis_reference import DiagnosisReference
from app.models.prescription import Prescription
from app.models.authorization import Authorization
from app.models.consent import Consent
from app.models.practitioner import Practitioner
from app.models.practitioner_role import PractitionerRole
from app.types.enums import TypeActe


class MedicalRepository:

    @staticmethod
    def get_patient_by_user_id(session: Session, user_id: str) -> Patient | None:
        return session.exec(
            select(Patient).where(Patient.user_id == user_id)
        ).first()

    @staticmethod
    def get_dmn_by_patient_id(session: Session, patient_id: UUID) -> DMN | None:
        return session.exec(
            select(DMN).where(DMN.patient_id == patient_id)
        ).first()

    @classmethod
    def get_dmn_id_by_user_id(cls, session: Session, user_id: str) -> UUID | None:
        patient = cls.get_patient_by_user_id(session, user_id)
        if not patient:
            return None
        dmn = cls.get_dmn_by_patient_id(session, patient.id)
        if not dmn:
            return None
        return dmn.id

    @classmethod
    def get_allergies(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        ma_ids = session.exec(
            select(MedicalAct.id).where(MedicalAct.dmn_id == dmn_id)
        ).all()

        if not ma_ids:
            return []

        rows = session.execute(
            text("""
                SELECT d.id, d.date, d.note_clinique, d.statut_verification,
                       dr.cid11 AS ref_code, dr.libelle AS ref_libelle,
                       a.nature_allergie, a.categorie, a.libelle, a.criticite,
                       a.statut_clinique, a.discover_at, a.reactions_text
                FROM diagnosis d
                LEFT JOIN diagnosis_reference dr ON dr.id = d.diagnosis_ref_id
                LEFT JOIN allergy a ON a.id = d.id
                WHERE d.medical_act_id IN :ma_ids
                  AND d.type = 'allergy'
            """),
            {"ma_ids": tuple(ma_ids)}
        ).mappings().all()

        return [dict(r) for r in rows]

    @classmethod
    def get_examens(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            text("""
                SELECT ma.id, ma.type, ma.raisons, ma.rapport_text, ma.observations_text,
                       ea.code_loinc, ea.libelle_examen, ea.type_examen,
                       ea.value, ea.interpretation, ea.image_path
                FROM medical_act ma
                LEFT JOIN examination_act ea ON ea.id = ma.id
                WHERE ma.dmn_id = :dmn_id AND ma.type = :act_type
                ORDER BY ma.id
            """),
            {"dmn_id": dmn_id, "act_type": TypeActe.EXAMEN.value}
        ).mappings().all()

        return [dict(r) for r in rows]

    @classmethod
    def get_prescriptions(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        ma_ids = session.exec(
            select(MedicalAct.id).where(MedicalAct.dmn_id == dmn_id)
        ).all()

        if not ma_ids:
            return []

        diag_ids = session.execute(
            text("SELECT id FROM diagnosis WHERE medical_act_id IN :ma_ids"),
            {"ma_ids": tuple(ma_ids)}
        ).scalars().all()

        if not diag_ids:
            return []

        rows = session.execute(
            text("""
                SELECT p.id, p.date_prescription, p.statut, p.special_instructions,
                       p.type_prescription,
                       e.code_loinc, e.libelle AS examen_libelle, e.nature_examination,
                       v.code_cvx, v.libelle AS vaccine_libelle
                FROM prescription p
                LEFT JOIN examination e ON e.id = p.id AND p.type_prescription = 'EXAMINATION'
                LEFT JOIN vaccine v ON v.id = p.id AND p.type_prescription = 'VACCIN'
                WHERE p.diagnosis_id IN :diag_ids
                ORDER BY p.date_prescription DESC
            """),
            {"diag_ids": tuple(diag_ids)}
        ).mappings().all()

        return [dict(r) for r in rows]

    @classmethod
    def get_authorizations(cls, session: Session, user_id: str) -> list[Authorization]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        return list(session.exec(
            select(Authorization).where(Authorization.dmn_id == dmn_id)
        ).all())

    @classmethod
    def get_consents(cls, session: Session, user_id: str) -> list[Consent]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        return list(session.exec(
            select(Consent).where(Consent.dmn_id == dmn_id)
        ).all())

    @classmethod
    def get_diseases(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        ma_ids = session.exec(
            select(MedicalAct.id).where(MedicalAct.dmn_id == dmn_id)
        ).all()

        if not ma_ids:
            return []

        rows = session.execute(
            text("""
                SELECT d.id, d.date, d.note_clinique, d.statut_verification,
                       dr.cid11 AS ref_code, dr.libelle AS ref_libelle
                FROM diagnosis d
                LEFT JOIN diagnosis_reference dr ON dr.id = d.diagnosis_ref_id
                WHERE d.medical_act_id IN :ma_ids
                  AND d.type = 'disease'
                ORDER BY d.date DESC
            """),
            {"ma_ids": tuple(ma_ids)}
        ).mappings().all()

        return [dict(r) for r in rows]

    @classmethod
    def get_consultations(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            text("""
                SELECT ma.id, ma.raisons, ma.rapport_text, ma.observations_text,
                       c.duree_minutes,
                       pr.role AS practitioner_role,
                       p.user_id AS practitioner_user_id, p.speciality,
                       hs.nom AS healthcare_nom
                FROM medical_act ma
                LEFT JOIN consultation c ON c.id = ma.id
                LEFT JOIN practitioner_role pr ON pr.id = ma.practitioner_role_id
                LEFT JOIN practitioner p ON p.id = pr.practitioner_id
                LEFT JOIN healthcare_system hs ON hs.id = pr.health_care_system_id
                WHERE ma.dmn_id = :dmn_id AND ma.type = :act_type
                ORDER BY ma.id
            """),
            {"dmn_id": dmn_id, "act_type": TypeActe.CONSULTATION.value}
        ).mappings().all()

        return [dict(r) for r in rows]

    @classmethod
    def get_vaccinations(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            text("""
                SELECT ma.id, ma.raisons, ma.rapport_text, ma.observations_text,
                       v.injection_site, v.sequence_dose, v.batch_number,
                       v.next_reminder, v.note
                FROM medical_act ma
                LEFT JOIN vaccination v ON v.id = ma.id
                WHERE ma.dmn_id = :dmn_id AND ma.type = :act_type
                ORDER BY ma.id
            """),
            {"dmn_id": dmn_id, "act_type": TypeActe.VACCINATION.value}
        ).mappings().all()

        return [dict(r) for r in rows]
