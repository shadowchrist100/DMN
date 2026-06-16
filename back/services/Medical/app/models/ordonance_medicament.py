import uuid
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from app.types.enums import TypeDirective

class OrdonnanceMedicament(OrdonnanceDirective, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="ordonnancedirective.id", primary_key=True)
    
    medicament_ref_id: uuid.UUID = Field(foreign_key="medicamentref.id")
    medicament_ref: MedicamentRef = Relationship(back_populates="ordonnance_medicaments")
    
    posologie: str      # Ex: "1 gélule matin et soir"
    duree_jours: int    # Ex: 7

    __mapper_args__ = { "polymorphic_identity": TypeDirective.MEDICAMENT }