import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class RelatedPerson(SQLModel, table=True):
    patient_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="patient.id",
        primary_key=True
    )
    emergency_contact_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="emergency_contact.id",
        primary_key=True
    )
    code_relation: str
