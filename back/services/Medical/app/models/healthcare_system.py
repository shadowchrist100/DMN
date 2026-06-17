import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime
from app.types.enums import StatutVerification

if TYPE_CHECKING:
    from .practitioner_role import PractitionerRole


class HealthcareSystem(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    type: str
    nom: str
    alias: str
    city: str
    address: str
    phone: str
    email: str
    is_actif: bool = True
    verification_status: StatutVerification = StatutVerification.EN_ATTENTE
    created_by: str = Field(index=True)
    validated_by: Optional[str] = Field(default=None)
    validated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(), nullable=True)
    )
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(), default=datetime.now)
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(), default=datetime.now, onupdate=datetime.now)
    )

    roles: List["PractitionerRole"] = Relationship(back_populates="health_care_system")
