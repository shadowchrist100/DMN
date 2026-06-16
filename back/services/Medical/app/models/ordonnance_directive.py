import uuid
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from app.types.enums import TypeDirective


class OrdonnanceDirective(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    description_generale: str # Description de la consigne textuelle
    
    ordonnance_id: uuid.UUID = Field(foreign_key="ordonnance.id")
    ordonnance: Ordonnance = Relationship(back_populates="directives")

    type_directive: TypeDirective

    __mapper_args__ = {
        "polymorphic_on": "type_directive",
        "polymorphic_identity": "directive_base"
    }