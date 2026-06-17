from typing import TYPE_CHECKING
import uuid
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .diagnosis import Diagnosis
    from .examination_act import ExaminationAct

from app.types.enums import TypeEvidence


class DiagnosticEvidence(SQLModel, table=True):
    __tablename__ = "diagnosticevidence"

    diagnosis_id: uuid.UUID = Field(
        foreign_key="diagnosis.id",
        primary_key=True
    )
    examination_act_id: uuid.UUID = Field(
        foreign_key="examinationact.id",
        primary_key=True
    )
    type: TypeEvidence

    diagnosis: "Diagnosis" = Relationship(back_populates="diagnostic_evidences")
    examination_act: "ExaminationAct" = Relationship(back_populates="diagnostic_evidences")
