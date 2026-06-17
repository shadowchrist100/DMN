from fastapi import HTTPException

from app.auth import CurrentUser

ADMIN_ROLES = ("admin", "admin_medical")


def check_owner(user_id: str, current_user: CurrentUser) -> None:
    if user_id != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Accès non autorisé à ces données")
