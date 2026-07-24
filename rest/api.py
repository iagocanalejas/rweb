import os

from db import get_db
from fastapi import Depends, FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from models.leagues import get_leagues
from routers import clubs, speeds

app = FastAPI()

app.include_router(speeds.router, prefix="/speeds", tags=["stats"])
app.include_router(clubs.router, prefix="/clubs", tags=["clubs"])

cors_origins = [""]
if os.getenv("DEBUG", False) == "True":
    cors_origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS", "HEAD"],
    allow_headers=["*"],
)


@app.get("/leagues")
async def api_get_leagues(db=Depends(get_db)):
    return await get_leagues(db)


@app.head("/healthz")
async def health_check():
    return Response(status_code=200)
