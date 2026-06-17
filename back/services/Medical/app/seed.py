"""Seed script : préremplit diagnosisreference avec les codes ICD-11 MMS
les plus fréquents en soins primaires.

Usage :
    python -m app.seed                  # insère si table vide
    python -m app.seed --force          # vide et réinsère
"""

import argparse
import uuid
from sqlmodel import select, func

from app.database import engine, Session
from app.models.diagnosis_reference import DiagnosisReference


# (code_cid11, libelle)
ICD11_REF = [
    # === Maladies infectieuses et parasitaires ===
    ("1C40", "Paludisme à Plasmodium falciparum"),
    ("1C41", "Paludisme à Plasmodium vivax"),
    ("1C43", "Paludisme non spécifié"),
    ("1A00", "Choléra"),
    ("1A05", "Fièvre typhoïde"),
    ("1B20", "Tuberculose pulmonaire"),
    ("1B21", "Tuberculose extrapulmonaire"),
    ("1C12", "Dengue"),
    ("1C1A", "Infection à virus Zika"),
    ("1C1E", "Fièvre de Lassa"),
    ("1C1F", "Fièvre hémorragique de Crimée-Congo"),
    ("1C34", "Trypanosomose africaine (maladie du sommeil)"),
    ("1C51", "Schistosomiase"),
    ("1C55", "Filariose lymphatique"),
    ("1C61", "Onchocercose"),
    ("1C70", "Lèpre (maladie de Hansen)"),
    ("1A30", "Infection à VIH, stade clinique 1"),
    ("1A31", "Infection à VIH, stade clinique 2"),
    ("1A32", "Infection à VIH, stade clinique 3 (SIDA)"),
    ("1C80", "Tétanos"),
    ("1C90", "Diphtérie"),
    ("1C9Z", "Coqueluche"),
    ("1D00", "Infection à méningocoque"),
    ("1D01", "Méningite bactérienne non spécifiée"),
    ("1D02", "Méningite virale"),
    ("1D10", "Rougeole"),
    ("1D20", "Rubéole"),
    ("1D30", "Varicelle"),
    ("1D40", "Zona"),
    ("1D50", "Herpès simplex"),
    ("1D60", "Mononucléose infectieuse"),
    ("1D70", "Hépatite virale A"),
    ("1D71", "Hépatite virale B"),
    ("1D72", "Hépatite virale C"),
    ("1E00", "Infection urinaire basse, site non précisé"),
    ("1E01", "Pyélonéphrite aiguë"),
    ("1E11", "Infection cutanée bactérienne"),
    ("1E20", "Infection de la plaie"),
    ("1F00", "Infection sexuellement transmissible, non spécifiée"),
    ("1F01", "Syphilis"),
    ("1F03", "Infection à gonocoque"),
    ("1F05", "Infection à Chlamydia trachomatis"),
    ("1F10", "Gale"),
    ("1F20", "Pédiculose (poux)"),
    ("1G00", "Mycose cutanée superficielle"),
    ("1G01", "Candidose"),
    ("1G02", "Dermatophytose (teigne, pied d'athlète)"),
    ("1H00", "Amibiase intestinale"),
    ("1H01", "Giardiase"),
    ("1H02", "Helminthiase intestinale (ascaridiose)"),
    ("1H03", "Oxyurose"),
    ("1H04", "Ankylostomiase"),
    ("1H10", "Toxoplasmose"),

    # === Maladies non transmissibles ===
    ("5A10", "Hypertension essentielle (primitive)"),
    ("5A11", "Hypertension artérielle maligne"),
    ("5A20", "Cardiopathie hypertensive"),
    ("5A30", "Infarctus aigu du myocarde"),
    ("5A40", "Maladie coronarienne"),
    ("5A50", "Insuffisance cardiaque"),
    ("5A60", "Accident vasculaire cérébral ischémique"),
    ("5A61", "Accident vasculaire cérébral hémorragique"),
    ("5B10", "Diabète sucré de type 1"),
    ("5B11", "Diabète sucré de type 2"),
    ("5B50", "Obésité"),
    ("5B51", "Obésité morbide"),
    ("5B80", "Dyslipidémie (hypercholestérolémie)"),
    ("5C10", "Asthme bronchique"),
    ("5C20", "Bronchopneumopathie chronique obstructive (BPCO)"),
    ("5C30", "Pneumonie, agent non spécifié"),
    ("5C40", "Pneumonie à SARS-CoV-2 (COVID-19)"),
    ("5C50", "Insuffisance rénale chronique"),
    ("5C60", "Néphropathie diabétique"),
    ("5C70", "Lithiase urinaire (calcul rénal)"),
    ("5D30", "Anémie ferriprive"),
    ("5D31", "Anémie drépanocytaire (hémoglobinopathie SS)"),
    ("5D32", "Anémie drépanocytaire SC"),
    ("5D33", "Thalassémie"),
    ("5D40", "Trouble de la coagulation"),
    ("5E10", "Hypothyroïdie"),
    ("5E20", "Hyperthyroïdie"),
    ("5F10", "Ulcère gastrique"),
    ("5F11", "Ulcère duodénal"),
    ("5F20", "Gastrite chronique"),
    ("5F30", "Reflux gastro-œsophagien (RGO)"),
    ("5F40", "Hernie hiatale"),
    ("5F50", "Maladie cœliaque (intolérance au gluten)"),
    ("5F60", "Syndrome du côlon irritable"),
    ("5F70", "Constipation chronique"),
    ("5G10", "Cirrhose hépatique"),
    ("5G20", "Stéatose hépatique non alcoolique (NASH)"),
    ("5H10", "Glaucone"),
    ("5H20", "Cataracte"),
    ("5H30", "Dégénérescence maculaire liée à l'âge"),
    ("5J10", "Rhinite allergique"),
    ("5J11", "Sinusite chronique"),
    ("5J20", "Otite moyenne aiguë"),
    ("5K10", "Arthrose (gonarthrose, coxarthrose)"),
    ("5K20", "Lombalgie chronique"),
    ("5K30", "Hernie discale"),
    ("5K40", "Polyarthrite rhumatoïde"),
    ("5K50", "Goutte"),
    ("5K60", "Ostéoporose"),
    ("5L10", "Dermatite atopique (eczéma)"),
    ("5L20", "Psoriasis"),
    ("5L30", "Acné vulgaire"),
    ("5L40", "Urticaire chronique"),
    ("5M10", "Épilepsie"),
    ("5M20", "Migraine"),
    ("5M30", "Céphalée de tension"),
    ("5M40", "Maladie de Parkinson"),
    ("5M50", "Démence, type Alzheimer"),
    ("5N10", "Trouble dépressif récurrent"),
    ("5N11", "Épisode dépressif léger"),
    ("5N12", "Épisode dépressif sévère sans symptômes psychotiques"),
    ("5N20", "Trouble anxieux généralisé"),
    ("5N30", "Trouble panique"),
    ("5N40", "Insomnie chronique"),
    ("5P10", "Cancer du sein"),
    ("5P20", "Cancer du col de l'utérus"),
    ("5P30", "Cancer de la prostate"),
    ("5P40", "Cancer du poumon"),
    ("5P50", "Cancer du côlon"),
    ("5P60", "Cancer du foie (carcinome hépatocellulaire)"),
    ("5P70", "Lymphome non hodgkinien"),
    ("5P80", "Leucémie"),

    # === Allergies et intolérances ===
    ("4A80", "Allergie aux antibiotiques (pénicilline)"),
    ("4A81", "Allergie aux sulfamides"),
    ("4A82", "Allergie aux anti-inflammatoires (AINS)"),
    ("4A83", "Allergie au paracétamol"),
    ("4A84", "Allergie aux produits de contraste iodés"),
    ("4B10", "Allergie alimentaire, non spécifiée"),
    ("4B11", "Allergie à l'arachide"),
    ("4B12", "Allergie au lait de vache"),
    ("4B13", "Allergie à l'œuf"),
    ("4B14", "Allergie au poisson et fruits de mer"),
    ("4B15", "Allergie au soja"),
    ("4B20", "Allergie aux acariens"),
    ("4B21", "Allergie aux pollens (rhinite allergique saisonnière)"),
    ("4B22", "Allergie aux moisissures"),
    ("4B23", "Allergie aux squames d'animaux"),
    ("4B30", "Allergie au venin d'hyménoptère (abeille, guêpe)"),
    ("4B40", "Allergie au latex"),
    ("4B50", "Anaphylaxie, sans précision"),
    ("4B60", "Œdème de Quincke (angio-œdème)"),
    ("4C00", "Intolérance au lactose"),
    ("4C10", "Intolérance au fructose"),
    ("4C20", "Intolérance à l'histamine"),

    # === Affections de l'enfant et périnatales ===
    ("KA00", "Prématurité (nouveau-né prématuré)"),
    ("KA10", "Retard de croissance intra-utérin"),
    ("KA20", "Asphyxie périnatale"),
    ("KB00", "Malnutrition aiguë sévère"),
    ("KB10", "Marasme nutritionnel"),
    ("KB20", "Kwashiorkor"),
    ("KC00", "Diarrhée infectieuse de l'enfant"),
    ("KC10", "Déshydratation sévère"),
    ("KD00", "Pneumonie de l'enfant"),
    ("KD10", "Bronchiolite aiguë du nourrisson"),
    ("KE00", "Drépanocytose de l'enfant"),
    ("KF00", "Malformation cardiaque congénitale"),

    # === Affections maternelles ===
    ("JA00", "Grossesse normale (suivi prénatal)"),
    ("JA10", "Grossesse à haut risque"),
    ("JA20", "Menace d'accouchement prématuré"),
    ("JA30", "Pré-éclampsie"),
    ("JA40", "Éclampsie"),
    ("JA50", "Diabète gestationnel"),
    ("JA60", "Anémie de la grossesse"),
    ("JB00", "Accouchement par voie basse, simple"),
    ("JB10", "Césarienne"),
    ("JB20", "Hémorragie du post-partum"),
    ("JB30", "Endométrite du post-partum"),
    ("JC00", "Avortement spontané précoce"),
    ("JD00", "Infection du post-partum"),

    # === Traumatismes et blessures ===
    ("NA00", "Traumatisme crânien léger (commotion)"),
    ("NA10", "Fracture fermée d'un membre"),
    ("NA20", "Fracture ouverte d'un membre"),
    ("NA30", "Fracture du col du fémur"),
    ("NA40", "Fracture du poignet (Pouteau-Colles)"),
    ("NA50", "Entorse de la cheville"),
    ("NA60", "Luxation de l'épaule"),
    ("NB00", "Plaie superficielle"),
    ("NB10", "Plaie profonde nécessitant suture"),
    ("NB20", "Brûlure au 1er degré"),
    ("NB30", "Brûlure au 2e degré"),
    ("NB40", "Brûlure au 3e degré"),
    ("NC00", "Morsure de chien"),
    ("NC10", "Morsure de serpent"),
    ("NC20", "Piqûre d'insecte avec réaction locale"),
    ("ND00", "Envenimation scorpionique"),
    ("NE00", "Noyade non fatale"),

    # === Symptômes et motifs de consultation ===
    ("MA00", "Fièvre, sans précision"),
    ("MA10", "Céphalée (mal de tête)"),
    ("MA20", "Toux chronique"),
    ("MA30", "Dyspnée (difficulté respiratoire)"),
    ("MA40", "Douleur abdominale"),
    ("MA50", "Nausées et vomissements"),
    ("MA60", "Diarrhée aiguë"),
    ("MA70", "Constipation"),
    ("MA80", "Dorsalgie (mal de dos)"),
    ("MA90", "Arthralgie (douleur articulaire)"),
    ("MB00", "Myalgie (douleur musculaire)"),
    ("MB10", "Asthénie (fatigue chronique)"),
    ("MB20", "Anorexie (perte d'appétit)"),
    ("MB30", "Amai'grissement involontaire"),
    ("MB40", "Œdème des membres inférieurs"),
    ("MB50", "Prurit (démangeaison)"),
    ("MB60", "Éruption cutanée, sans précision"),
    ("MB70", "Vertige"),
    ("MB80", "Syncope (perte de connaissance)"),
    ("MB90", "Convulsion fébrile de l'enfant"),
    ("MC00", "Anémie (baisse de l'hémoglobine)"),
    ("MC10", "Hyperglycémie"),
    ("MC20", "Hypoglycémie"),
    ("MC30", "Dénutrition protéino-énergétique"),
    ("MG00", "Trouble de la réfraction (myopie, hypermétropie)"),
    ("MG10", "Presbytie"),
    ("MH00", "Surdité de transmission"),
    ("MH10", "Surdité de perception"),
]

ENTRIES = ICD11_REF


def seed(force: bool = False):
    with Session(engine) as session:
        existing = session.exec(select(func.count()).select_from(DiagnosisReference)).one()

        if existing > 0 and not force:
            print(f"ℹ️  Table déjà peuplée ({existing} entrées). Ignoré. Utilise --force pour vider.")
            return

        if force:
            session.exec(DiagnosisReference.__table__.delete())
            session.commit()
            print("🗑️  Table vidée.")

        insert_values = [
            {"id": uuid.uuid4(), "code_cid11": code, "libelle": label}
            for code, label in ENTRIES
        ]
        session.execute(DiagnosisReference.__table__.insert(), insert_values)
        session.commit()
        print(f"✅ {len(insert_values)} entrées insérées dans diagnosisreference.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed diagnosisreference avec ICD-11 MMS")
    parser.add_argument("--force", action="store_true", help="Vide la table avant insertion")
    args = parser.parse_args()
    seed(force=args.force)
