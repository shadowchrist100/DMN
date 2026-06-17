import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from app.types.enums import TypeActe

if TYPE_CHECKING:
    from .dmn import DMN
    from .practitioner_role import PractitionerRole
    from .diagnosis import Diagnosis
    from .prescription_order import PrescriptionOrder
    from .vital_constant import VitalConstant


class MedicalAct(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    raisons: Optional[str] = None
    rapport_text: Optional[str] = None
    observations_text: Optional[str] = None

    dmn_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="dmn.id",
    )
    practitioner_role_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="practitionerrole.id",
    )
    type_acte: TypeActe = Field(sa_column_kwargs={"name": "type"})

    __mapper_args__ = {
        "polymorphic_on": "type_acte",
        "polymorphic_identity": "medical_act_base"
    }

    dmn: "DMN" = Relationship(back_populates="medical_acts")
    practitioner_role: "PractitionerRole" = Relationship(back_populates="medical_acts")

    diagnoses: List["Diagnosis"] = Relationship(back_populates="medical_act")

    prescription_order: Optional["PrescriptionOrder"] = Relationship(
        back_populates="medical_act",
        sa_relationship_kwargs={'uselist': False}
    )

    vital_constants: List["VitalConstant"] = Relationship(back_populates="medical_act")
