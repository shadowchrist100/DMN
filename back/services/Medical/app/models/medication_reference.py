import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .medication_directive import MedicationDirective


class MedicationReference(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)

    code_medicament: str = Field(index=True, unique=True)
    nom_commercial: str
    dc_nom: str
    forme_galenique: str

    medication_directives: List["MedicationDirective"] = Relationship(back_populates="medication_ref")
