from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, applications, companies, listings, me

app = FastAPI(title="SkillsBox API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(me.router, prefix="/api/v1")
app.include_router(companies.router, prefix="/api/v1")
app.include_router(listings.router, prefix="/api/v1")
app.include_router(applications.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/")
def health() -> dict:
    return {"status": "ok"}
