from fastapi import FastAPI
from app.database import init_db
from app.routers.patient import router as patient_router
from app.routers.practitioner import router as practitioner_router
from app.routers.organization import router as organization_router

app = FastAPI(
    title="Medical Service",
    description="Microservice de gestion des données médicales",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(patient_router)
app.include_router(practitioner_router)
app.include_router(organization_router)


@app.get("/")
async def read_root():
    return {
        "status": "online",
        "service": "medical-management",
        "message": "Le microservice médical est opérationnel.",
    }
