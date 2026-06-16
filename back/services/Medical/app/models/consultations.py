import uuid
from sqlmodel import SQLModel,Field, Relationship
from typing import Optional
from datetime import date

class Consultations(MedicalActs, table = True ):
    id: Optional[uuid.UUID] = Field(default = None, foreign_key = "medicalacts.id", primary_key = True )
    duree_minutes: Optional[int] = None

    __mapper_args__ = {
        "polymorphic_identity": "TypeActe.CONSULTATION",
    }