from uuid import UUID
from datetime import date, datetime, timedelta
from sqlmodel import Session, select, func, or_
from app.models.practitioner import Practitioner
from app.models.practitioner_role import PractitionerRole
from app.models.medical_act import MedicalAct
from app.models.consultation import Consultation
from app.models.examination_act import ExaminationAct
from app.models.vaccination import Vaccination
from app.models.prescription_examen import PrescriptionExamen
from app.models.prescription_order import PrescriptionOrder
from app.models.prescription_directive import PrescriptionDirective
from app.models.medication_directive import MedicationDirective
from app.models.prescription_de_soins import PrescriptionDeSoins
from app.models.examination import Examination
from app.models.vaccine import Vaccine
from app.models.authorization import Authorization
from app.models.dmn import DMN
from app.models.patient import Patient
from app.models.diagnosis import Diagnosis
from app.models.diagnosis_reference import DiagnosisReference
from app.models.allergy import Allergy
from app.models.vital_constant import VitalConstant
from app.types.enums import Speciality, TypeActe, Duration as DurationEnum, Perimeter


class PractitionerRepository:

    @staticmethod
    def create(
        session: Session,
        user_id: str,
        speciality: Speciality,
        order_number: str | None = None,
        organization_id: str | None = None,
        first_name: str | None = None,
        last_name: str | None = None,
    ) -> Practitioner:
        practitioner = Practitioner(
            user_id=user_id,
            first_name=first_name,
            last_name=last_name,
            speciality=speciality,
            order_number=order_number,
            organization_id=organization_id,
        )
        session.add(practitioner)
        session.flush()
        return practitioner

    @staticmethod
    def get_by_user_id(session: Session, user_id: str) -> Practitioner | None:
        try:
            user_uuid = UUID(user_id)
            practitioner = session.get(Practitioner, user_uuid)
            if practitioner:
                return practitioner
        except ValueError:
            pass

        return session.exec(
            select(Practitioner).where(Practitioner.user_id == user_id)
        ).first()

    @staticmethod
    def get_by_user_id_or_npi(session: Session, user_id: str, npi: str) -> Practitioner | None:
        p = session.exec(
            select(Practitioner).where(Practitioner.user_id == user_id)
        ).first()
        if p:
            return p
        if npi and npi != user_id:
            return session.exec(
                select(Practitioner).where(Practitioner.user_id == npi)
            ).first()
        return None

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
    def _get_patient_dmn_ids(cls, session: Session, role_ids: list[UUID], practitioner_id: UUID | None = None) -> list[UUID]:
        dmn_ids: set[UUID] = set()

        if role_ids:
            medical_dmn_ids = session.exec(
                select(MedicalAct.dmn_id).where(
                    MedicalAct.practitioner_role_id.in_(role_ids),
                    MedicalAct.dmn_id.isnot(None),
                ).distinct()
            ).all()
            dmn_ids.update(medical_dmn_ids)

        if practitioner_id:
            today = date.today()
            auth_dmn_ids = session.exec(
                select(Authorization.dmn_id).where(
                    Authorization.practitioner_id == practitioner_id,
                    Authorization.is_actif == True,
                    Authorization.expire_at >= today,
                ).distinct()
            ).all()
            dmn_ids.update(auth_dmn_ids)

        return list(dmn_ids)

    @classmethod
    def get_dashboard_stats(cls, session: Session, user_id: str) -> dict:
        practitioner = cls.get_by_user_id(session, user_id)
        role_ids = cls._get_practitioner_role_ids(session, user_id)
        dmn_ids = cls._get_patient_dmn_ids(session, role_ids, practitioner.id if practitioner else None)

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
                .select_from(MedicalAct)
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

        return {
            "followed_patients": followed_patients,
            "new_patients_this_month": new_patients,
            "consultations_this_week": consultations_this_week,
            "completed_visits": completed_visits,
            "upcoming_visits": upcoming_visits,
        }

    @classmethod
    def get_pending_access_requests(cls, session: Session, user_id: str) -> list[dict]:
        practitioner = cls.get_by_user_id(session, user_id)
        if not practitioner:
            return []

        authorizations = session.exec(
            select(Authorization, DMN, Patient, Practitioner)
            .join(DMN, DMN.id == Authorization.dmn_id)
            .join(Patient, Patient.id == DMN.patient_id)
            .outerjoin(Practitioner, Practitioner.id == Authorization.practitioner_id)
            .where(Authorization.practitioner_id == practitioner.id)
            .where(Authorization.is_actif == False)
            .order_by(Authorization.granted_at.desc())
            .limit(20)
        ).all()

        result = []
        for auth, dmn, patient, practitioner in authorizations:
            result.append({
                "id": str(auth.id),
                "patient_npi": patient.user_id,
                "patient_name": f"{patient.first_name or ''} {patient.last_name or ''}".strip() or f"Patient {patient.user_id[:8]}",
                "reason": f"Demande d'accès ({auth.authorization_type})",
                "requested_at": auth.granted_at.isoformat() if auth.granted_at else "",
                "urgency": "high" if auth.is_urgence else "medium",
                "requested_by_name": practitioner.user_id if practitioner else "Inconnu",
                "requested_by_role": practitioner.speciality.value if practitioner else "",
                "requested_by_facility": "",
                "expires_at": auth.expire_at.isoformat() if auth.expire_at else "",
            })
        return result

    @classmethod
    def get_all_consents(cls, session: Session, user_id: str) -> list[dict]:
        """
        Retourne toutes les autorisations liées au praticien avec le statut calculé.
        status = "active"  si is_actif=True et expire_at >= aujourd'hui
        status = "expired" si is_actif=True et expire_at < aujourd'hui
        status = "pending" si is_actif=False
        """
        practitioner = cls.get_by_user_id(session, user_id)
        if not practitioner:
            return []

        authorizations = session.exec(
            select(Authorization, DMN, Patient)
            .join(DMN, DMN.id == Authorization.dmn_id)
            .join(Patient, Patient.id == DMN.patient_id)
            .where(Authorization.practitioner_id == practitioner.id)
            .order_by(Authorization.granted_at.desc())
        ).all()

        today = date.today()
        result = []
        for auth, dmn, patient in authorizations:
            patient_name = (
                f"{patient.first_name or ''} {patient.last_name or ''}".strip()
                or f"Patient {patient.user_id[:8]}"
            )
            if not auth.is_actif:
                status = "pending"
            elif auth.expire_at and auth.expire_at < today:
                status = "expired"
            else:
                status = "active"

            result.append({
                "id": str(auth.id),
                "patient_npi": patient.user_id,
                "patient_name": patient_name,
                "perimeter": auth.perimeter.value if auth.perimeter else "all",
                "duration": auth.duration.value if auth.duration else "24h",
                "status": status,
                "granted_at": auth.granted_at.isoformat() if auth.granted_at else None,
                "expires_at": auth.expire_at.isoformat() if auth.expire_at else None,
                "is_urgence": auth.is_urgence,
                "reason": auth.authorization_type or "",
            })
        return result

    @staticmethod
    def revoke_access_request(
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
            .select_from(MedicalAct)
            .outerjoin(Consultation, Consultation.id == MedicalAct.id)
            .join(PractitionerRole, PractitionerRole.id == MedicalAct.practitioner_role_id)
            .join(DMN, DMN.id == MedicalAct.dmn_id)
            .join(Patient, Patient.id == DMN.patient_id)
            .where(MedicalAct.practitioner_role_id.in_(role_ids))
            .order_by(MedicalAct.id.desc())
            .limit(limit)
        ).all()

        seen = set()
        now = datetime.utcnow()
        for medical_act, consultation, role, dmn, patient in acts:
            if medical_act.id in seen:
                continue
            seen.add(medical_act.id)
            action = f"Consultation réalisée" if consultation else f"Acte médical ({medical_act.type_acte})"
            ts = medical_act.created_at if hasattr(medical_act, 'created_at') and medical_act.created_at else now
            activities.append({
                "id": str(medical_act.id),
                "type": "consultation" if consultation else medical_act.type_acte.lower(),
                "action": action,
                "patient_name": f"{patient.first_name or ''} {patient.last_name or ''}".strip() or f"Patient {patient.user_id[:8]}" if patient else None,
                "patient_npi": patient.user_id if patient else None,
                "facility": role.role if role else "",
                "timestamp": ts.isoformat(),
                "badge_text": "Finalisé" if medical_act.rapport_text else "En attente",
                "badge_type": "success" if medical_act.rapport_text else "warning",
            })

        return activities[:limit]

    @classmethod
    def get_patient_list(cls, session: Session, user_id: str) -> list[dict]:
        practitioner = cls.get_by_user_id(session, user_id)
        role_ids = cls._get_practitioner_role_ids(session, user_id)
        dmn_ids = cls._get_patient_dmn_ids(session, role_ids, practitioner.id if practitioner else None)
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
                .select_from(Diagnosis)
                .outerjoin(Allergy, Allergy.id == Diagnosis.id)
                .where(Diagnosis.medical_act_id.in_(
                    select(MedicalAct.id).where(MedicalAct.dmn_id == dmn.id)
                ))
                .where(Diagnosis.type_diagnosis == "allergy")
                .where(Allergy.criticite.in_(["haute", "élevée", "high"]))
            ).first()

            is_critical = critical_diagnosis is not None

            first = (patient.first_name or "").strip()
            last = (patient.last_name or "").strip()
            name = f"{first} {last}".strip() or f"Patient {patient.user_id[:8]}"
            initials = "".join(w[0].upper() for w in [first, last] if w) or patient.user_id[:2].upper()

            result.append({
                "npi": patient.user_id,
                "name": name,
                "initials": initials,
                "age": 0,
                "gender": "M",
                "last_contact": last_act.created_at.isoformat() if last_act and last_act.created_at else None,
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
        search = f"%{query}%"
        patients = session.exec(
            select(Patient).where(
                or_(
                    Patient.user_id.ilike(search),
                    Patient.first_name.ilike(search),
                    Patient.last_name.ilike(search),
                )
            ).limit(20)
        ).all()

        result = []
        for patient in patients:
            full_name = None
            if patient.first_name or patient.last_name:
                full_name = f"{patient.first_name or ''} {patient.last_name or ''}".strip()
            result.append({
                "user_id": str(patient.user_id),
                "npi": patient.user_id,
                "full_name": full_name,
                "age": None,
                "gender": None,
                "phone": None,
                "city": None,
            })
        return result

    @classmethod
    def create_emergency_access(
        cls,
        session: Session,
        practitioner: Practitioner,
        patient_user_id: str,
        reason: str = "Accès d'urgence (break-glass)",
        duration: str = "24h",
    ) -> dict | None:
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
        delta_map = {
            DurationEnum.MIN_30: timedelta(minutes=30),
            DurationEnum.H_1: timedelta(hours=1),
            DurationEnum.H_2: timedelta(hours=2),
            DurationEnum.H_24: timedelta(hours=24),
            DurationEnum.J_7: timedelta(days=7),
            DurationEnum.J_30: timedelta(days=30),
            DurationEnum.INDETERMINEE: timedelta(days=365 * 10),
        }
        today = date.today()
        expire_at = today + delta_map.get(duration_enum, timedelta(hours=24))

        auth = Authorization(
            perimeter=Perimeter.ALL,
            granted_at=today,
            expire_at=expire_at,
            duration=duration_enum,
            is_actif=True,
            is_urgence=True,
            authorization_type="break_glass",
            type_autorisation="urgence",
            auteur_autorisation_id=None,
            dmn_id=dmn.id,
            practitioner_id=practitioner.id,
        )
        session.add(auth)
        session.flush()
        session.refresh(auth)
        return {
            "id": str(auth.id),
            "status": "granted",
            "is_urgence": True,
        }

    @classmethod
    def create_access_request(
        cls,
        session: Session,
        practitioner: Practitioner | None,
        patient_user_id: str,
        reason: str,
        duration: str,
        perimeter: str,
    ) -> dict | None:
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
            type_autorisation="access_request",
            auteur_autorisation_id=None,
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

    @classmethod
    def _build_act(cls, type_acte: str, /, **kwargs):
        if type_acte == "Consultation":
            return Consultation(**kwargs)
        elif type_acte == "Examen":
            return ExaminationAct(**kwargs)
        elif type_acte == "VACCINATION":
            return Vaccination(**kwargs)
        else:
            return MedicalAct(**kwargs)

    @classmethod
    def create_medical_act(
        cls,
        session: Session,
        practitioner_user_id: str,
        patient_user_id: str,
        type_acte: str = "Consultation",
        motif: str | None = None,
        raisons: str | None = None,
        observations_text: str | None = None,
        duree_minutes: int | None = None,
        prescription_examen_id: str | None = None,
        organization_id: str | None = None,
        vital_constants: list[dict] | None = None,
        diagnoses: list[dict] | None = None,
        medications: list[dict] | None = None,
        examens: list[dict] | None = None,
        vaccines: list[dict] | None = None,
        care_instructions: list[dict] | None = None,
    ) -> UUID | None:
        practitioner = cls.get_by_user_id(session, practitioner_user_id)
        if not practitioner:
            return None

        if organization_id:
            role = session.exec(
                select(PractitionerRole).where(
                    PractitionerRole.practitioner_id == practitioner.id,
                    PractitionerRole.health_care_system_id == UUID(organization_id),
                )
            ).first()
            if not role:
                org = session.get(HealthcareSystem, UUID(organization_id))
                if org and org.is_actif:
                    role = PractitionerRole(
                        practitioner_id=practitioner.id,
                        health_care_system_id=org.id,
                        role="medecin",
                        start_date=date.today(),
                    )
                    session.add(role)
                    session.flush()
                    session.refresh(role)
        else:
            role = session.exec(
                select(PractitionerRole).where(
                    PractitionerRole.practitioner_id == practitioner.id
                )
            ).first()

        if not role:
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

        # 1. Créer l'acte selon son type
        base_kwargs = dict(
            dmn_id=dmn.id,
            practitioner_role_id=role.id,
            type_acte=type_acte,
            raisons=raisons,
            observations_text=observations_text,
        )

        if type_acte == "Consultation":
            act = Consultation(
                **base_kwargs,
                duree_minutes=duree_minutes,
                motif=motif,
            )
        elif type_acte == "Examen":
            ex = (examens or [{}])[0]
            act = ExaminationAct(
                **base_kwargs,
                code_loinc=ex.get("code_loinc", ""),
                libelle_examen=ex.get("libelle", ""),
                type_examen=ex.get("type_examen", "BILAN"),
                value=ex.get("valeur", ""),
                interpretation=ex.get("interpretation", ""),
                prescription_examen_id=UUID(prescription_examen_id) if prescription_examen_id else None,
            )
        elif type_acte == "VACCINATION":
            vac = (vaccines or [{}])[0]
            act = Vaccination(
                **base_kwargs,
                injection_site=vac.get("injection_site"),
                sequence_dose=vac.get("sequence_dose"),
                batch_number=vac.get("batch_number"),
                next_reminder=vac.get("next_reminder"),
                note=vac.get("note") or vac.get("libelle"),
            )
        else:
            act = MedicalAct(**base_kwargs)

        session.add(act)
        session.flush()

        # 2b. Auto-détection du groupe sanguin à partir des résultats d'examen
        if type_acte == "Examen" and act.code_loinc == "11562-6" and act.value:
            blood_map = {
                "O+": ("O", "positif"), "A+": ("A", "positif"), "B+": ("B", "positif"), "AB+": ("AB", "positif"),
                "O-": ("O", "negatif"), "A-": ("A", "negatif"), "B-": ("B", "negatif"), "AB-": ("AB", "negatif"),
                "A Positif": ("A", "positif"), "B Positif": ("B", "positif"), "O Positif": ("O", "positif"), "AB Positif": ("AB", "positif"),
                "A Negatif": ("A", "negatif"), "B Negatif": ("B", "negatif"), "O Negatif": ("O", "negatif"), "AB Negatif": ("AB", "negatif"),
                "Groupe A": ("A", None), "Groupe B": ("B", None), "Groupe O": ("O", None), "Groupe AB": ("AB", None),
                "A": ("A", None), "B": ("B", None), "O": ("O", None), "AB": ("AB", None),
            }
            val = act.value.strip()
            if val in blood_map:
                bt, rh = blood_map[val]
                dmn.blood_type = bt
                if rh:
                    dmn.rhesus_factor = rh
                session.add(dmn)

        # 3. Constantes vitales
        for vc in (vital_constants or []):
            v = VitalConstant(
                medical_act_id=act.id,
                vital_constant_reference_code=vc["code"],
                valeur=vc["valeur"],
                date_mesure=datetime.now(),
            )
            session.add(v)

        # 4. Diagnostics
        for diag in (diagnoses or []):
            ref_id = diag.get("diagnosis_ref_id")
            d = Diagnosis(
                statut_verification=diag.get("statut_verification", "confirmed"),
                date_diagnosis=date.today(),
                note_clinique=diag.get("note_clinique"),
                medical_act_id=act.id,
                diagnosis_ref_id=UUID(ref_id) if ref_id else None,
                type_diagnosis="standard",
            )
            session.add(d)

        # 5. Ordere de prescriptions (pour médicaments + soins)
        has_meds_or_soins = (medications and len(medications) > 0) or (care_instructions and len(care_instructions) > 0)
        po = None
        if has_meds_or_soins:
            po = PrescriptionOrder(medical_act_id=act.id, statut="active")
            session.add(po)
            session.flush()

        # 5a. Prescriptions médicaments
        for med in (medications or []):
            md = MedicationDirective(
                description_generale=med.get("description_generale", ""),
                prescription_order_id=po.id if po else None,
                type_directive="medicament",
                medication_ref_id=UUID(med["medication_ref_id"]) if med.get("medication_ref_id") else None,
                posologie=med.get("posologie", ""),
                duree_jours=med.get("duree_jours"),
            )
            session.add(md)

        # 5b. Prescriptions examens
        for ex in (examens or []):
            e = Examination(
                date_prescription=datetime.now(),
                statut="En cours",
                special_instructions=ex.get("special_instructions", ""),
                medical_act_id=act.id,
                type_prescription="examination",
                code_loinc=ex.get("code_loinc", ""),
                libelle=ex.get("libelle", ""),
                nature_examination=ex.get("nature_examination", "LABORATOIRE"),
            )
            session.add(e)

        # 5c. Prescriptions vaccins
        for vac in (vaccines or []):
            v = Vaccine(
                date_prescription=datetime.now(),
                statut="En cours",
                special_instructions=vac.get("special_instructions", ""),
                medical_act_id=act.id,
                type_prescription="vaccin",
                code_cvx=vac.get("code_cvx", ""),
                libelle=vac.get("libelle", ""),
            )
            session.add(v)

        # 5d. Instructions de soins
        for ci in (care_instructions or []):
            s = PrescriptionDeSoins(
                description_generale=ci.get("description_generale", ""),
                prescription_order_id=po.id if po else None,
                type_directive="soins",
                sous_type=ci.get("sous_type", "rehabilitation"),
                nombre_seances=ci.get("nombre_seances"),
                frequence_hebdo=ci.get("frequence_hebdo"),
                objectifs=ci.get("objectifs"),
                titre_consigne=ci.get("titre_consigne"),
                recommandations=ci.get("recommandations"),
            )
            session.add(s)

        session.flush()
        return act.id
