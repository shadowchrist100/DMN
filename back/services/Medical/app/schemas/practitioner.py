from pydantic import BaseModel, Field
from typing import Optional
from app.types.enums import Speciality


class CreatePractitionerReq(BaseModel):
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialty: Speciality
    order_number: Optional[str] = Field(default=None, pattern=r'^\d{10}$')
    organization_id: Optional[str] = None


class PractitionerResp(BaseModel):
    id: str
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    speciality: str
    order_number: Optional[str] = None
    organization_id: Optional[str] = None
