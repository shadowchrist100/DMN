import uuid
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

class Ordonnance(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    date_emission: datetime = Field(default_factory=datetime.now)
    statut: str = Field(default="active")

    medical_act_id: uuid.UUID = Field(foreign_key="medicalacts.id", unique=True)
    medical_act: MedicalActs = Relationship(back_populates="ordonnance")

    # L'ordonnance contient des directives (médicaments, séances, hygiène de vie)
    directives: List["OrdonnanceDirective"] = Relationship(back_populates="ordonnance")