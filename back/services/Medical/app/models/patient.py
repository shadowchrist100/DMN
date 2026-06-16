import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from app.models.related_person import RelatedPerson

if TYPE_CHECKING:
    from .emergency_contact import EmergencyContact
    from .dmn import DMN


class Patient(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    user_id: str = Field(unique=True, index=True)
    emergency_contacts: List["EmergencyContact"] = Relationship(
        back_populates="patients",
        link_model=RelatedPerson
    )

    dmn: Optional["DMN"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={'uselist': False}
    )
