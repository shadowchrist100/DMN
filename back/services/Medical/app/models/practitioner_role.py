import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from datetime import date
from .medical_act import MedicalAct

if TYPE_CHECKING:
    from .healthcare_system import HealthcareSystem
    from .practitioner import Practitioner
    from .dmn import DMN


class PractitionerRole(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    practitioner_id: Optional[uuid.UUID] = Field(default=None, foreign_key="practitioner.id")
    health_care_system_id: Optional[uuid.UUID] = Field(default=None, foreign_key="healthcaresystem.id")
    role: str
    start_date: date
    end_date: Optional[date] = None

    practitioner: "Practitioner" = Relationship(back_populates="roles")
    health_care_system: "HealthcareSystem" = Relationship(back_populates="roles")

    dmns: List["DMN"] = Relationship(back_populates="practitioner_roles", link_model=MedicalAct)
