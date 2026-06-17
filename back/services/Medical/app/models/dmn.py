import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from app.models.medical_act import MedicalAct

if TYPE_CHECKING:
    from .patient import Patient
    from .practitioner import Practitioner
    from .authorization import Authorization

    from .consultation import Consultation
    from .allergy import Allergy
    from .vaccination import Vaccination
    from .relative import Relative


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
    medical_acts: List["MedicalAct"] = Relationship(back_populates="dmn")

    practitioner_roles : List["PractitionerRole"] = Relationship(back_populates= "dmns", link_model= MedicalAct )
