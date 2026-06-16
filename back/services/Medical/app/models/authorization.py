import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from datetime import date
from app.types.enums import Perimeter, Duration

if TYPE_CHECKING:
    from .dmn import DMN
    from .practitioner import Practitioner
    from .emergency_contact import EmergencyContact


class Authorization(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    perimeter: Perimeter
    granted_at: date
    expire_at: date
    duration: Duration
    is_actif: bool
    is_urgence: bool
    authorization_type: str
    granted_by: Optional[uuid.UUID] = None

    dmn_id: Optional[uuid.UUID] = Field(default=None, foreign_key="dmn.id")
    practitioner_id: Optional[uuid.UUID] = Field(default=None, foreign_key="practitioner.id")

    dmn: "DMN" = Relationship(back_populates="authorizations")
    practitioner: "Practitioner" = Relationship(back_populates="authorizations")
    emergency_contacts: List["EmergencyContact"] = Relationship(back_populates="authorization")
