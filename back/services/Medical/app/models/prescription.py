import uuid
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional
from datetime import datetime
from app.types.enums import StatutPrescription, TypePrescription


class Prescription(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    date_prescription: datetime = Field(default_factory=datetime.now)
    statut: StatutPrescription = Field(default=StatutPrescription.EN_COURS)
    special_instructions: str

    diagnosis_id : Optional[uuid.UUID] = Field(default=None, foreign_key="diagnosis.id")
    diagnosis: Optional["Diagnosis"] = Relationship(back_populates="prescriptions")

    type_prescription: TypePrescription


    __mapper_args__ = {
        "polymorphic_on": "type_prescription",
        "polymorphic_identity": "prescription_base"
    }