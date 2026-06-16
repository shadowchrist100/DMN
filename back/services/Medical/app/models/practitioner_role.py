import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import date

if TYPE_CHECKING:
    from .healthcare_system import HealthcareSystem
    from .practitioner import Practitioner


class PractitionerRole(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    practitioner_id: Optional[uuid.UUID] = Field(default=None, foreign_key="practitioner.id")
    health_care_system_id: Optional[uuid.UUID] = Field(default=None, foreign_key="healthcaresystem.id")
    role: str
    start_date: date
    end_date: date

    practitioner: "Practitioner" = Relationship(back_populates="roles")
    health_care_system: "HealthcareSystem" = Relationship(back_populates="roles")
