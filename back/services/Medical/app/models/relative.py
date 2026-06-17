import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from app.models.patient_relative import PatientRelative

if TYPE_CHECKING:
    from .patient import Patient
    from .authorization import Authorization


class Relative(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: str

    authorization_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="authorization.id"
    )

    patients: List["Patient"] = Relationship(
        back_populates="relatives",
        link_model=PatientRelative
    )
    authorization: Optional["Authorization"] = Relationship(
        back_populates="relatives"
    )
