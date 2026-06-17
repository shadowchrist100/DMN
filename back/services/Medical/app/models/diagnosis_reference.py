import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class DiagnosisReference(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    code_cid11: str = Field(index=True, unique=True)
    libelle: str
