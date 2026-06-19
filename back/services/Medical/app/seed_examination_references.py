import argparse
from sqlmodel import select, func
from app.database import engine, Session
from app.models.examination_reference import ExaminationReference

EXAM_REFERENCES = [
    # === Biochimie / Analyses sanguines ===
    ("14771-0", "Glycémie à jeun", "LABORATOIRE"),
    ("4548-4", "Hémoglobine glyquée (HbA1c)", "LABORATOIRE"),
    ("2160-0", "Créatininémie", "LABORATOIRE"),
    ("2823-3", "Kaliémie", "LABORATOIRE"),
    ("2951-2", "Natriémie", "LABORATOIRE"),
    ("1742-6", "Transaminases SGOT/AST", "LABORATOIRE"),
    ("1743-4", "Transaminases SGPT/ALT", "LABORATOIRE"),
    ("2085-9", "Cholestérol total", "LABORATOIRE"),
    ("2089-1", "Cholestérol LDL", "LABORATOIRE"),
    ("2093-3", "Cholestérol HDL", "LABORATOIRE"),
    ("2571-8", "Triglycérides", "LABORATOIRE"),
    ("58410-2", "Hémogramme complet (NFS)", "LABORATOIRE"),
    ("718-7", "Taux d'hémoglobine", "LABORATOIRE"),
    ("24360-0", "Électrophorèse de l'hémoglobine (Drépanocytose)", "LABORATOIRE"),
    ("11562-6", "Groupage sanguin ABO et Rhésus", "LABORATOIRE"),
    ("4542-7", "VS (Vitesse de sédimentation)", "LABORATOIRE"),
    ("30522-7", "CRP (Protéine C réactive)", "LABORATOIRE"),
    ("33959-8", "Bilirubine totale et conjuguée", "LABORATOIRE"),
    ("1751-7", "Albumine sérique", "LABORATOIRE"),
    ("17865-6", "Taux de prothrombine (TP)", "LABORATOIRE"),

    # === Parasitologie / Microbiologie ===
    ("33750-1", "Goutte épaisse et frottis (Paludisme)", "LABORATOIRE"),
    ("47420-5", "TDR Paludisme", "LABORATOIRE"),
    ("34160-2", "Recherche d'œufs de Schistosoma", "LABORATOIRE"),
    ("11477-7", "BAAR crachats (Tuberculose)", "LABORATOIRE"),
    ("50556-0", "ECBU (Examen cytobactériologique des urines)", "LABORATOIRE"),

    # === Sérologie ===
    ("56888-1", "Sérologie VIH 1/2", "LABORATOIRE"),
    ("5196-1", "Antigène HBs (Hépatite B)", "LABORATOIRE"),
    ("16128-1", "Anticorps anti-VHC (Hépatite C)", "LABORATOIRE"),
    ("44265-7", "Sérologie de Widal (Fièvre typhoïde)", "LABORATOIRE"),
    ("20507-0", "Sérologie Syphilis (VDRL/RPR)", "LABORATOIRE"),

    # === Urines ===
    ("2106-3", "Test de grossesse urinaire (hCG)", "LABORATOIRE"),
    ("24357-6", "Analyse d'urine par bandelette", "LABORATOIRE"),

    # === Imagerie ===
    ("36643-5", "Radiographie du thorax", "radiographie"),
    ("24689-2", "Échographie obstétricale", "radiographie"),
    ("24811-2", "Échographie abdominale", "radiographie"),
    ("24516-7", "Échographie rénale", "radiographie"),
    ("24547-2", "Échographie pelvienne", "radiographie"),
    ("41806-1", "Scanner cérébral", "radiographie"),
    ("41853-3", "Scanner abdominal", "radiographie"),
    ("44138-6", "IRM cérébrale", "radiographie"),
    ("44069-3", "IRM du rachis lombaire", "radiographie"),
    ("36646-8", "Radiographie du genou", "radiographie"),
    ("36648-4", "Radiographie de la cheville", "radiographie"),
    ("36653-4", "Radiographie du poignet", "radiographie"),
]


def seed(force: bool = False):
    with Session(engine) as session:
        existing = session.exec(select(func.count()).select_from(ExaminationReference)).one()
        if existing > 0 and not force:
            print(f"Table examinationreference déjà peuplée ({existing} entrées). Ignoré.")
            return
        if force:
            session.exec(ExaminationReference.__table__.delete())
            session.commit()
        for code, libelle, nature in EXAM_REFERENCES:
            session.add(ExaminationReference(code=code, libelle=libelle, nature=nature))
        session.commit()
        print(f"{len(EXAM_REFERENCES)} références d'examens insérées.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    seed(force=args.force)
