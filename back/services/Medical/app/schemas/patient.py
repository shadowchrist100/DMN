from pydantic import BaseModel
from typing import Optional


class RelativeReq(BaseModel):
    first_name: str
    last_name: str
    phone: str
    code_relation: str


class CreatePatientReq(BaseModel):
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    relative: Optional[RelativeReq] = None


class RelativeResp(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: str


class RelatedPersonResp(BaseModel):
    relative: RelativeResp
    code_relation: str


class PatientResp(BaseModel):
    id: str
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    relatives: list[RelatedPersonResp]


class RelativeUpdateReq(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    code_relation: Optional[str] = None
    email: Optional[str] = None
    emergency_contact: Optional[bool] = None


class PatientProfileUpdateReq(BaseModel):
    blood_type: Optional[str] = None
    rhesus_factor: Optional[str] = None


class PatientListResp(BaseModel):
    npi: str
    name: str
    initials: str
    age: int
    gender: str
    last_contact: Optional[str] = None
    priority: str = "low"
    is_critical: bool = False
    primary_diagnosis_code: Optional[str] = None
    primary_diagnosis_label: Optional[str] = None
    next_appointment_date: Optional[str] = None
    next_appointment_time: Optional[str] = None
    active_prescriptions: int = 0
