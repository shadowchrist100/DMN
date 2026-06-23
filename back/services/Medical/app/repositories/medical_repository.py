from uuid import UUID
from datetime import date, timedelta
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
from app.models.vital_constant import VitalConstant
from app.models.vital_constant_reference import VitalConstantReference
from app.models.vaccination import Vaccination
from app.models.reaction import Reaction
from app.models.reaction_reference import ReactionReference as ReactionRef
from app.models.prescription_order import PrescriptionOrder
from app.models.prescription_directive import PrescriptionDirective
from app.models.medication_directive import MedicationDirective
from app.models.medication_reference import MedicationReference
from app.models.prescription_de_soins import PrescriptionDeSoins
from app.models.prescription_examen import PrescriptionExamen
from app.types.enums import TypeActe, Duration as DurationEnum, Perimeter as PerimeterEnum


class MedicalRepository:

    @staticmethod
    def get_patient_by_user_id(session: Session, user_id: str) -> Patient | None:
        try:
            user_uuid = UUID(user_id)
            patient = session.get(Patient, user_uuid)
            if patient:
                return patient
        except ValueError:
            pass

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
            .select_from(Diagnosis)
            .outerjoin(DiagnosisReference, DiagnosisReference.id == Diagnosis.diagnosis_ref_id)
            .outerjoin(Allergy, Allergy.id == Diagnosis.id)
            .where(Diagnosis.medical_act_id.in_(ma_ids))
            .where(Diagnosis.type_diagnosis == "allergy")
        ).all()

        result = []
        for diagnosis, diagnosis_ref, allergy in rows:
            reaction_records = session.exec(
                select(ReactionRef, Reaction)
                .join(Reaction, Reaction.reaction_reference_code == ReactionRef.code)
                .where(Reaction.allergy_id == allergy.id)
            ).all()
            reactions = [
                {"code": reaction_ref.code, "libelle": reaction_ref.libelle, "severity": reaction.severity}
                for reaction_ref, reaction in reaction_records
            ]

            result.append({
                "id": diagnosis.id,
                "date": diagnosis.date_diagnosis,
                "note_clinique": diagnosis.note_clinique,
                "statut_verification": diagnosis.statut_verification or "",
                "ref_code": diagnosis_ref.code_cid11 if diagnosis_ref else None,
                "ref_libelle": diagnosis_ref.libelle if diagnosis_ref else None,
                "nature_allergie": allergy.nature_allergie if allergy else "",
                "categorie": allergy.categorie if allergy else "",
                "libelle": allergy.libelle if allergy else "",
                "criticite": allergy.criticite if allergy else "",
                "statut_clinique": allergy.statut_clinique if allergy else "",
                "discover_at": allergy.discover_at if allergy else None,
                "reactions_text": allergy.reactions_text if allergy else "",
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
            .select_from(MedicalAct)
            .outerjoin(ExaminationAct, ExaminationAct.id == MedicalAct.id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(MedicalAct.type_acte == TypeActe.EXAMEN)
            .order_by(MedicalAct.id)
        ).all()

        result = []
        for medical_act, examination_act in rows:
            result.append({
                "id": medical_act.id,
                "type": medical_act.type_acte,
                "raisons": medical_act.raisons,
                "rapport_text": medical_act.rapport_text,
                "observations_text": medical_act.observations_text,
                "libelle_examen": examination_act.libelle_examen if examination_act else "",
                "type_examen": examination_act.type_examen if examination_act else "",
                "code_loinc": examination_act.code_loinc if examination_act else "",
                "value": examination_act.value if examination_act else "",
                "interpretation": examination_act.interpretation if examination_act else "",
                "image_path": examination_act.image_path if examination_act else None,
            })
        return result

    @classmethod
    def get_prescriptions(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        medical_act_ids = session.exec(
            select(MedicalAct.id).where(MedicalAct.dmn_id == dmn_id)
        ).all()

        if not medical_act_ids:
            return []

        result = []

        # 1. Prescriptions d'examens et vaccins (PrescriptionExamen polymorphic)
        exam_rows = session.execute(
            select(PrescriptionExamen, Examination, Vaccine, MedicalAct, PractitionerRole, Practitioner)
            .select_from(PrescriptionExamen)
            .outerjoin(Examination, Examination.id == PrescriptionExamen.id)
            .outerjoin(Vaccine, Vaccine.id == PrescriptionExamen.id)
            .outerjoin(MedicalAct, MedicalAct.id == PrescriptionExamen.medical_act_id)
            .outerjoin(PractitionerRole, PractitionerRole.id == MedicalAct.practitioner_role_id)
            .outerjoin(Practitioner, Practitioner.id == PractitionerRole.practitioner_id)
            .where(PrescriptionExamen.medical_act_id.in_(medical_act_ids))
            .order_by(PrescriptionExamen.date_prescription.desc())
        ).all()

        for pe, examination, vaccine, medical_act, practitioner_role, practitioner in exam_rows:
            result.append({
                "id": str(pe.id),
                "uuid": str(pe.id),
                "date_prescription": pe.date_prescription.isoformat() if pe.date_prescription else None,
                "statut": pe.statut or "",
                "special_instructions": pe.special_instructions,
                "type_prescription": pe.type_prescription or "",
                "code_loinc": examination.code_loinc if examination else None,
                "examen_libelle": examination.libelle if examination else None,
                "nature_examination": examination.nature_examination if examination else None,
                "code_cvx": vaccine.code_cvx if vaccine else None,
                "vaccine_libelle": vaccine.libelle if vaccine else None,
                "prescripteur_nom": f"{practitioner.first_name} {practitioner.last_name}".strip() if practitioner else None,
                "prescripteur_specialite": practitioner.speciality.value if practitioner else None,
            })

        # 2. Prescriptions de médicaments (via PrescriptionOrder → MedicationDirective)
        for act_id in medical_act_ids:
            po = session.exec(
                select(PrescriptionOrder).where(PrescriptionOrder.medical_act_id == act_id)
            ).first()
            if not po:
                continue
            med_rows = session.execute(
                select(MedicationDirective, MedicationReference, MedicalAct, PractitionerRole, Practitioner)
                .select_from(MedicationDirective)
                .outerjoin(MedicationReference, MedicationReference.id == MedicationDirective.medication_ref_id)
                .outerjoin(PrescriptionOrder, PrescriptionOrder.id == MedicationDirective.prescription_order_id)
                .outerjoin(MedicalAct, MedicalAct.id == PrescriptionOrder.medical_act_id)
                .outerjoin(PractitionerRole, PractitionerRole.id == MedicalAct.practitioner_role_id)
                .outerjoin(Practitioner, Practitioner.id == PractitionerRole.practitioner_id)
                .where(MedicationDirective.prescription_order_id == po.id)
            ).all()
            for md, ref, medical_act, practitioner_role, practitioner in med_rows:
                result.append({
                    "id": str(md.id),
                    "uuid": str(md.id),
                    "date_prescription": medical_act.created_at.isoformat() if medical_act and medical_act.created_at else None,
                    "statut": "active",
                    "type_prescription": "medicament",
                    "code_loinc": None,
                    "examen_libelle": None,
                    "nature_examination": None,
                    "code_cvx": None,
                    "vaccine_libelle": None,
                    "nom_commercial": ref.nom_commercial if ref else None,
                    "dc_nom": ref.dc_nom if ref else None,
                    "forme_galenique": ref.forme_galenique if ref else None,
                    "posologie": md.posologie,
                    "duree_jours": md.duree_jours,
                    "prescripteur_nom": f"{practitioner.first_name} {practitioner.last_name}".strip() if practitioner else None,
                    "prescripteur_specialite": practitioner.speciality.value if practitioner else None,
                })

            # 3. Instructions de soins (PrescriptionDeSoins)
            soin_rows = session.execute(
                select(PrescriptionDeSoins, MedicalAct, PractitionerRole, Practitioner)
                .select_from(PrescriptionDeSoins)
                .outerjoin(PrescriptionOrder, PrescriptionOrder.id == PrescriptionDeSoins.prescription_order_id)
                .outerjoin(MedicalAct, MedicalAct.id == PrescriptionOrder.medical_act_id)
                .outerjoin(PractitionerRole, PractitionerRole.id == MedicalAct.practitioner_role_id)
                .outerjoin(Practitioner, Practitioner.id == PractitionerRole.practitioner_id)
                .where(PrescriptionDeSoins.prescription_order_id == po.id)
            ).all()
            for ps, medical_act, practitioner_role, practitioner in soin_rows:
                result.append({
                    "id": str(ps.id),
                    "uuid": str(ps.id),
                    "date_prescription": medical_act.created_at.isoformat() if medical_act and medical_act.created_at else None,
                    "statut": "active",
                    "type_prescription": "soins",
                    "code_loinc": None,
                    "examen_libelle": None,
                    "nature_examination": None,
                    "code_cvx": None,
                    "vaccine_libelle": None,
                    "sous_type": ps.sous_type,
                    "description_generale": ps.description_generale,
                    "nombre_seances": ps.nombre_seances,
                    "prescripteur_nom": f"{practitioner.first_name} {practitioner.last_name}".strip() if practitioner else None,
                    "prescripteur_specialite": practitioner.speciality.value if practitioner else None,
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

        medical_act_ids = session.exec(
            select(MedicalAct.id).where(MedicalAct.dmn_id == dmn_id)
        ).all()

        if not medical_act_ids:
            return []

        rows = session.execute(
            select(Diagnosis, DiagnosisReference)
            .outerjoin(DiagnosisReference, DiagnosisReference.id == Diagnosis.diagnosis_ref_id)
            .where(Diagnosis.medical_act_id.in_(medical_act_ids))
            .where(Diagnosis.type_diagnosis == "disease")
            .order_by(Diagnosis.date_diagnosis.desc())
        ).all()

        result = []
        for diagnosis, diagnosis_ref in rows:
            result.append({
                "id": diagnosis.id,
                "date": diagnosis.date_diagnosis,
                "note_clinique": diagnosis.note_clinique,
                "statut_verification": diagnosis.statut_verification or "",
                "ref_code": diagnosis_ref.code_cid11 if diagnosis_ref else None,
                "ref_libelle": diagnosis_ref.libelle if diagnosis_ref else None,
            })
        return result

    @classmethod
    def get_consultations(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            select(MedicalAct, Consultation, PractitionerRole, Practitioner, HealthcareSystem)
            .select_from(MedicalAct)
            .outerjoin(Consultation, Consultation.id == MedicalAct.id)
            .outerjoin(PractitionerRole, PractitionerRole.id == MedicalAct.practitioner_role_id)
            .outerjoin(Practitioner, Practitioner.id == PractitionerRole.practitioner_id)
            .outerjoin(HealthcareSystem, HealthcareSystem.id == PractitionerRole.health_care_system_id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(MedicalAct.type_acte == TypeActe.CONSULTATION)
            .order_by(MedicalAct.id)
        ).all()

        result = []
        for medical_act, consultation, practitioner_role, practitioner, healthcare_system in rows:
            # Constantes vitales
            vc_rows = session.execute(
                select(VitalConstant, VitalConstantReference)
                .outerjoin(VitalConstantReference, VitalConstantReference.code == VitalConstant.vital_constant_reference_code)
                .where(VitalConstant.medical_act_id == medical_act.id)
            ).all()
            vital_constants = [
                {
                    "code": vc.vital_constant_reference_code,
                    "valeur": vc.valeur,
                    "nom": ref.nom if ref else None,
                    "unite_mesure": ref.unite_mesure if ref else None,
                }
                for vc, ref in vc_rows
            ]

            # Diagnostics
            diag_rows = session.execute(
                select(Diagnosis, DiagnosisReference)
                .outerjoin(DiagnosisReference, DiagnosisReference.id == Diagnosis.diagnosis_ref_id)
                .where(Diagnosis.medical_act_id == medical_act.id)
            ).all()
            diagnoses = [
                {
                    "id": str(d.id),
                    "statut_verification": d.statut_verification,
                    "note_clinique": d.note_clinique,
                    "code_cim": ref.code_cid11 if ref else None,
                    "libelle": ref.libelle if ref else None,
                }
                for d, ref in diag_rows
            ]

            # Prescriptions liées à l'acte
            medications = []
            exam_prescriptions = []
            vaccine_prescriptions = []
            care_instructions = []

            po = session.exec(
                select(PrescriptionOrder).where(PrescriptionOrder.medical_act_id == medical_act.id)
            ).first()
            if po:
                # Médicaments
                med_rows = session.execute(
                    select(MedicationDirective, MedicationReference)
                    .outerjoin(MedicationReference, MedicationReference.id == MedicationDirective.medication_ref_id)
                    .where(MedicationDirective.prescription_order_id == po.id)
                ).all()
                medications = [
                    {
                        "id": str(md.id),
                        "nom_commercial": ref.nom_commercial if ref else None,
                        "dc_nom": ref.dc_nom if ref else None,
                        "forme_galenique": ref.forme_galenique if ref else None,
                        "posologie": md.posologie,
                        "duree_jours": md.duree_jours,
                    }
                    for md, ref in med_rows
                ]

                # Instructions de soins
                soin_rows = session.execute(
                    select(PrescriptionDeSoins)
                    .where(PrescriptionDeSoins.prescription_order_id == po.id)
                ).all()
                care_instructions = [
                    {
                        "id": str(ps.id),
                        "sous_type": ps.sous_type,
                        "description_generale": ps.description_generale,
                        "nombre_seances": ps.nombre_seances,
                        "frequence_hebdo": ps.frequence_hebdo,
                        "objectifs": ps.objectifs,
                        "titre_consigne": ps.titre_consigne,
                        "recommandations": ps.recommandations,
                    }
                    for ps, in soin_rows
                ]

            # Prescriptions d'examens (Examination)
            exam_rows = session.execute(
                select(Examination)
                .where(Examination.medical_act_id == medical_act.id)
            ).all()
            exam_prescriptions = [
                {
                    "id": str(ex.id),
                    "code_loinc": ex.code_loinc,
                    "libelle": ex.libelle,
                    "nature_examination": ex.nature_examination,
                    "special_instructions": ex.special_instructions,
                    "statut": ex.statut,
                }
                for ex, in exam_rows
            ]

            # Prescriptions de vaccins (Vaccine)
            vaccine_rows = session.execute(
                select(Vaccine)
                .where(Vaccine.medical_act_id == medical_act.id)
            ).all()
            vaccine_prescriptions = [
                {
                    "id": str(v.id),
                    "code_cvx": v.code_cvx,
                    "libelle": v.libelle,
                    "special_instructions": v.special_instructions,
                    "statut": v.statut,
                }
                for v, in vaccine_rows
            ]

            result.append({
                "id": str(medical_act.id),
                "created_at": medical_act.created_at.isoformat() if medical_act.created_at else None,
                "duree_minutes": consultation.duree_minutes if consultation else None,
                "motif": consultation.motif if consultation else None,
                "raisons": medical_act.raisons,
                "rapport_text": medical_act.rapport_text,
                "observations_text": medical_act.observations_text,
                "practitioner_role": practitioner_role.role if practitioner_role else None,
                "practitioner_user_id": practitioner.user_id if practitioner else None,
                "practitioner_first_name": practitioner.first_name if practitioner else None,
                "practitioner_last_name": practitioner.last_name if practitioner else None,
                "speciality": practitioner.speciality.value if practitioner else None,
                "healthcare_nom": healthcare_system.nom if healthcare_system else None,
                "vital_constants": vital_constants,
                "diagnoses": diagnoses,
                "medications": medications,
                "exam_prescriptions": exam_prescriptions,
                "vaccine_prescriptions": vaccine_prescriptions,
                "care_instructions": care_instructions,
            })
        return result

    @classmethod
    def get_all_medical_acts(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            select(MedicalAct, Consultation, PractitionerRole, Practitioner, HealthcareSystem)
            .select_from(MedicalAct)
            .outerjoin(Consultation, Consultation.id == MedicalAct.id)
            .outerjoin(PractitionerRole, PractitionerRole.id == MedicalAct.practitioner_role_id)
            .outerjoin(Practitioner, Practitioner.id == PractitionerRole.practitioner_id)
            .outerjoin(HealthcareSystem, HealthcareSystem.id == PractitionerRole.health_care_system_id)
            .where(MedicalAct.dmn_id == dmn_id)
            .order_by(MedicalAct.id)
        ).all()

        result = []
        for medical_act, consultation, practitioner_role, practitioner, healthcare_system in rows:
            type_acte = medical_act.type_acte or "Autre"

            # Constantes vitales
            vc_rows = session.execute(
                select(VitalConstant, VitalConstantReference)
                .outerjoin(VitalConstantReference, VitalConstantReference.code == VitalConstant.vital_constant_reference_code)
                .where(VitalConstant.medical_act_id == medical_act.id)
            ).all()
            vital_constants = [
                {"code": vc.vital_constant_reference_code, "valeur": vc.valeur,
                 "nom": ref.nom if ref else None, "unite_mesure": ref.unite_mesure if ref else None}
                for vc, ref in vc_rows
            ]

            # Diagnostics
            diag_rows = session.execute(
                select(Diagnosis, DiagnosisReference)
                .outerjoin(DiagnosisReference, DiagnosisReference.id == Diagnosis.diagnosis_ref_id)
                .where(Diagnosis.medical_act_id == medical_act.id)
            ).all()
            diagnoses = [
                {"id": str(d.id), "statut_verification": d.statut_verification,
                 "note_clinique": d.note_clinique, "code_cim": ref.code_cid11 if ref else None,
                 "libelle": ref.libelle if ref else None}
                for d, ref in diag_rows
            ]

            # Prescriptions liées à l'acte
            medications = []
            exam_prescriptions = []
            vaccine_prescriptions = []
            care_instructions = []

            po = session.exec(
                select(PrescriptionOrder).where(PrescriptionOrder.medical_act_id == medical_act.id)
            ).first()
            if po:
                med_rows = session.execute(
                    select(MedicationDirective, MedicationReference)
                    .outerjoin(MedicationReference, MedicationReference.id == MedicationDirective.medication_ref_id)
                    .where(MedicationDirective.prescription_order_id == po.id)
                ).all()
                medications = [
                    {"id": str(md.id), "nom_commercial": ref.nom_commercial if ref else None,
                     "dc_nom": ref.dc_nom if ref else None, "posologie": md.posologie,
                     "duree_jours": md.duree_jours}
                    for md, ref in med_rows
                ]

                soin_rows = session.execute(
                    select(PrescriptionDeSoins)
                    .where(PrescriptionDeSoins.prescription_order_id == po.id)
                ).all()
                care_instructions = [
                    {"id": str(ps.id), "sous_type": ps.sous_type,
                     "description_generale": ps.description_generale,
                     "nombre_seances": ps.nombre_seances}
                    for ps, in soin_rows
                ]

            exam_rows = session.execute(
                select(Examination).where(Examination.medical_act_id == medical_act.id)
            ).all()
            exam_prescriptions = [
                {"id": str(ex.id), "code_loinc": ex.code_loinc, "libelle": ex.libelle,
                 "nature_examination": ex.nature_examination,
                 "special_instructions": ex.special_instructions, "statut": ex.statut}
                for ex, in exam_rows
            ]

            vaccine_rows = session.execute(
                select(Vaccine).where(Vaccine.medical_act_id == medical_act.id)
            ).all()
            vaccine_prescriptions = [
                {"id": str(v.id), "code_cvx": v.code_cvx, "libelle": v.libelle,
                 "special_instructions": v.special_instructions, "statut": v.statut}
                for v, in vaccine_rows
            ]

            result.append({
                "id": str(medical_act.id),
                "type_acte": type_acte,
                "created_at": medical_act.created_at.isoformat() if medical_act.created_at else None,
                "duree_minutes": consultation.duree_minutes if consultation else None,
                "motif": consultation.motif if consultation else None,
                "raisons": medical_act.raisons,
                "rapport_text": medical_act.rapport_text,
                "observations_text": medical_act.observations_text,
                "practitioner_name": f"{practitioner.first_name or ''} {practitioner.last_name or ''}".strip() if practitioner else None,
                "practitioner_speciality": practitioner.speciality.value if practitioner and practitioner.speciality else None,
                "healthcare_nom": healthcare_system.nom if healthcare_system else None,
                "vital_constants": vital_constants,
                "diagnoses": diagnoses,
                "medications": medications,
                "exam_prescriptions": exam_prescriptions,
                "vaccine_prescriptions": vaccine_prescriptions,
                "care_instructions": care_instructions,
            })
        return result

    @classmethod
    def get_vaccinations(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            select(MedicalAct, Vaccination)
            .select_from(MedicalAct)
            .outerjoin(Vaccination, Vaccination.id == MedicalAct.id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(MedicalAct.type_acte == TypeActe.VACCINATION)
            .order_by(MedicalAct.id)
        ).all()

        result = []
        for medical_act, vaccination in rows:
            result.append({
                "id": medical_act.id,
                "raisons": medical_act.raisons,
                "rapport_text": medical_act.rapport_text,
                "observations_text": medical_act.observations_text,
                "injection_site": vaccination.injection_site if vaccination else None,
                "sequence_dose": vaccination.sequence_dose if vaccination else None,
                "batch_number": vaccination.batch_number if vaccination else None,
                "next_reminder": vaccination.next_reminder if vaccination else None,
                "note": vaccination.note if vaccination else None,
            })
        return result

    @classmethod
    def get_dashboard_stats(cls, session: Session, user_id: str) -> dict:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return {
                "examens_count": 0,
                "prescriptions_count": 0,
                "allergies_count": 0,
                "consentements_count": 0,
                "pathologies_count": 0,
                "consultations_count": 0,
                "vaccinations_count": 0,
            }

        medical_act_ids = session.exec(
            select(MedicalAct.id).where(MedicalAct.dmn_id == dmn_id)
        ).all()

        allergies_count = 0
        pathologies_count = 0
        if medical_act_ids:
            diagnosis_rows = session.execute(
                select(Diagnosis.type_diagnosis)
                .where(Diagnosis.medical_act_id.in_(medical_act_ids))
            ).all()
            for diagnosis_row in diagnosis_rows:
                if diagnosis_row.type_diagnosis == "allergy":
                    allergies_count += 1
                elif diagnosis_row.type_diagnosis == "disease":
                    pathologies_count += 1

        prescriptions_count = 0
        if medical_act_ids:
            prescriptions_count = len(session.exec(
                select(PrescriptionExamen.id).where(
                    PrescriptionExamen.medical_act_id.in_(medical_act_ids)
                )
            ).all())

        examens_count = len(session.exec(
            select(MedicalAct.id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(MedicalAct.type_acte == TypeActe.EXAMEN)
        ).all())

        consultations_count = len(session.exec(
            select(MedicalAct.id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(MedicalAct.type_acte == TypeActe.CONSULTATION)
        ).all())

        vaccinations_count = len(session.exec(
            select(MedicalAct.id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(MedicalAct.type_acte == TypeActe.VACCINATION)
        ).all())

        authorizations_count = len(session.exec(
            select(Authorization.id).where(Authorization.dmn_id == dmn_id)
        ).all())

        return {
            "examens_count": examens_count,
            "prescriptions_count": prescriptions_count,
            "allergies_count": allergies_count,
            "consentements_count": authorizations_count,
            "pathologies_count": pathologies_count,
            "consultations_count": consultations_count,
            "vaccinations_count": vaccinations_count,
        }

    @classmethod
    def get_alerts(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        alerts = []
        medical_act_ids = session.exec(
            select(MedicalAct.id).where(MedicalAct.dmn_id == dmn_id)
        ).all()

        if medical_act_ids:
            active_prescriptions = session.exec(
                select(PrescriptionExamen).where(
                    PrescriptionExamen.medical_act_id.in_(medical_act_ids),
                    PrescriptionExamen.statut.in_(["EN_COURS", "en_cours"]),
                ).order_by(PrescriptionExamen.date_prescription.desc()).limit(5)
            ).all()
            for prescription in active_prescriptions:
                alerts.append({
                    "id": str(prescription.id),
                    "type": "prescription",
                    "message": f"Prescription active: {prescription.special_instructions or 'Traitement en cours'}",
                    "date": prescription.date_prescription.isoformat() if prescription.date_prescription else "",
                    "auteur": None,
                })

        if medical_act_ids:
            critical_allergies = session.execute(
                select(Diagnosis, Allergy)
                .select_from(Diagnosis)
                .outerjoin(Allergy, Allergy.id == Diagnosis.id)
                .where(Diagnosis.medical_act_id.in_(medical_act_ids))
                .where(Diagnosis.type_diagnosis == "allergy")
                .where(Allergy.criticite.in_(["haute", "élevée", "high"]))
                .order_by(Diagnosis.date_diagnosis.desc()).limit(5)
            ).all()
            for diagnosis, allergy in critical_allergies:
                alerts.append({
                    "id": str(diagnosis.id),
                    "type": "urgence",
                    "message": f"Allergie critique: {allergy.libelle if allergy else 'Allergie'} — {allergy.criticite if allergy else ''}",
                    "date": diagnosis.date_diagnosis.isoformat() if diagnosis.date_diagnosis else "",
                    "auteur": None,
                })

        return alerts

    @classmethod
    def get_access_log(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        rows = session.execute(
            select(MedicalAct, PractitionerRole, Practitioner, HealthcareSystem)
            .outerjoin(PractitionerRole, PractitionerRole.id == MedicalAct.practitioner_role_id)
            .outerjoin(Practitioner, Practitioner.id == PractitionerRole.practitioner_id)
            .outerjoin(HealthcareSystem, HealthcareSystem.id == PractitionerRole.health_care_system_id)
            .where(MedicalAct.dmn_id == dmn_id)
            .order_by(MedicalAct.id.desc())
            .limit(10)
        ).all()

        seen = set()
        entries = []
        for medical_act, practitioner_role, practitioner, healthcare_system in rows:
            if practitioner and practitioner.user_id not in seen:
                seen.add(practitioner.user_id)
                p_name = f"Dr. {practitioner.first_name or ''} {practitioner.last_name or ''}".strip() if practitioner else "Praticien"
                entries.append({
                    "id": str(medical_act.id),
                    "qui": p_name,
                    "role": practitioner_role.role if practitioner_role else (practitioner.speciality.value if practitioner.speciality else "Médecin"),
                    "date": str(medical_act.id),
                    "icon": "stethoscope",
                })

        return entries[:10]

    @classmethod
    def get_timeline(cls, session: Session, user_id: str) -> list[dict]:
        acts = cls.get_all_medical_acts(session, user_id)
        events = []
        for act in acts:
            type_acte = act.get("type_acte", "Autre")
            motif = act.get("motif") or ""
            practitioner_name = act.get("practitioner_name") or ""

            has_vitals = bool(act.get("vital_constants"))
            has_exam_rx = bool(act.get("exam_prescriptions"))
            has_vaccine_rx = bool(act.get("vaccine_prescriptions"))
            has_meds = bool(act.get("medications"))

            if type_acte == "Consultation":
                title = f"Consultation — {motif}" if motif else "Consultation médicale"
                event_type = "consultation"
                icon = "stethoscope"
                badge_text = "Consultation"
                badge_type = "completed"
            elif type_acte == "Examen":
                libelle = motif or "Examen"
                title = f"Examen — {libelle}"
                event_type = "examen"
                icon = "biotech"
                badge_text = "Examen"
                badge_type = "completed"
            elif type_acte == "VACCINATION":
                libelle = motif or "Vaccination"
                title = f"Vaccination — {libelle}"
                event_type = "vaccination"
                icon = "vaccines"
                badge_text = "Effectué"
                badge_type = "completed"
            else:
                title = f"Acte médical — {motif}" if motif else "Acte médical"
                event_type = "consultation"
                icon = "medical_information"
                badge_text = type_acte
                badge_type = "completed"

            events.append({
                "id": act.get("id"),
                "type": event_type,
                "type_acte": type_acte,
                "title": title,
                "description": act.get("raisons") or "",
                "date": act.get("created_at") or "",
                "facility": act.get("healthcare_nom"),
                "practitioner_name": practitioner_name,
                "practitioner_role": None,
                "priority": "medium",
                "status": "completed",
                "diagnosis": act.get("rapport_text") or None,
                "notes": act.get("observations_text") or None,
                "observations_text": act.get("observations_text"),
                "motif": motif,
                "duree_minutes": act.get("duree_minutes"),
                "icon": icon,
                "badge_text": badge_text,
                "badge_type": badge_type,
                "vital_constants": act.get("vital_constants", []),
                "diagnoses": act.get("diagnoses", []),
                "medications": act.get("medications", []),
                "exam_prescriptions": act.get("exam_prescriptions", []),
                "vaccine_prescriptions": act.get("vaccine_prescriptions", []),
                "care_instructions": act.get("care_instructions", []),
            })

        events.sort(key=lambda e: e.get("date", ""), reverse=True)
        return events

    @classmethod
    def get_pending_access_requests(cls, session: Session, user_id: str) -> list[dict]:
        dmn_id = cls.get_dmn_id_by_user_id(session, user_id)
        if not dmn_id:
            return []

        authorizations = session.exec(
            select(Authorization, Practitioner)
            .join(Practitioner, Practitioner.id == Authorization.practitioner_id)
            .where(Authorization.dmn_id == dmn_id)
            .where(Authorization.is_actif == False)
            .order_by(Authorization.granted_at.desc())
        ).all()

        result = []
        for auth, practitioner in authorizations:
            result.append({
                "id": str(auth.id),
                "practitioner_user_id": practitioner.user_id if practitioner else "",
                "practitioner_name": f"Dr. {practitioner.last_name if practitioner else 'Inconnu'}.{practitioner.first_name if practitioner else 'Inconnu'} ",
                "practitioner_speciality": practitioner.speciality.value if practitioner and practitioner.speciality else "",
                "reason": auth.authorization_type or "",
                "requested_at": auth.granted_at.isoformat() if auth.granted_at else "",
                "perimeter": auth.perimeter.value if auth.perimeter else "all",
                "duration": auth.duration.value if auth.duration else "24h",
            })
        return result

    @staticmethod
    def respond_to_access_request(
        session: Session,
        request_id: UUID,
        action: str,
        perimeter: str | None = None,
        duration: str | None = None,
    ) -> bool:
        auth = session.get(Authorization, request_id)
        if not auth:
            return False

        if action == "accept":
            if perimeter:
                try:
                    auth.perimeter = PerimeterEnum(perimeter)
                except ValueError:
                    pass
            if duration:
                try:
                    auth.duration = DurationEnum(duration)
                except ValueError:
                    pass

            auth.is_actif = True
            auth.granted_at = date.today()

            try:
                dur = DurationEnum(duration) if duration else auth.duration
                delta_map = {
                    DurationEnum.MIN_30: timedelta(minutes=30),
                    DurationEnum.H_1: timedelta(hours=1),
                    DurationEnum.H_24: timedelta(hours=24),
                    DurationEnum.J_7: timedelta(days=7),
                    DurationEnum.J_30: timedelta(days=30),
                    DurationEnum.INDETERMINEE: timedelta(days=365 * 10),
                }
                auth.expire_at = date.today() + delta_map.get(dur, timedelta(hours=24))
            except Exception:
                auth.expire_at = date.today()

            session.add(auth)
        elif action == "decline":
            session.delete(auth)

        return True

    @staticmethod
    def revoke_authorization(session: Session, authorization_id: UUID) -> bool:
        auth = session.get(Authorization, authorization_id)
        if not auth:
            return False
        session.delete(auth)
        return True

    @staticmethod
    def create_authorization(
        session: Session,
        dmn_id: UUID,
        practitioner_user_id: str,
        perimeter: str = "all",
        duration: str = "24h",
    ) -> UUID | None:
        practitioner = session.exec(
            select(Practitioner).where(Practitioner.user_id == practitioner_user_id)
        ).first()
        if not practitioner:
            return None

        auth = Authorization(
            dmn_id=dmn_id,
            practitioner_id=practitioner.id,
            is_actif=True,
            granted_at=date.today(),
            authorization_type="patient_initiated",
            type_autorisation="patient_initiated",
            perimeter=PerimeterEnum(perimeter) if perimeter else PerimeterEnum.ALL,
            duration=DurationEnum(duration) if duration else DurationEnum.H_24,
        )
        delta_map = {
            DurationEnum.MIN_30: timedelta(minutes=30),
            DurationEnum.H_1: timedelta(hours=1),
            DurationEnum.H_2: timedelta(hours=2),
            DurationEnum.H_24: timedelta(hours=24),
            DurationEnum.J_7: timedelta(days=7),
            DurationEnum.J_30: timedelta(days=30),
            DurationEnum.INDETERMINEE: timedelta(days=365 * 10),
        }
        auth.expire_at = date.today() + delta_map.get(auth.duration, timedelta(hours=24))

        session.add(auth)
        session.flush()
        return auth.id

    @staticmethod
    def renew_authorization(session: Session, authorization_id: UUID, duration: str = "24h") -> bool:
        auth = session.get(Authorization, authorization_id)
        if not auth:
            return False
        try:
            auth.duration = DurationEnum(duration)
        except ValueError:
            pass
        auth.is_actif = True
        auth.granted_at = date.today()
        delta_map = {
            DurationEnum.MIN_30: timedelta(minutes=30),
            DurationEnum.H_1: timedelta(hours=1),
            DurationEnum.H_2: timedelta(hours=2),
            DurationEnum.H_24: timedelta(hours=24),
            DurationEnum.J_7: timedelta(days=7),
            DurationEnum.J_30: timedelta(days=30),
            DurationEnum.INDETERMINEE: timedelta(days=365 * 10),
        }
        auth.expire_at = date.today() + delta_map.get(auth.duration, timedelta(hours=24))
        session.add(auth)
        return True

    @staticmethod
    def get_latest_vital_constant(session: Session, dmn_id: UUID, code: str) -> float | None:
        vc = session.exec(
            select(VitalConstant)
            .join(MedicalAct, MedicalAct.id == VitalConstant.medical_act_id)
            .where(MedicalAct.dmn_id == dmn_id)
            .where(VitalConstant.vital_constant_reference_code == code)
            .order_by(VitalConstant.date_mesure.desc())
            .limit(1)
        ).first()
        return vc.valeur if vc else None
