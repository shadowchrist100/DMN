import uuid
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import date, datetime

class Medicament(SQLModel, table=True):
    code_medicament: str = Field(primary_key=True)
    nom_commercial: str
    dc_nom: str # Dénomination Commune Internationale