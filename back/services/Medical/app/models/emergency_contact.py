import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional


class EmergencyContact(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    patient_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="patient.id"
    )
    first_name: str
    last_name: str
    phone: str
    code_relation: str

    patient: Optional["Patient"] = Relationship(back_populates="emergency_contacts")


from app.models.patient import Patient
