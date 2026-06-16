import uuid
from sqlmodel import SQLModel,Field, Relationship
from typing import Optional
from datetime import date

class UrgenceAuth(Authorizations, table = True ):
    id: Optional[uuid.UUID] = Field(default = None, foreign_key = "authorizations.id", primary_key = True )
    granted_by : Optional[uuid.UUID] = Field(default = None )

    __mapper_args__ = {
        "polymorphic_identity": "urgenceauth",
    }