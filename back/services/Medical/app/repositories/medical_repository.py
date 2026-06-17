from uuid import UUID
from sqlmodel import Session, select

from app.models.patient import Patient
from app.models.dmn import DMN
from app.models.diagnosis import Diagnosis
from app.models.diagnosis_reference import DiagnosisReference
from app.models.medical_act import MedicalAct
from app.models.prescription_examen import PrescriptionExamen
from app.models.authorization import Authorization

from app.models.practitioner import Practitioner
from app.models.practitioner_role import PractitionerRole
from app.models.healthcare_system import HealthcareSystem
from app.models.allergy import Allergy
from app.models.examination_act import ExaminationAct
from app.models.examination import Examination
from app.models.vaccine import Vaccine
from app.models.consultation import Consultation
from app.models.vaccination import Vaccination
from app.models.reaction import Reaction
from app.models.reaction_reference import ReactionReference as ReactionRef
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
            select(Diagnosis, DiagnosisReference, Allergy)
            .outerjoin(DiagnosisReference, DiagnosisReference.id == Diagnosis.diagnosis_ref_id)
            .outerjoin(Allergy, Allergy.id == Diagnosis.id)
            .where(Diagnosis.medical_act_id.in_(ma_ids))
            .where(Diagnosis.type_diagnosis == "allergy")
        ).all()

        result = []
        for d, dr, a in rows:
            rxn_rows = session.exec(
                select(ReactionRef, Reaction)
                .join(Reaction, Reaction.reaction_reference_code == ReactionRef.code)
                .where(Reaction.allergy_id == a.id)
            ).all()
            reactions = [
                {"code": ref.code, "libelle": ref.libelle, "severity": rxn.severity}
                for ref, rxn in rxn_rows
            ]

            result.append({
                "id": d.id,
                "date": d.date_diagnosis,
                "note_clinique": d.note_clinique,
                "statut_verification": d.statut_verification.value if d.statut_verification else "",
                "ref_code": dr.code_cid11 if dr else None,
                "ref_libelle": dr.libelle if dr else None,
                "nature_allergie": a.nature_allergie if a else "",
                "categorie": a.categorie if a else "",
                "libelle": a.libelle if a else "",
                "criticite": a.criticite if a else "",
                "statut_clinique": a.statut_clinique if a else "",
                "discover_at": a.discover_at if a else None,
                "reactions_text": a.reactions_text if a else "",
                "reactions": reactions,
            })
        return result

    @classmethod
    def get_examens(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            select(MedicalAct, ExaminationAct)
            .outerjoin(ExaminationAct, ExaminationAct.id == MedicalAct.id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(MedicalAct.type_acte == TypeActe.EXAMEN)
            .order_by(MedicalAct.id)
        ).all()

        result = []
        for ma, ea in rows:
            result.append({
                "id": ma.id,
                "type": ma.type_acte.value,
                "raisons": ma.raisons,
                "rapport_text": ma.rapport_text,
                "observations_text": ma.observations_text,
                "libelle_examen": ea.libelle_examen if ea else "",
                "type_examen": ea.type_examen if ea else "",
                "code_loinc": ea.code_loinc if ea else "",
                "value": ea.value if ea else "",
                "interpretation": ea.interpretation if ea else "",
                "image_path": ea.image_path if ea else None,
            })
        return result

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

        rows = session.execute(
            select(PrescriptionExamen, Examination, Vaccine)
            .outerjoin(Examination, Examination.id == PrescriptionExamen.id)
            .outerjoin(Vaccine, Vaccine.id == PrescriptionExamen.id)
            .where(PrescriptionExamen.medical_act_id.in_(ma_ids))
            .order_by(PrescriptionExamen.date_prescription.desc())
        ).all()

        result = []
        for pe, e, v in rows:
            result.append({
                "id": pe.id,
                "date_prescription": pe.date_prescription,
                "statut": pe.statut.value if pe.statut else "",
                "special_instructions": pe.special_instructions,
                "type_prescription": pe.type_prescription.value if pe.type_prescription else "",
                "code_loinc": e.code_loinc if e else None,
                "examen_libelle": e.libelle if e else None,
                "nature_examination": e.nature_examination if e else None,
                "code_cvx": v.code_cvx if v else None,
                "vaccine_libelle": v.libelle if v else None,
            })
        return result

    @classmethod
    def get_authorizations(cls, session: Session, user_id: str) -> list[Authorization]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        return list(session.exec(
            select(Authorization).where(Authorization.dmn_id == dmn_id)
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
            select(Diagnosis, DiagnosisReference)
            .outerjoin(DiagnosisReference, DiagnosisReference.id == Diagnosis.diagnosis_ref_id)
            .where(Diagnosis.medical_act_id.in_(ma_ids))
            .where(Diagnosis.type_diagnosis == "disease")
            .order_by(Diagnosis.date_diagnosis.desc())
        ).all()

        result = []
        for d, dr in rows:
            result.append({
                "id": d.id,
                "date": d.date_diagnosis,
                "note_clinique": d.note_clinique,
                "statut_verification": d.statut_verification.value if d.statut_verification else "",
                "ref_code": dr.code_cid11 if dr else None,
                "ref_libelle": dr.libelle if dr else None,
            })
        return result

    @classmethod
    def get_consultations(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            select(MedicalAct, Consultation, PractitionerRole, Practitioner, HealthcareSystem)
            .outerjoin(Consultation, Consultation.id == MedicalAct.id)
            .outerjoin(PractitionerRole, PractitionerRole.id == MedicalAct.practitioner_role_id)
            .outerjoin(Practitioner, Practitioner.id == PractitionerRole.practitioner_id)
            .outerjoin(HealthcareSystem, HealthcareSystem.id == PractitionerRole.health_care_system_id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(MedicalAct.type_acte == TypeActe.CONSULTATION)
            .order_by(MedicalAct.id)
        ).all()

        result = []
        for ma, c, pr, p, hs in rows:
            result.append({
                "id": ma.id,
                "duree_minutes": c.duree_minutes if c else None,
                "motif": c.motif if c else None,
                "raisons": ma.raisons,
                "rapport_text": ma.rapport_text,
                "observations_text": ma.observations_text,
                "practitioner_role": pr.role if pr else None,
                "practitioner_user_id": p.user_id if p else None,
                "speciality": p.speciality.value if p else None,
                "healthcare_nom": hs.nom if hs else None,
            })
        return result

    @classmethod
    def get_vaccinations(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            select(MedicalAct, Vaccination)
            .outerjoin(Vaccination, Vaccination.id == MedicalAct.id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(MedicalAct.type_acte == TypeActe.VACCINATION)
            .order_by(MedicalAct.id)
        ).all()

        result = []
        for ma, v in rows:
            result.append({
                "id": ma.id,
                "raisons": ma.raisons,
                "rapport_text": ma.rapport_text,
                "observations_text": ma.observations_text,
                "injection_site": v.injection_site if v else None,
                "sequence_dose": v.sequence_dose if v else None,
                "batch_number": v.batch_number if v else None,
                "next_reminder": v.next_reminder if v else None,
                "note": v.note if v else None,
            })
        return result
