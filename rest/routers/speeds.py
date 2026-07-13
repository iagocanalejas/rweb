from db import get_db
from fastapi import APIRouter, Depends
from models.speeds import GetYearSpeedsByParams, get_nth_speed_filtered, get_year_speeds_filtered

router = APIRouter()


@router.get("/averages")
async def api_get_avg_speeds(
    league: int,
    gender: str = "MALE",
    category: str = "ABSOLUT",
    normalize: bool = False,
    db=Depends(get_db),
):
    return await get_year_speeds_filtered(
        db,
        GetYearSpeedsByParams(
            league_id=league,
            gender=gender,
            category=category,
            normalize=normalize,
        ),
    )


@router.get("/nth")
async def api_get_nth_speeds(
    index: int,
    league: int,
    gender: str = "MALE",
    category: str = "ABSOLUT",
    normalize: bool = False,
    db=Depends(get_db),
):
    return await get_nth_speed_filtered(
        db,
        index,
        GetYearSpeedsByParams(
            league_id=league,
            gender=gender,
            category=category,
            normalize=normalize,
        ),
    )
