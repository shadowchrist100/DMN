import uuid
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import date


class Patient(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    user_id: str = Field(unique=True, index=True)
    emergency_contacts: List["EmergencyContact"] = Relationship(
        back_populates="patients",
        link_model = RelatedPerson
    )

    # relations
    dmn:Optional["DMN"] = Relationship(
        back_populates = "patient" ,
        sa_relationship_kwargs={'uselist': False}
    )


from app.models.emergency_contact import EmergencyContact
