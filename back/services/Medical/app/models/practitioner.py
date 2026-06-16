import uuid
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional,List
from app.types.enums import Speciality


class Practitioner(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    user_id: str = Field(unique=True, index=True)
    speciality: Speciality
    order_number: Optional[str] = None
    authorizations: List["Authorizations"] = Relationship(back_populates="practitioner")
    roles: List["PractitionerRole"] = Relationship(back_populates="practitioner")
