import uuid
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from app.types.enums import TypeDirective

class OrdonnanceSeance(OrdonnanceDirective, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="ordonnancedirective.id", primary_key=True)
    
    nombre_seances: int       # Ex: 10
    frequence_hebdo: str      # Ex: "2 fois par semaine"
    objectifs_specifiques: str # Ex: "Renforcement de la coiffe des rotateurs"

    __mapper_args__ = { "polymorphic_identity": TypeDirective.SOINS_REED_KINE }