from pydantic import BaseModel
from typing import Optional


class RelativeReq(BaseModel):
    first_name: str
    last_name: str
    phone: str
    code_relation: str


class CreatePatientReq(BaseModel):
    user_id: str
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
    relatives: list[RelatedPersonResp]
