import argparse
from sqlmodel import select, func
from app.database import engine, Session
from app.models.medication_reference import MedicationReference

MEDICATION_REFERENCES = [
    # === Antihypertenseurs ===
    ("AMLO5", "Amlodipine 5 mg", "Amlodipine", "comprimé"),
    ("AMLO10", "Amlodipine 10 mg", "Amlodipine", "comprimé"),
    ("ENAL5", "Enalapril 5 mg", "Enalapril", "comprimé"),
    ("ENAL10", "Enalapril 10 mg", "Enalapril", "comprimé"),
    ("LOSA50", "Losartan 50 mg", "Losartan", "comprimé"),
    ("HYDR25", "Hydrochlorothiazide 25 mg", "Hydrochlorothiazide", "comprimé"),

    # === Antidiabétiques ===
    ("METFO500", "Metformine 500 mg", "Metformine", "comprimé"),
    ("METFO850", "Metformine 850 mg", "Metformine", "comprimé"),
    ("GLIB5", "Glibenclamide 5 mg", "Glibenclamide", "comprimé"),
    ("INSULA", "Insuline rapide (Actrapid)", "Insuline humaine", "solution injectable"),
    ("INSULN", "Insuline NPH (Insulatard)", "Insuline humaine", "suspension injectable"),

    # === Antipaludiques ===
    ("ACT20", "Artéméther 20mg + Luméfantrine 120mg", "Artéméther-Luméfantrine", "comprimé"),
    ("ACT40", "Artéméther 40mg + Luméfantrine 240mg", "Artéméther-Luméfantrine", "comprimé"),
    ("ARTIIM", "Artésunate injectable 60 mg", "Artésunate", "poudre injectable"),
    ("CHLOR250", "Chloroquine 250 mg", "Chloroquine", "comprimé"),

    # === Antibiotiques ===
    ("AMOX500", "Amoxicilline 500 mg", "Amoxicilline", "gélule"),
    ("AMOXCL", "Amoxicilline 500mg + Ac. clavulanique 100mg", "Amoxicilline/Acide clavulanique", "comprimé"),
    ("AZITH500", "Azithromycine 500 mg", "Azithromycine", "comprimé"),
    ("CIPRO500", "Ciprofloxacine 500 mg", "Ciprofloxacine", "comprimé"),
    ("CEFTR1", "Ceftriaxone 1g injectable", "Ceftriaxone", "poudre injectable"),
    ("METRO500", "Métronidazole 500 mg", "Métronidazole", "comprimé"),
    ("DOXY100", "Doxycycline 100 mg", "Doxycycline", "comprimé"),

    # === Antalgiques / Anti-inflammatoires ===
    ("PARAC500", "Paracétamol 500 mg", "Paracétamol", "comprimé"),
    ("PARAC1G", "Paracétamol 1g", "Paracétamol", "comprimé effervescent"),
    ("IBUP400", "Ibuprofène 400 mg", "Ibuprofène", "comprimé"),
    ("DICLO50", "Diclofénac 50 mg", "Diclofénac", "comprimé"),
    ("TRAM50", "Tramadol 50 mg", "Tramadol", "gélule"),

    # === Antihistaminiques ===
    ("CETI10", "Cétirizine 10 mg", "Cétirizine", "comprimé"),
    ("LORA10", "Loratadine 10 mg", "Loratadine", "comprimé"),

    # === Gastro-entérologie ===
    ("OMEP20", "Oméprazole 20 mg", "Oméprazole", "gélule"),
    ("RANI150", "Ranitidine 150 mg", "Ranitidine", "comprimé"),

    # === Vitamines et suppléments ===
    ("ACFOL5", "Acide folique 5 mg", "Acide folique", "comprimé"),
    ("FER200", "Fer (Sulfate ferreux) 200 mg", "Sulfate ferreux", "comprimé"),
    ("VITC500", "Vitamine C 500 mg", "Acide ascorbique", "comprimé"),
    ("VITD3", "Vitamine D3 1000 UI", "Cholécalciférol", "comprimé"),
    ("VITB12", "Vitamine B12 1000 µg", "Cyanocobalamine", "solution injectable"),

    # === Contraception ===
    ("MICROG", "Microgynon (Lévonorgestrel + Éthinylestradiol)", "Lévonorgestrel/Éthinylestradiol", "comprimé"),
    ("DEPO", "Depo-Provera 150 mg (acétate de médroxyprogestérone)", "Médroxyprogestérone", "suspension injectable"),
    ("IMPLAN", "Implanon NXT (étonogestrel)", "Étonogestrel", "implant"),

    # === Antirétroviraux ===
    ("TDFFTC", "Ténofovir 300mg + Emtricitabine 200mg", "Ténofovir/Emtricitabine", "comprimé"),
    ("EFV600", "Efavirenz 600 mg", "Efavirenz", "comprimé"),

    # === Anti-asthmatiques ===
    ("SALBUT", "Salbutamol 100 µg spray", "Salbutamol", "aérosol"),
    ("BECLO", "Béclométasone 250 µg spray", "Béclométasone", "aérosol"),
]


def seed(force: bool = False):
    with Session(engine) as session:
        existing = session.exec(select(func.count()).select_from(MedicationReference)).one()
        if existing > 0 and not force:
            print(f"Table medicationreference déjà peuplée ({existing} entrées). Ignoré.")
            return
        if force:
            session.exec(MedicationReference.__table__.delete())
            session.commit()
        for code, nom_commercial, dc_nom, forme in MEDICATION_REFERENCES:
            session.add(MedicationReference(
                code_medicament=code,
                nom_commercial=nom_commercial,
                dc_nom=dc_nom,
                forme_galenique=forme,
            ))
        session.commit()
        print(f"{len(MEDICATION_REFERENCES)} références de médicaments insérées.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    seed(force=args.force)
