import uuid
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from app.models.prescription_directive import PrescriptionDirective
from app.types.enums import TypeDirective

if TYPE_CHECKING:
    from .medication_reference import MedicationReference


class MedicationDirective(PrescriptionDirective, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="prescription_directive.id", primary_key=True)

    medication_ref_id: uuid.UUID = Field(foreign_key="medication_reference.id")
    medication_ref: "MedicationReference" = Relationship(back_populates="medication_directives")

    posologie: str
    duree_jours: int

    __mapper_args__ = {"polymorphic_identity": TypeDirective.MEDICAMENT}
