import uuid
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from app.models.authorization import Authorization


class EmergencyAuthorization(Authorization, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="authorization.id", primary_key=True)
    granted_by: Optional[uuid.UUID] = Field(default=None)

    __mapper_args__ = {
        "polymorphic_identity": "emergency_authorization",
    }
