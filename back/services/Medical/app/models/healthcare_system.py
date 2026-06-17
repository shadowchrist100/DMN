import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
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
    is_actif: bool
    verification_status: StatutVerification

    roles: List["PractitionerRole"] = Relationship(back_populates="health_care_system")
