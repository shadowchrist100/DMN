import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .diagnosis import Diagnosis


class DiagnosisReference(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    code_cid11: str = Field(index=True, unique=True)
    libelle: str

    diagnoses: List["Diagnosis"] = Relationship(back_populates="diagnosis_ref")
