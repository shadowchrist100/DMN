import uuid
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
from app.types.enums import Speciality

if TYPE_CHECKING:
    from .authorization import Authorization
    from .practitioner_role import PractitionerRole


class Practitioner(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    user_id: str = Field(unique=True, index=True)
    first_name: Optional[str] = Field(default=None)
    last_name: Optional[str] = Field(default=None)
    speciality: Speciality
    order_number: Optional[str] = None
    organization_id: Optional[str] = None
    authorizations: List["Authorization"] = Relationship(back_populates="practitioner")
    roles: List["PractitionerRole"] = Relationship(back_populates="practitioner")
