import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router as api_router


app = FastAPI(title="Washu API", version="0.2.0")

CORS_ALLOWED_ORIGINS_ENV = os.getenv("CORS_ALLOWED_ORIGINS") or os.getenv("CORS_ORIGINS")
DEV_SERVER_ORIGIN = os.getenv("DEV_SERVER_ORIGIN")
default_origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173", "http://127.0.0.1:4173"}


def _parse_origins(raw: str) -> set[str]:
    parts = raw.replace(";", ",").split(",")
    return {origin.strip() for origin in parts if origin.strip()}


if CORS_ALLOWED_ORIGINS_ENV:
    default_origins |= _parse_origins(CORS_ALLOWED_ORIGINS_ENV)

if DEV_SERVER_ORIGIN:
    default_origins.add(DEV_SERVER_ORIGIN.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(default_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(api_router)
