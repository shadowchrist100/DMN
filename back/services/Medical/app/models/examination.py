import uuid
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import date, datetime
from app.types.enums import NatureExamination, TypePrescription
from app.models.prescription import Prescription


class Examination(Prescription, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="prescription.id", primary_key=True)
    code_loinc: str
    libelle: str
    nature_examination: NatureExamination

    __mapper_args__ = {
        "polymorphic_identity": TypePrescription.EXAMINATION,
    }