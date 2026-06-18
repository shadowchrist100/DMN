"""Seed script : préremplit la table examination avec les codes LOINC
des examens fréquents en Afrique de l'Ouest.

Utilise des inserts directs (medicalact → prescriptionexamen → examination)
pour respecter l'héritage par jointure SQLAlchemy.

Usage :
    python -m app.seed_examinations                  # insère si table vide
    python -m app.seed_examinations --force           # vide et réinsère
"""

import argparse
import uuid
from datetime import datetime
from sqlmodel import select, func

from app.database import engine, Session
from app.models.medical_act import MedicalAct
from app.models.prescription_examen import PrescriptionExamen
from app.models.examination import Examination


# (code_loinc, libelle, nature_examination)
LOINC_EXAMINATIONS = [
    # === Parasitologie ===
    ("33750-1", "Goutte épaisse et frottis sanguin (Paludisme)", "Microbiologie"),
    ("47420-5", "Test de Diagnostic Rapide (TDR) Paludisme", "Microbiologie"),
    ("34160-2", "Recherche d'œufs de Schistosoma (Bilharziose)", "Microbiologie"),
    ("11477-7", "Recherche de BAAR dans les crachats (Tuberculose)", "Microbiologie"),
    
    # === Sérologie / Maladies infectieuses ===
    ("56888-1", "Sérologie VIH 1/2 (Test Rapide)", "Biologie"),
    ("5196-1", "Antigène HBs (Hépatite B)", "Biologie"),
    ("16128-1", "Anticorps anti-VHC (Hépatite C)", "Biologie"),
    ("44265-7", "Sérologie de Widal (Fièvre Typhoïde)", "Biologie"),
    ("20507-0", "Sérologie Syphilis (VDRL/RPR)", "Biologie"),
    ("22587-0", "Test de Diagnostic Rapide Dengue", "Biologie"),
    
    # === Hématologie ===
    ("58410-2", "Hémogramme complet (NFS)", "Biologie"),
    ("718-7", "Taux d'hémoglobine", "Biologie"),
    ("24360-0", "Électrophorèse de l'hémoglobine (Recherche drépanocytose)", "Biologie"),
    ("11562-6", "Groupage sanguin ABO et Rhésus", "Biologie"),
    
    # === Biochimie clinique ===
    ("14771-0", "Glycémie à jeun", "Biologie"),
    ("4548-4", "Hémoglobine glyquée (HbA1c)", "Biologie"),
    ("2160-0", "Créatininémie", "Biologie"),
    ("2823-3", "Kaliémie", "Biologie"),
    ("2951-2", "Natriémie", "Biologie"),
    ("1742-6", "Transaminases SGOT/AST", "Biologie"),
    ("1743-4", "Transaminases SGPT/ALT", "Biologie"),
    ("2085-9", "Cholestérol total", "Biologie"),
    ("2089-1", "Cholestérol LDL", "Biologie"),
    ("2093-3", "Cholestérol HDL", "Biologie"),
    ("2571-8", "Triglycérides", "Biologie"),
    
    # === Examens urinaires et autres ===
    ("2106-3", "Test de grossesse urinaire (hCG)", "Biologie"),
    ("50556-0", "Examen cytobactériologique des urines (ECBU)", "Microbiologie"),
    ("24357-6", "Analyse d'urine par bandelette", "Biologie"),
    
    # === Imagerie médicale ===
    ("36643-5", "Radiographie du thorax", "Imagerie"),
    ("24689-2", "Échographie obstétricale", "Imagerie"),
    ("24811-2", "Échographie abdominale", "Imagerie")
]

ENTRIES = LOINC_EXAMINATIONS


def seed(force: bool = False):
    with Session(engine) as session:
        existing = session.exec(select(func.count()).select_from(Examination)).one()

        if existing > 0 and not force:
            print(f"Table déjà peuplée ({existing} entrées). Ignoré. Utilise --force pour vider.")
            return

        if force:
            session.exec(Examination.__table__.delete())
            session.exec(PrescriptionExamen.__table__.delete().where(PrescriptionExamen.type_prescription == 'examination'))
            # Note : on ne supprime pas de MedicalAct globalement ici pour ne pas affecter d'autres actes
            session.commit()
            print("Table examination vidée.")

        now = datetime.now()
        insert_values = []
        for code_loinc, libelle, nature_examination in ENTRIES:
            medical_act_id = uuid.uuid4()
            prescription_examen_id = uuid.uuid4()

            insert_values.append({
                "medical_act_id": medical_act_id,
                "prescription_examen_id": prescription_examen_id,
                "prescription_examen_data": {
                    "date_prescription": now,
                    "statut": "Modèle standard",
                    "special_instructions": "",
                    "type": "examination",
                    "medical_act_id": medical_act_id,
                },
                "examination_data": {
                    "id": prescription_examen_id,
                    "code_loinc": code_loinc,
                    "libelle": libelle,
                    "nature_examination": nature_examination,
                },
            })

        # Insertions parents et enfants
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
                    "type": "EXAMEN",
                    "type_acte": "EXAMEN_BIOLOGIE" if v["examination_data"]["nature_examination"] == "Biologie" else "IMAGERIE" if v["examination_data"]["nature_examination"] == "Imagerie" else "AUTRE",
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
            Examination.__table__.insert(),
            [
                {
                    "id": v["examination_data"]["id"],
                    "code_loinc": v["examination_data"]["code_loinc"],
                    "libelle": v["examination_data"]["libelle"],
                    "nature_examination": v["examination_data"]["nature_examination"]
                }
                for v in insert_values
            ],
        )
        session.commit()
        print(f"✅ {len(insert_values)} entrées insérées dans la table examination.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed examination avec les codes LOINC")
    parser.add_argument("--force", action="store_true", help="Vide la table avant insertion")
    args = parser.parse_args()
    seed(force=args.force)
