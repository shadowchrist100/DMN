import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime


class VitalConstant(SQLModel, table=True):
    # Clé primaire composite pour matérialiser l'association
    medical_act_id: uuid.UUID = Field(
        foreign_key="medicalacts.id",
        primary_key=True
    )
    vital_constants_ref_code: str = Field(
        foreign_key="vitalsconstantsref.code",
        primary_key=True
    )
    
    date_mesure: datetime = Field(default_factory=datetime.now)
    
    # Correction : un float est préférable pour les calculs cliniques et graphiques
    valeur: float 

    # Relations de liaison vers les objets parents
    medical_act: MedicalActs = Relationship(back_populates="vital_constants")
    constant_ref: VitalsConstantsRef = Relationship(back_populates="mesures")