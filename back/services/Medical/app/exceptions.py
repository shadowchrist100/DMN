from fastapi import HTTPException


def conflict(detail: str = "Ressource déjà existante"):
    raise HTTPException(status_code=409, detail=detail)


def not_found(detail: str = "Ressource introuvable"):
    raise HTTPException(status_code=404, detail=detail)


def bad_request(detail: str = "Requête invalide"):
    raise HTTPException(status_code=400, detail=detail)
