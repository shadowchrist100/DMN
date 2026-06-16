from typing import Optional
from sqlmodel import Field, SQLModel


class VitalsConstantsRef(SQLModel, table=True):
    # La clé primaire est un code unique standardisé (ex: "TEMP", "WEIGHT", "BP_SYS")
    code: str = Field(primary_key=True)
    nom: str          # Ex: "Température corporelle"
    unite_mesure: str # Ex: "°C", "kg", "mmHg"

    # Relation vers les mesures réelles prises sur le terrain
    mesures: List["VitalConstant"] = Relationship(back_populates="constant_ref")
