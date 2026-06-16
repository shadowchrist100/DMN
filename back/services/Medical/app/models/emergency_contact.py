import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from app.models.related_person import RelatedPerson

if TYPE_CHECKING:
    from .patient import Patient
    from .authorization import Authorization


class EmergencyContact(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: str

    authorization_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="authorization.id"
    )

    patients: List["Patient"] = Relationship(
        back_populates="emergency_contacts",
        link_model=RelatedPerson
    )
    authorization: Optional["Authorization"] = Relationship(
        back_populates="emergency_contacts"
    )
