from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, engine, Session
from app.seed_examination_references import EXAM_REFERENCES
from app.seed_vaccine_references import VACCINE_REFERENCES
from app.models.examination_reference import ExaminationReference
from app.models.vaccine_reference import VaccineReference
from sqlmodel import select, func
from app.routers.patient import router as patient_router
from app.routers.practitioner import router as practitioner_router
from app.routers.organization import router as organization_router
from app.routers.references import router as references_router
from app.routers.internal import router as internal_router

app = FastAPI(
    title="Medical Service",
    description="Microservice de gestion des données médicales",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    _seed_reference_tables()


def _seed_reference_tables():
    with Session(engine) as session:
        existing_exams = session.exec(
            select(func.count()).select_from(ExaminationReference)
        ).one()
        if existing_exams == 0:
            for code, libelle, nature in EXAM_REFERENCES:
                session.add(ExaminationReference(code=code, libelle=libelle, nature=nature))
            session.commit()
            print(f"[seed] {len(EXAM_REFERENCES)} références d'examens insérées.")
        else:
            print(f"[seed] Table examinationreference déjà peuplée ({existing_exams} entrées).")

        existing_vaccines = session.exec(
            select(func.count()).select_from(VaccineReference)
        ).one()
        if existing_vaccines == 0:
            for code_cvx, libelle in VACCINE_REFERENCES:
                session.add(VaccineReference(code_cvx=code_cvx, libelle=libelle))
            session.commit()
            print(f"[seed] {len(VACCINE_REFERENCES)} références de vaccins insérées.")
        else:
            print(f"[seed] Table vaccinereference déjà peuplée ({existing_vaccines} entrées).")


app.include_router(patient_router)
app.include_router(practitioner_router)
app.include_router(organization_router)
app.include_router(references_router)
app.include_router(internal_router)


@app.get("/")
async def read_root():
    return {
        "status": "online",
        "service": "medical-management",
        "message": "Le microservice médical est opérationnel.",
    }
