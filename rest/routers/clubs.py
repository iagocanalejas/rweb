from db import get_db
from fastapi import APIRouter, Depends
from models.clubs import get_clubs_filtered

router = APIRouter()


@router.get("/")
async def api_get_clubs(query: str, db=Depends(get_db)):
    return get_clubs_filtered(db, query)
