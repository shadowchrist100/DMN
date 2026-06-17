import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

if TYPE_CHECKING:
    from .medical_act import MedicalAct
    from .prescription_directive import PrescriptionDirective


class PrescriptionOrder(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    date_emission: datetime = Field(default_factory=datetime.now)
    statut: str = Field(default="active")

    medical_act_id: uuid.UUID = Field(foreign_key="medicalact.id", unique=True)
    medical_act: "MedicalAct" = Relationship(back_populates="prescription_order")

    directives: List["PrescriptionDirective"] = Relationship(back_populates="prescription_order")
