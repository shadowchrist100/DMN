import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class VaccineReference(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    code_cvx: str = Field(index=True, unique=True)
    libelle: str
