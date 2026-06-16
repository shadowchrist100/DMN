import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List


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
        link_model = RelatedPerson    
    )


from app.models.patient import Patient
