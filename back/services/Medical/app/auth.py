from fastapi import Header, HTTPException
from typing import Optional
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError

from app.config import settings

ALGORITHM = "HS256"


class CurrentUser:
    def __init__(self, id: str, role: str, email: str, status_account: str, **kwargs):
        self.id = id
        self.role = role
        self.email = email
        self.status_account = status_account
        self.first_name = kwargs.get("first_name", "")
        self.last_name = kwargs.get("last_name", "")
        self.phone = kwargs.get("phone", "")
        self.organization_id = kwargs.get("organization_id")


def verify_jwt(authorization: Optional[str] = Header(None)) -> CurrentUser:
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Format de token invalide")

    token = authorization.removeprefix("Bearer ")

    try:
        payload = jwt.decode(token, settings.api_secret, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

    user_id = payload.get("id") or payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide : identifiant manquant")

    return CurrentUser(
        id=user_id,
        role=payload.get("role", ""),
        email=payload.get("email", ""),
        status_account=payload.get("status_account", ""),
        first_name=payload.get("first_name", ""),
        last_name=payload.get("last_name", ""),
        phone=payload.get("phone", ""),
        organization_id=payload.get("organization_id"),
    )
