import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from app.types.enums import TypeDirective

if TYPE_CHECKING:
    from .prescription_order import PrescriptionOrder
    from .medication_directive import MedicationDirective
    from .lifestyle_directive import LifestyleDirective
    from .session_directive import SessionDirective


class PrescriptionDirective(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    description_generale: str

    prescription_order_id: uuid.UUID = Field(foreign_key="prescription_order.id")
    prescription_order: "PrescriptionOrder" = Relationship(back_populates="directives")

    type_directive: TypeDirective

    __mapper_args__ = {
        "polymorphic_on": "type_directive",
        "polymorphic_identity": "directive_base"
    }
