import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Column, UUID, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.base import Base


class MedicalAct(Base):
    __tablename__ = "medicalact"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    raisons = Column(Text, nullable=True)
    rapport_text = Column(Text, nullable=True)
    observations_text = Column(Text, nullable=True)
    dmn_id = Column(UUID, ForeignKey("dmn.id"), nullable=True)
    practitioner_role_id = Column(UUID, ForeignKey("practitionerrole.id"), nullable=True)
    care_episode_id = Column(UUID, ForeignKey("careepisode.id"), nullable=True)
    type_acte = Column(String, nullable=False)

    __mapper_args__ = {
        "polymorphic_on": "type_acte",
        "polymorphic_identity": "medical_act_base"
    }

    dmn = relationship("DMN", back_populates="medical_acts")
    practitioner_role = relationship("PractitionerRole", back_populates="medical_acts")
    care_episode = relationship("CareEpisode", back_populates="medical_acts")
    diagnoses = relationship("Diagnosis", back_populates="medical_act")
    prescription_order = relationship("PrescriptionOrder", back_populates="medical_act", uselist=False)
    vital_constants = relationship("VitalConstant", back_populates="medical_act")
    prescriptions_examens = relationship("PrescriptionExamen", back_populates="medical_act")
