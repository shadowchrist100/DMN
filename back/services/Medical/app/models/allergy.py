import uuid
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from app.models.diagnosis import Diagnosis

if TYPE_CHECKING:
    from .dmn import DMN


class Allergy(Diagnosis, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="diagnosis.id", primary_key=True)
    nature_allergie: str
    categorie: str
    libelle: str
    criticite: str
    statut_clinique: str
    discover_at: date
    reactions_text: str

    __mapper_args__ = {
        "polymorphic_identity": "allergy",
    }
