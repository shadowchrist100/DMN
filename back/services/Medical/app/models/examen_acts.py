import uuid
from sqlmodel import SQLModel,Field, Relationship
from typing import Optional
from datetime import date

class ExamensActs(MedicalActs, table = True ):
    id: Optional[uuid.UUID] = Field(default = None, foreign_key = "medicalacts.id", primary_key = True )
    code_loinc: str
    libelle_examen: str
    type_examen: str
    value: str
    interpration: str
    image_path: Optional[str] = Field()

    __mapper_args__ = {
        "polymorphic_identity": "TypeActe.EXAMEN",
    }

