import argparse
from sqlmodel import select, func
from app.database import engine, Session
from app.models.vaccine_reference import VaccineReference

VACCINE_REFERENCES = [
    ("19", "BCG (vaccin antituberculeux)"),
    ("08", "Hépatite B (vaccin pédiatrique)"),
    ("102", "Pentavalent (DTP-HepB-Hib)"),
    ("02", "OPV (vaccin polio oral)"),
    ("10", "IPV (vaccin polio injectable)"),
    ("05", "Rougeole (vaccin monovalent)"),
    ("94", "Rougeole-Rubéole (MR)"),
    ("37", "Fièvre jaune (vaccin)"),
    ("133", "Pneumocoque conjugué 13-valent (PCV13)"),
    ("119", "Rotavirus monovalent (Rotarix)"),
    ("147", "Méningocoque A conjugué (MenAfriVac)"),
    ("09", "Td (Tétanos-Diphtérie, vaccin adulte)"),
    ("35", "Anatoxine tétanique simple (TT)"),
    ("115", "Tdap (Tétanos-Diphtérie-Coqueluche)"),
    ("118", "HPV quadrivalent (Gardasil 4)"),
    ("91", "Fièvre typhoïde conjugué Vi (TCV)"),
    ("31", "Hépatite A (vaccin)"),
    ("03", "ROR (Rougeole-Oreillons-Rubéole)"),
    ("40", "Rage (vaccin pré-exposition)"),
    ("90", "Rage (vaccin post-exposition)"),
    ("15", "Grippe saisonnière inactivé"),
    ("207", "COVID-19 ARNm (Pfizer-BioNTech)"),
    ("208", "COVID-19 ARNm (Moderna)"),
    ("33", "Pneumocoque polysaccharidique 23-valent"),
    ("21", "Varicelle (vaccin)"),
    ("173", "Choléra oral (Shanchol)"),
    ("25", "Fièvre typhoïde polysaccharidique Vi"),
    ("83", "Hépatite A+B combiné"),
    ("176", "Rage (vaccin intradermique)"),
    ("140", "Grippe saisonnière haute dose"),
]


def seed(force: bool = False):
    with Session(engine) as session:
        existing = session.exec(select(func.count()).select_from(VaccineReference)).one()
        if existing > 0 and not force:
            print(f"Table vaccinereference déjà peuplée ({existing} entrées). Ignoré.")
            return
        if force:
            session.exec(VaccineReference.__table__.delete())
            session.commit()
        for code_cvx, libelle in VACCINE_REFERENCES:
            session.add(VaccineReference(code_cvx=code_cvx, libelle=libelle))
        session.commit()
        print(f"{len(VACCINE_REFERENCES)} références de vaccins insérées.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    seed(force=args.force)
