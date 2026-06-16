import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from app.models.related_person import RelatedPerson

if TYPE_CHECKING:
    from .patient import Patient


class EmergencyContact(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    first_name: str
    last_name: str
    email: str
    phone: str

    patients: List["Patient"] = Relationship(
        back_populates="emergency_contacts",
        link_model=RelatedPerson
    )
