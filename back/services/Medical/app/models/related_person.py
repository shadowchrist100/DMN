import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import date


class RelatedPerson(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    patient_id: str = Field(foreign_key="patient.id")
    nom: str
    prenom: str
    code_relation: str
    telephone: Optional[str] = None
