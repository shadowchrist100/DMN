import uuid
from sqlmodel import Field, SQLModel

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
