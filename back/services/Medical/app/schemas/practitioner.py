from pydantic import BaseModel
from typing import Optional
from app.types.enums import Speciality


class CreatePractitionerReq(BaseModel):
    user_id: str
    specialty: Speciality
    order_number: Optional[str] = None
    organization_id: Optional[str] = None


class PractitionerResp(BaseModel):
    id: str
    user_id: str
    speciality: str
    order_number: Optional[str] = None
    organization_id: Optional[str] = None
