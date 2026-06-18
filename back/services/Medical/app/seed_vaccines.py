"""Seed script : préremplit la table vaccine avec les codes CVX
des vaccins courants en Afrique de l'Ouest (PEV élargi + vaccins recommandés).

Utilise des inserts directs (medicalact → prescriptionexamen → vaccine)
pour respecter l'héritage par jointure SQLAlchemy.

Usage :
    python -m app.seed_vaccines                  # insère si table vide
    python -m app.seed_vaccines --force           # vide et réinsère
"""

import argparse
import uuid
from datetime import datetime
from sqlmodel import select, func

from app.database import engine, Session
from app.models.medical_act import MedicalAct
from app.models.prescription_examen import PrescriptionExamen
from app.models.vaccine import Vaccine


# (code_cvx, libelle) — CVX codes du CDC pour les vaccins courants
# en Afrique de l'Ouest (PEV de base + recommandés)
CVX_VACCINS = [
    # === Vaccins du PEV de base (Programme Élargi de Vaccination) ===
    ("19", "BCG (vaccin antituberculeux)"),
    ("08", "Hépatite B (vaccin pédiatrique)"),
    ("102", "Pentavalent (DTP-HepB-Hib)"),
    ("02", "OPV (vaccin polio oral bivalent/trivalent)"),
    ("10", "IPV (vaccin polio injectable inactivé)"),
    ("05", "Rougeole (vaccin monovalent)"),
    ("94", "Rougeole-Rubéole (MR)"),
    ("37", "Fièvre jaune (vaccin)"),

    # === Vaccins recommandés complémentaires ===
    ("133", "Pneumocoque conjugué 13-valent (PCV13)"),
    ("152", "Pneumocoque conjugué 10-valent (PCV10)"),
    ("119", "Rotavirus monovalent (Rotarix)"),
    ("122", "Rotavirus pentavalent (RotaTeq)"),
    ("116", "Rotavirus monovalent (Rotavac)"),
    ("147", "Méningocoque A conjugué (MenAfriVac)"),
    ("108", "Méningocoque ACWY conjugué"),
    ("48", "Haemophilus influenzae type b (Hib)"),

    # === Vaccins pour adolescents et adultes ===
    ("09", "Td (Tétanos-Diphtérie, vaccin adulte)"),
    ("35", "Anatoxine tétanique simple (TT)"),
    ("115", "Tdap (Tétanos-Diphtérie-Coqueluche acellulaire adulte)"),
    ("01", "DTP (Diphtérie-Tétanos-Coqueluche germe entier)"),
    ("20", "DTaP (Diphtérie-Tétanos-Coqueluche acellulaire enfant)"),
    ("118", "HPV quadrivalent (Gardasil 4)"),
    ("137", "HPV bivalent (Cervarix)"),
    ("165", "HPV nonavalent (Gardasil 9)"),

    # === Vaccins contre les maladies endémiques / épidémiques ===
    ("173", "Choléra oral (Shanchol)"),
    ("174", "Choléra oral (Dukoral)"),
    ("91", "Fièvre typhoïde conjugué Vi (TCV)"),
    ("25", "Fièvre typhoïde polysaccharidique Vi"),
    ("31", "Hépatite A (vaccin pédiatrique)"),
    ("83", "Hépatite A+B combiné"),
    ("21", "Varicelle (vaccin)"),
    ("03", "ROR (Rougeole-Oreillons-Rubéole)"),

    # === Vaccins contre la rage (prophylaxie) ===
    ("40", "Rage (vaccin pré-exposition)"),
    ("90", "Rage (vaccin post-exposition)"),
    ("176", "Rage (vaccin intradermique)"),

    # === Vaccins contre la grippe ===
    ("15", "Grippe saisonnière inactivé (standard)"),
    ("140", "Grippe saisonnière haute dose"),

    # === Vaccins COVID-19 ===
    ("207", "COVID-19 ARNm (Pfizer-BioNTech)"),
    ("208", "COVID-19 ARNm (Moderna)"),
    ("211", "COVID-19 vecteur viral (AstraZeneca)"),
    ("210", "COVID-19 vecteur viral (Janssen)"),

    # === Autres vaccins utiles ===
    ("33", "Pneumocoque polysaccharidique 23-valent (PPSV23)"),
    ("89", "IPV rappel (vaccin polio injectable)"),
    ("106", "DTaP-IPV (Quadracel)"),
    ("107", "DTaP-IPV-Hib (Pentacel)"),
]

ENTRIES = CVX_VACCINS


def seed(force: bool = False):
    with Session(engine) as session:
        existing = session.exec(select(func.count()).select_from(Vaccine)).one()

        if existing > 0 and not force:
            print(f"Table déjà peuplée ({existing} entrées). Ignoré. Utilise --force pour vider.")
            return

        if force:
            session.exec(Vaccine.__table__.delete())
            session.exec(PrescriptionExamen.__table__.delete())
            session.exec(MedicalAct.__table__.delete())
            session.commit()
            print("Table vaccine vidée (y compris les enregistrements parents).")

        now = datetime.now()
        insert_values = []
        for code_cvx, libelle in ENTRIES:
            medical_act_id = uuid.uuid4()
            prescription_examen_id = uuid.uuid4()

            insert_values.append({
                "medical_act_id": medical_act_id,
                "medical_act_data": {
                },
                "prescription_examen_id": prescription_examen_id,
                "prescription_examen_data": {
                    "date_prescription": now,
                    "statut": "En cours",
                    "special_instructions": "",
                    "type": "vaccin",
                    "medical_act_id": medical_act_id,
                },
                "vaccine_data": {
                    "id": prescription_examen_id,
                    "code_cvx": code_cvx,
                    "libelle": libelle,
                },
            })

        # On insère d'abord les parents, puis les enfants
        session.execute(
            MedicalAct.__table__.insert(),
            [
                {
                    "id": v["medical_act_id"],
                    "raisons": None,
                    "rapport_text": None,
                    "observations_text": None,
                    "dmn_id": None,
                    "practitioner_role_id": None,
                    "care_episode_id": None,
                    "type": "VACCINATION",
                    "type_acte": "AUTRE",
                }
                for v in insert_values
            ],
        )
        session.execute(
            PrescriptionExamen.__table__.insert(),
            [
                {
                    "id": v["prescription_examen_id"],
                    "date_prescription": v["prescription_examen_data"]["date_prescription"],
                    "statut": v["prescription_examen_data"]["statut"],
                    "special_instructions": v["prescription_examen_data"]["special_instructions"],
                    "medical_act_id": v["prescription_examen_data"]["medical_act_id"],
                    "type": v["prescription_examen_data"]["type"],
                }
                for v in insert_values
            ],
        )
        session.execute(
            Vaccine.__table__.insert(),
            [
                {
                    "id": v["vaccine_data"]["id"],
                    "code_cvx": v["vaccine_data"]["code_cvx"],
                    "libelle": v["vaccine_data"]["libelle"],
                }
                for v in insert_values
            ],
        )
        session.commit()
        print(f"{len(insert_values)} entrées insérées dans la table vaccine.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed vaccine avec les codes CVX")
    parser.add_argument("--force", action="store_true", help="Vide la table avant insertion")
    args = parser.parse_args()
    seed(force=args.force)
