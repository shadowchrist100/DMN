from fastapi import FastAPI
from app.database import init_db
from app.routers.medical import router as medical_router

app = FastAPI(
    title="Medical Service",
    description="Microservice de gestion des données médicales",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(medical_router)


@app.get("/")
async def read_root():
    return {
        "status": "online",
        "service": "medical-management",
        "message": "Le microservice médical est opérationnel.",
    }
