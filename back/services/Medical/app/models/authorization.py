import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import date
from app.types.enums import Perimeter, Duration

if TYPE_CHECKING:
    from .dmn import DMN
    from .practitioner import Practitioner


class Authorization(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True
    )
    perimeter: Perimeter
    granted_at: date
    expire_at: date
    duration: Duration
    is_actif: bool
    is_urgence: bool

    dmn_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="dmn.id",
    )
    practitioner_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="practitioner.id",
    )

    authorization_type: str

    __mapper_args__ = {
        "polymorphic_on": "authorization_type",
        "polymorphic_identity": "authorization_base"
    }

    dmn: "DMN" = Relationship(back_populates="authorizations")
    practitioner: "Practitioner" = Relationship(back_populates="authorizations")
