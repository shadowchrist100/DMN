import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class PatientRelative(SQLModel, table=True):
    patient_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="patient.id",
        primary_key=True
    )
    relative_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="relative.id",
        primary_key=True
    )
    code_relation: str
    emergency_contact: bool
