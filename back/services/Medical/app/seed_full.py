"""Seed complet : organisation CNHU, praticiens, patients avec données médicales.

Usage :
    python -m app.seed_full              # insère si la base est vide
    python -m app.seed_full --force      # vide et réinsère

Nécessite d'abord :
    python -m app.seed                   # pour les DiagnosisReference (codes CID-11)
    (ou le seed_full le fait automatiquement)
"""

import argparse
import uuid
from datetime import date, datetime, timedelta
from sqlmodel import select, Session as SQLSession

from app.database import engine, Session
from app.types.enums import (
    Speciality, StatutVerification, Duration as DurationEnum, Perimeter,
)

from app.models import *

# ─── Données ───────────────────────────────────────────────────────────────────

ORGANISATIONS = [
    {
        "type": "hopital",
        "nom": "Centre National Hospitalier et Universitaire Hubert Koutoukou Maga",
        "alias": "CNHU-HKM",
        "city": "Cotonou",
        "address": "01 BP 386 Cotonou, Bénin",
        "phone": "+229 21 31 56 72",
        "email": "contact@cnhu-hkm.bj",
        "verification_status": StatutVerification.VALIDE,
        "created_by": "admin.organisation@santebenin.bj",
    },
]

PRATICIENS = [
    {
        "user_id": "pract-kouandete",
        "speciality": Speciality.MEDECIN,
        "order_number": "ORD-2024-001",
        "role": "medecin",
        "nom": "KOUANDETE",
        "prenom": "Koffi",
        "email": "koffi.kouandete@santebenin.bj",
        "genre": "M",
    },
    {
        "user_id": "pract-soumanou",
        "speciality": Speciality.BIOLOGISTE,
        "order_number": "ORD-2024-002",
        "role": "biologiste",
        "nom": "SOUMANOU",
        "prenom": "Aïssatou",
        "email": "aissatou.soumanou@santebenin.bj",
        "genre": "F",
    },
    {
        "user_id": "pract-dossou",
        "speciality": Speciality.PEDIATRE,
        "order_number": "ORD-2024-003",
        "role": "pediatre",
        "nom": "DOSSOU",
        "prenom": "Mireille",
        "email": "mireille.dossou@santebenin.bj",
        "genre": "F",
    },
    {
        "user_id": "pract-hounkpe",
        "speciality": Speciality.GYNECOLOGUE,
        "order_number": "ORD-2024-004",
        "role": "gynecologue",
        "nom": "HOUNKPÉ",
        "prenom": "Sébastien",
        "email": "sebastien.hounkpe@santebenin.bj",
        "genre": "M",
    },
]

PATIENTS = [
    {
        "user_id": "patient-adebayo",
        "nom": "ADEBAYO",
        "prenom": "Kouassi",
        "email": "kouassi.adebayo@email.com",
        "genre": "M",
        "date_naissance": date(1966, 5, 12),
        "telephone": "+229 61 12 34 56",
        "blood_type": "O",
        "rhesus_factor": "+",
        "allergies": [
            ("Médicament", "médicament", "Pénicilline", "haute",
             "active", date(2020, 3, 1), "Urticaire, œdème de Quincke"),
        ],
        "pathologies": [
            ("confirmed", date(2020, 6, 15), "Hypertension artérielle", "8A00"),
            ("confirmed", date(2022, 1, 10), "Diabète de type 2", "5A11"),
        ],
        "vaccinations": [
            ("COVID-19", 1, "COM202401", date(2024, 6, 1)),
            ("COVID-19", 2, "COM202402", date(2024, 7, 1)),
        ],
    },
    {
        "user_id": "patient-sow",
        "nom": "SOW",
        "prenom": "Aminata",
        "email": "aminata.sow@email.com",
        "genre": "F",
        "date_naissance": date(1989, 11, 24),
        "telephone": "+229 62 98 76 54",
        "blood_type": "A",
        "rhesus_factor": "+",
        "allergies": [
            ("Alimentaire", "aliment", "Arachide", "moyenne",
             "active", date(2018, 7, 12), "Œdème labial, urticaire"),
        ],
        "pathologies": [
            ("confirmed", date(2024, 9, 1), "Grossesse à suivi normal", "QA0A"),
        ],
        "vaccinations": [
            ("Tétanos", 3, "TET202401", date(2024, 10, 15)),
        ],
    },
    {
        "user_id": "patient-dossou",
        "nom": "DOSSOU",
        "prenom": "Jean-Pierre",
        "email": "jeanpierre.dossou@email.com",
        "genre": "M",
        "date_naissance": date(1957, 3, 8),
        "telephone": "+229 63 45 67 89",
        "blood_type": "B",
        "rhesus_factor": "-",
        "allergies": [
            ("Médicament", "médicament", "Aspirine", "haute",
             "active", date(2019, 5, 20), "Asthme aigu, urticaire géante"),
            ("Alimentaire", "aliment", "Sulfites", "modérée",
             "active", date(2021, 2, 14), "Rash cutané, dyspnée légère"),
        ],
        "pathologies": [
            ("confirmed", date(2015, 10, 1), "Coronaropathie", "BA8Z"),
            ("confirmed", date(2020, 4, 5), "Hypercholestérolémie familiale", "5C22"),
        ],
        "vaccinations": [
            ("Grippe saisonnière", 1, "FLU202401", date(2024, 9, 1)),
            ("COVID-19", 2, "COM202403", date(2024, 8, 15)),
        ],
    },
    {
        "user_id": "patient-agossou",
        "nom": "AGOSSOU",
        "prenom": "Martine",
        "email": "martine.agossou@email.com",
        "genre": "F",
        "date_naissance": date(1978, 7, 30),
        "telephone": "+229 64 00 11 22",
        "blood_type": "AB",
        "rhesus_factor": "+",
        "allergies": [],
        "pathologies": [
            ("suspected", date(2025, 1, 10), "Lombalgie chronique", "ME84"),
        ],
        "vaccinations": [],
    },
]

RELATIVES = [
    {
        "patient_user_id": "patient-adebayo",
        "nom_complet": "ADEBAYO Akouavi",
        "code_relation": "conjoint",
        "lien": "Épouse",
        "telephone": "+229 65 55 44 33",
        "email": "akouavi.adebayo@email.com",
        "urgence": True,
    },
    {
        "patient_user_id": "patient-sow",
        "nom_complet": "SOW Mamadou",
        "code_relation": "conjoint",
        "lien": "Époux",
        "telephone": "+229 66 77 88 99",
        "email": "mamadou.sow@email.com",
        "urgence": True,
    },
    {
        "patient_user_id": "patient-dossou",
        "nom_complet": "DOSSOU Chantal",
        "code_relation": "conjoint",
        "lien": "Épouse",
        "telephone": "+229 67 00 11 22",
        "email": "chantal.dossou@email.com",
        "urgence": True,
    },
]

# Constantes vitales à enregistrer
VITAL_CONSTANTS = {
    "Tension artérielle systolique": {"code": "SYS", "unite": "mmHg"},
    "Tension artérielle diastolique": {"code": "DIA", "unite": "mmHg"},
    "Fréquence cardiaque": {"code": "HR", "unite": "bpm"},
    "Température corporelle": {"code": "TEMP", "unite": "°C"},
    "Poids": {"code": "WEIGHT", "unite": "kg"},
    "Taille": {"code": "HEIGHT", "unite": "cm"},
}


# ─── Utilitaires ───────────────────────────────────────────────────────────────

def _get_or_create_diagnosis_ref(session: SQLSession) -> dict[str, DiagnosisReference]:
    """Récupère les DiagnosisReference existantes ou les crée."""

    # Codes CID-11 minimaux pour le seed
    MINIMAL_ICD11 = [
        ("8A00", "Hypertension artérielle essentielle"),
        ("5A11", "Diabète de type 2"),
        ("QA0A", "Soins prénatals normaux"),
        ("BA8Z", "Cardiopathie ischémique, sans précision"),
        ("5C22", "Hypercholestérolémie"),
        ("ME84", "Lombalgie chronique"),
        ("1C40", "Paludisme à Plasmodium falciparum"),
        ("1A05", "Fièvre typhoïde"),
    ]

    refs: dict[str, DiagnosisReference] = {}
    for code, libelle in MINIMAL_ICD11:
        obj = session.exec(
            select(DiagnosisReference).where(DiagnosisReference.code_cid11 == code)
        ).first()
        if not obj:
            obj = DiagnosisReference(code_cid11=code, libelle=libelle)
            session.add(obj)
            session.flush()
        refs[code] = obj
    session.commit()
    return refs


def _ensure_vital_constant_refs(session: SQLSession) -> dict[str, VitalConstantReference]:
    refs: dict[str, VitalConstantReference] = {}
    for nom, info in VITAL_CONSTANTS.items():
        obj = session.exec(
            select(VitalConstantReference).where(VitalConstantReference.code == info["code"])
        ).first()
        if not obj:
            obj = VitalConstantReference(code=info["code"], nom=nom, unite_mesure=info["unite"])
            session.add(obj)
            session.flush()
        refs[info["code"]] = obj
    session.commit()
    return refs


def _ensure_reaction_refs(session: SQLSession) -> dict[str, ReactionReference]:
    reactions_data = [
        ("URTIC", "Urticaire"),
        ("OEDEME", "Œdème de Quincke"),
        ("RASH", "Rash cutané"),
        ("DYSPN", "Dyspnée"),
        ("ASTHME", "Crise d'asthme"),
        ("LABIAL", "Œdème labial"),
    ]
    refs: dict[str, ReactionReference] = {}
    for code, libelle in reactions_data:
        obj = session.exec(
            select(ReactionReference).where(ReactionReference.code == code)
        ).first()
        if not obj:
            obj = ReactionReference(code=code, libelle=libelle)
            session.add(obj)
            session.flush()
        refs[code] = obj
    session.commit()
    return refs


# ─── Création des entités ──────────────────────────────────────────────────────

def create_organization(session: SQLSession) -> HealthcareSystem:
    org_data = ORGANISATIONS[0]
    existing = session.exec(
        select(HealthcareSystem).where(HealthcareSystem.alias == org_data["alias"])
    ).first()
    if existing:
        print(f"  Organisation {org_data['alias']} existe déjà (id={existing.id})")
        return existing

    org = HealthcareSystem(**org_data)
    session.add(org)
    session.commit()
    session.refresh(org)
    print(f"  ✓ Organisation créée : {org.nom} (id={org.id})")
    return org


def create_practitioners(session: SQLSession, org: HealthcareSystem) -> dict[str, Practitioner]:
    practitioners: dict[str, Practitioner] = {}
    for p in PRATICIENS:
        existing = session.exec(
            select(Practitioner).where(Practitioner.user_id == p["user_id"])
        ).first()
        if existing:
            print(f"  Praticien {p['user_id']} existe déjà (id={existing.id})")
            practitioners[p["user_id"]] = existing
            continue

        practitioner = Practitioner(
            user_id=p["user_id"],
            speciality=p["speciality"],
            order_number=p["order_number"],
            organization_id=str(org.id),
        )
        session.add(practitioner)
        session.flush()

        role = PractitionerRole(
            practitioner_id=practitioner.id,
            health_care_system_id=org.id,
            role=p["role"],
            start_date=date.today(),
        )
        session.add(role)
        practitioners[p["user_id"]] = practitioner
        print(f"  ✓ Praticien créé : Dr {p['prenom']} {p['nom']} (id={practitioner.id})")

    session.commit()
    return practitioners


def create_patients(
    session: SQLSession,
    practitioners: dict[str, Practitioner],
    diagnosis_refs: dict[str, DiagnosisReference],
) -> dict[str, Patient]:
    patients: dict[str, Patient] = {}
    now = datetime.now()

    for pt in PATIENTS:
        existing_patient = session.exec(
            select(Patient).where(Patient.user_id == pt["user_id"])
        ).first()
        if existing_patient:
            print(f"  Patient {pt['user_id']} existe déjà (id={existing_patient.id})")
            patients[pt["user_id"]] = existing_patient
            continue

        # 1. Créer le patient
        patient = Patient(user_id=pt["user_id"], first_name=pt["prenom"], last_name=pt["nom"])
        session.add(patient)
        session.flush()

        # 2. Créer le DMN (dossier médical numérique)
        dmn = DMN(
            blood_type=pt["blood_type"],
            rhesus_factor=pt["rhesus_factor"],
            patient_id=patient.id,
            date_creation=now,
        )
        session.add(dmn)
        session.flush()

        # 3. Consultations et actes médicaux
        koffi = practitioners["pract-kouandete"]
        mireille = practitioners["pract-dossou"]

        # 3a. Consultation initiale (il y a 3 mois)
        consult_1 = Consultation(
            dmn_id=dmn.id,
            practitioner_role_id=session.exec(
                select(PractitionerRole).where(
                    PractitionerRole.practitioner_id == koffi.id
                )
            ).first().id,
            type_acte="Consultation",
            raisons=f"Consultation de routine pour {pt['prenom']} {pt['nom']}",
            rapport_text=f"Patient vu en consultation. Examen clinique normal.",
            motif="Consultation de suivi",
            duree_minutes=25,
        )
        session.add(consult_1)
        session.flush()

        # PrescriptionOrder pour cette consultation
        po1 = PrescriptionOrder(medical_act_id=consult_1.id, statut="active")
        session.add(po1)
        session.flush()

        for idx, (statut_verif, diag_date, note_clinique, code_cid) in enumerate(pt["pathologies"]):
            ref = diagnosis_refs.get(code_cid)
            if ref:
                diag_obj = Diagnosis(
                    statut_verification=statut_verif,
                    date_diagnosis=diag_date,
                    note_clinique=note_clinique,
                    medical_act_id=consult_1.id,
                    diagnosis_ref_id=ref.id,
                    type_diagnosis="standard",
                )
                session.add(diag_obj)
                session.flush()

                # CareEpisode pour les pathologies confirmées
                if statut_verif == "confirmed":
                    episode = CareEpisode(
                        clinical_status="active",
                        severity="moderate",
                        start_date=diag_date,
                        diagnosis_id=diag_obj.id,
                    )
                    session.add(episode)

        # Constantes vitales
        for code, val in _get_vital_signs(pt["user_id"]).items():
            vc = VitalConstant(
                medical_act_id=consult_1.id,
                vital_constant_reference_code=code,
                valeur=val,
                date_mesure=now,
            )
            session.add(vc)

            # Allergies
            for allergy_data in pt["allergies"]:
                nature, categorie, libelle, criticite, statut_clinique, decouverte, reactions_str = \
                    allergy_data
                allergy = Allergy(
                    statut_verification="confirmed",
                    date_diagnosis=decouverte,
                    note_clinique=f"Allergie à {libelle}",
                    medical_act_id=consult_1.id,
                    diagnosis_ref_id=diagnosis_refs["8A00"].id if "8A00" in diagnosis_refs else None,
                    nature_allergie=nature,
                    categorie=categorie,
                    libelle=libelle,
                    criticite=criticite,
                    statut_clinique=statut_clinique,
                    discover_at=decouverte,
                    reactions_text=reactions_str,
                )
                session.add(allergy)

        # Vaccinations
        for vaccin in pt["vaccinations"]:
            libelle_vaccin, dose, lot, date_vaccin = vaccin
            pract_vaccin = mireille if pt.get("genre") != "M" else koffi

            act_vaccin = Vaccination(
                dmn_id=dmn.id,
                practitioner_role_id=session.exec(
                    select(PractitionerRole).where(
                        PractitionerRole.practitioner_id == pract_vaccin.id
                    )
                ).first().id,
                type_acte="VACCINATION",
                raisons=f"Vaccination {libelle_vaccin} (dose {dose})",
                rapport_text=f"Administration du vaccin {libelle_vaccin}.",
                injection_site="Deltoïde gauche",
                sequence_dose=dose,
                batch_number=lot,
                next_reminder=date_vaccin + timedelta(days=365),
                note=f"Vaccin {libelle_vaccin} dose {dose}",
            )
            session.add(act_vaccin)
            session.flush()

            # PrescriptionOrder pour le vaccin
            po_vaccin = PrescriptionOrder(medical_act_id=act_vaccin.id, statut="completed")
            session.add(po_vaccin)

        # 3b. Deuxième consultation plus récente (il y a 2 semaines)
        consult_2 = Consultation(
            dmn_id=dmn.id,
            practitioner_role_id=session.exec(
                select(PractitionerRole).where(
                    PractitionerRole.practitioner_id == koffi.id
                )
            ).first().id,
            type_acte="Consultation",
            raisons="Consultation de contrôle",
            rapport_text=f"Contrôle périodique. Patient stable sous traitement.",
            motif="Contrôle",
            duree_minutes=20,
        )
        session.add(consult_2)
        session.flush()

        po2 = PrescriptionOrder(medical_act_id=consult_2.id, statut="active")
        session.add(po2)
        session.flush()

        # Prescription de médicaments (après la 2e consultation)
        if pt["user_id"] == "patient-adebayo":
            # HTA + Diabète : Amlodipine + Metformine
            _create_medication_prescription(session, po2.id,
                "Amlodipine 5 mg", "Amlodipine", "comprimé",
                "1 comprimé par jour", 90)
            _create_medication_prescription(session, po2.id,
                "Metformine 850 mg", "Metformine", "comprimé",
                "1 comprimé matin et soir", 90)
        elif pt["user_id"] == "patient-dossou":
            # Coronaropathie : Aspirine + Atorvastatine
            _create_medication_prescription(session, po2.id,
                "Aspirine 100 mg", "Acide acétylsalicylique", "comprimé",
                "1 comprimé par jour", 90)
            _create_medication_prescription(session, po2.id,
                "Atorvastatine 20 mg", "Atorvastatine", "comprimé",
                "1 comprimé le soir", 90)

        # Prescription d'examens
        if pt["user_id"] == "patient-adebayo":
            _create_examen_prescription(session, consult_2.id, "Numération formule sanguine", "LABORATOIRE")
            _create_examen_prescription(session, consult_2.id, "Glycémie à jeun", "LABORATOIRE")

        # 3c. Un examen fait (résultat)
        if pt["user_id"] == "patient-adebayo":
            # Créer un ExaminationAct lié à la consultation
            exam_act = ExaminationAct(
                dmn_id=dmn.id,
                practitioner_role_id=session.exec(
                    select(PractitionerRole).where(
                        PractitionerRole.practitioner_id == koffi.id
                    )
                ).first().id,
                type_acte="Examen",
                raisons="Bilan de routine",
                rapport_text="Résultats d'analyse",
                code_loinc="58410-2",
                libelle_examen="Créatinine sanguine",
                type_examen="LABORATOIRE",
                value="0.9 mg/dL",
                interpretation="Normale",
            )
            session.add(exam_act)
            session.flush()

        patients[pt["user_id"]] = patient
        print(f"  ✓ Patient créé : {pt['prenom']} {pt['nom']} (id={patient.id})")

    session.commit()
    return patients


def _create_medication_prescription(
    session: SQLSession,
    po_id: uuid.UUID,
    nom_commercial: str,
    dc_nom: str,
    forme: str,
    posologie: str,
    duree_jours: int,
):
    """Crée un médicament (MedicationReference + MedicationDirective)."""
    code = nom_commercial[:10].upper().replace(" ", "_")
    med = session.exec(
        select(MedicationReference).where(MedicationReference.code_medicament == code)
    ).first()
    if not med:
        med = MedicationReference(
            code_medicament=code,
            nom_commercial=nom_commercial,
            dc_nom=dc_nom,
            forme_galenique=forme,
        )
        session.add(med)
        session.flush()

    directive = MedicationDirective(
        description_generale=f"{nom_commercial} - {posologie}",
        prescription_order_id=po_id,
        type_directive="medicament",
        medication_ref_id=med.id,
        posologie=posologie,
        duree_jours=duree_jours,
    )
    session.add(directive)


def _create_examen_prescription(session: SQLSession, medical_act_id: uuid.UUID, libelle: str, nature: str):
    po = session.exec(
        select(PrescriptionOrder).where(PrescriptionOrder.medical_act_id == medical_act_id)
    ).first()
    if not po:
        return

    examen = Examination(
        date_prescription=datetime.now(),
        statut="En cours",
        special_instructions="",
        medical_act_id=medical_act_id,
        type_prescription="examination",
        code_loinc="LP777-5" if "sanguine" in libelle else "LP41635-4",
        libelle=libelle,
        nature_examination=nature,
    )
    session.add(examen)


def _get_vital_signs(user_id: str) -> dict[str, float]:
    constants = {
        "patient-adebayo": {"SYS": 135, "DIA": 85, "HR": 72, "TEMP": 36.8, "WEIGHT": 82, "HEIGHT": 175},
        "patient-sow":    {"SYS": 110, "DIA": 70, "HR": 75, "TEMP": 37.0, "WEIGHT": 65, "HEIGHT": 165},
        "patient-dossou": {"SYS": 145, "DIA": 90, "HR": 68, "TEMP": 36.6, "WEIGHT": 78, "HEIGHT": 170},
        "patient-agossou":{"SYS": 120, "DIA": 75, "HR": 70, "TEMP": 36.9, "WEIGHT": 72, "HEIGHT": 168},
    }
    return constants.get(user_id, {"SYS": 120, "DIA": 80, "HR": 70, "TEMP": 37.0, "WEIGHT": 70, "HEIGHT": 170})


def create_relatives(session: SQLSession, patients: dict[str, Patient]):
    for rel_data in RELATIVES:
        patient = patients.get(rel_data["patient_user_id"])
        if not patient:
            continue

        # Vérifier si ce contact existe déjà
        existing = session.exec(
            select(PatientRelative).where(
                PatientRelative.patient_id == patient.id
            )
        ).first()
        if existing and existing.code_relation == rel_data["code_relation"]:
            print(f"  Relation {rel_data['nom_complet']} existe déjà")
            continue

        # Créer le contact
        relative = Relative(
            first_name=rel_data["nom_complet"].split()[-1] if len(rel_data["nom_complet"].split()) > 1 else "",
            last_name=rel_data["nom_complet"].split()[0],
            email=rel_data["email"],
            phone=rel_data["telephone"],
        )
        session.add(relative)
        session.flush()

        # Lier au patient
        pr = PatientRelative(
            patient_id=patient.id,
            relative_id=relative.id,
            code_relation=rel_data["code_relation"],
            emergency_contact=rel_data["urgence"],
        )
        session.add(pr)
        print(f"  ✓ Contact créé : {rel_data['nom_complet']} ({rel_data['lien']})")


def create_authorizations(
    session: SQLSession,
    practitioners: dict[str, Practitioner],
    patients: dict[str, Patient],
):
    """Crée des Authorizations actives entre chaque praticien et chaque patient."""
    for pract_key, practitioner in practitioners.items():
        for pat_key, patient in patients.items():
            dmn = session.exec(
                select(DMN).where(DMN.patient_id == patient.id)
            ).first()
            if not dmn:
                continue

            existing = session.exec(
                select(Authorization).where(
                    Authorization.practitioner_id == practitioner.id,
                    Authorization.dmn_id == dmn.id,
                )
            ).first()
            if existing:
                continue

            auth = Authorization(
                perimeter=Perimeter.ALL,
                granted_at=date.today(),
                expire_at=date.today(),
                duration=DurationEnum.H_24,
                is_actif=True,
                is_urgence=False,
                authorization_type="seed",
                dmn_id=dmn.id,
                practitioner_id=practitioner.id,
            )
            session.add(auth)
            print(f"  ✓ Autorisation : {pract_key} → {pat_key}")

    session.commit()


# ─── Main ──────────────────────────────────────────────────────────────────────

def seed(force: bool = False):
    print("=== Seed complet DMN ===")

    with Session(engine) as session:
        if force:
            print("Nettoyage de la base...")
            # Ordre inverse des dépendances
            for table in [
                DiagnosticEvidence, Reaction, VitalConstant,
                MedicationDirective, PrescriptionDeSoins, PrescriptionDirective,
                Examination, Vaccine, PrescriptionExamen, PrescriptionOrder,
                ExaminationAct, Vaccination, Consultation, MedicalAct,
                CareEpisode, Allergy, Diagnosis,
                PatientRelative, Relative, Authorization,
                DMN, PractitionerRole, Practitioner, HealthcareSystem,
            ]:
                session.exec(table.__table__.delete())
            session.commit()
            print("  Base vidée.")

        # Phase 1 : données de référence
        print("\n[Phase 1] Données de référence...")
        diagnosis_refs = _get_or_create_diagnosis_ref(session)
        print(f"  ✓ {len(diagnosis_refs)} DiagnosisReference disponibles")
        _ensure_vital_constant_refs(session)
        print("  ✓ VitalConstantReference créées")
        reaction_refs = _ensure_reaction_refs(session)
        print(f"  ✓ {len(reaction_refs)} ReactionReference créées")

        # Phase 2 : organisation
        print("\n[Phase 2] Organisation...")
        org = create_organization(session)

        # Phase 3 : praticiens
        print("\n[Phase 3] Praticiens...")
        practitioners = create_practitioners(session, org)

        # Phase 4 : patients + données médicales
        print("\n[Phase 4] Patients avec données médicales complètes...")
        patients = create_patients(session, practitioners, diagnosis_refs)

        # Phase 5 : contacts d'urgence
        print("\n[Phase 5] Contacts / proches...")
        create_relatives(session, patients)

        # Phase 6 : autorisations d'accès
        print("\n[Phase 6] Autorisations praticien → patient...")
        create_authorizations(session, practitioners, patients)

        print("\n=== Seed terminé avec succès ===")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed complet DMN")
    parser.add_argument("--force", action="store_true", help="Vide puis réinsère")
    args = parser.parse_args()
    seed(force=args.force)
