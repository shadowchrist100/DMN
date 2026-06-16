import uuid
from sqlmodel import SQLModel, Field, List, Relationship
from typing import Optional
from datetime import date


class DiagnosisRef(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    code_cid11: str = Field(index=True, unique=True)
    libelle: str

    # Relation inverse
    diagnoses: List["Diagnosis"] = Relationship(back_populates="diagnosis_ref")