import uuid
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import date


class Patient(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    user_id: str = Field(unique=True, index=True)
    death_date: Optional[date] = None
    multiple_birth: Optional[bool] = None

    emergency_contacts: list["EmergencyContact"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


from app.models.emergency_contact import EmergencyContact
