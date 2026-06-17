import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class MedicationReference(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)

    code_medicament: str = Field(index=True, unique=True)
    nom_commercial: str
    dc_nom: str
    forme_galenique: str
