import uuid
from sqlmodel import SQLModel,Field, Relationship
from typing import Optional
from datetime import date

class NormalAuth(Authorizations, table = True ):
    id: Optional[uuid.UUID] = Field(default = None, foreign_key = "authorizations.id", primary_key = True )

    __mapper_args__ = {
        "polymorphic_identity": "normalauth",
    }