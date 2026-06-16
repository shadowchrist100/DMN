import uuid
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from app.models.medical_act import MedicalAct

if TYPE_CHECKING:
    from .examination import Examination


class ExaminationAct(MedicalAct, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="medical_act.id", primary_key=True)
    code_loinc: str
    libelle_examen: str
    type_examen: str
    value: str
    interpretation: str
    image_path: Optional[str] = Field()

    __mapper_args__ = {
        "polymorphic_identity": "TypeActe.EXAMEN",
    }
