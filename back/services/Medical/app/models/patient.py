import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from .patient_relative import PatientRelative

if TYPE_CHECKING:
    from .relative import Relative
    from .dmn import DMN


class Patient(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    user_id: str = Field(unique=True, index=True)
    relatives: List["Relative"] = Relationship(
        back_populates="patients",
        link_model=PatientRelative
    )

    dmn: Optional["DMN"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={'uselist': False}
    )
