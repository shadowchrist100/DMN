import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

if TYPE_CHECKING:
    from .patient import Patient
    from .practitioner import Practitioner
    from .authorization import Authorization
    from .consent import Consent
    from .consultation import Consultation
    from .prescription import Prescription
    from .allergy import Allergy
    from .disease import Disease
    from .vaccination import Vaccination
    from .emergency_contact import EmergencyContact


class DMN(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    date_creation: datetime = Field(default_factory=datetime.now)
    blood_type: Optional[str] = None
    rhesus_factor: Optional[str] = None

    patient_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="patient.id", unique=True
    )
    patient: Optional["Patient"] = Relationship(back_populates="dmn")

    authorizations: List["Authorization"] = Relationship(back_populates="dmn")
