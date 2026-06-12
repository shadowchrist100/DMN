from pydantic import BaseModel
from typing import Optional


class EmergencyContactReq(BaseModel):
    first_name: str
    last_name: str
    phone: str
    code_relation: str


class CreatePatientReq(BaseModel):
    user_id: str
    emergency_contact: Optional[EmergencyContactReq] = None


class EmergencyContactResp(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: str
    code_relation: str


class PatientResp(BaseModel):
    id: str
    user_id: str
    emergency_contacts: list[EmergencyContactResp]
