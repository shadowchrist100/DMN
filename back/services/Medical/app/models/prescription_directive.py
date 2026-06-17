import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Column, UUID, String, ForeignKey
from sqlalchemy.orm import relationship
from app.base import Base


class PrescriptionDirective(Base):
    __tablename__ = "prescriptiondirective"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    description_generale = Column(String, nullable=False)
    prescription_order_id = Column(UUID, ForeignKey("prescriptionorder.id"), nullable=False)
    type_directive = Column("type", String, nullable=False)

    __mapper_args__ = {
        "polymorphic_on": "type_directive",
        "polymorphic_identity": "directive_base"
    }

    prescription_order = relationship("PrescriptionOrder", back_populates="directives")
