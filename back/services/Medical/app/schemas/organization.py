from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreateOrganizationReq(BaseModel):
    name: str
    type: str
    city: str
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    created_by: str


class UpdateOrganizationReq(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class ValidateOrganizationReq(BaseModel):
    status: str  # "active" | "suspended"
    validated_by: Optional[str] = None


class OrganizationResp(BaseModel):
    id: str
    name: str
    type: str
    city: str
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    is_actif: bool
    verification_status: str
    created_by: str
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
