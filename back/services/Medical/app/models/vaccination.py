import uuid
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from app.models.medical_act import MedicalAct


class Vaccination(MedicalAct, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="medical_act.id", primary_key=True)
    injection_site: Optional[str] = Field(default=None)
    sequence_dose: Optional[int] = Field(default=None)
    batch_number: Optional[str] = Field(default=None)
    next_reminder: Optional[date] = Field(default=None)
    note: Optional[str] = Field(default=None)

    __mapper_args__ = {
        "polymorphic_identity": "TypeActe.VACCINATION",
    }
