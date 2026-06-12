import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class Maladie(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    code: str = Field(index=True)
    libelle: str
    systeme_codification: str
