import uuid
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import date, datetime

class MedicamentRef(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Stockez ici les codes officiels (CIS, CIP ou RxNorm)
    code_medicament: str = Field(index=True, unique=True) # Ex: Code CIS ou CIP13
    nom_commercial: str  # Ex: "Doliprane 500mg"
    dc_nom: str          # Dénomination Commune Internationale (Ex: "Paracétamol")
    forme_galenique: str # Ex: "Comprimé effervescent", "Gélule"

    # Relation inverse : permet de savoir dans quelles lignes de prescription ce médicament apparaît
    prescriptions: List["Medicament"] = Relationship(back_populates="medicament_ref")