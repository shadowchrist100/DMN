import uuid
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import date, datetime
from app.types.enums import TypePrescription
from app.models.prescription import Prescription


class Vaccine(Prescription, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="prescription.id", primary_key=True)
    code_cvx: str
    libelle: str

    __mapper_args__ = {
        "polymorphic_identity": TypePrescription.VACCIN,
    }
