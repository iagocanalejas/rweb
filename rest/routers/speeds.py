from db import get_db
from fastapi import APIRouter, Depends
from models.speeds import GetYearSpeedsByParams, get_nth_speed_filtered, get_year_speeds_filtered

router = APIRouter()


@router.get("/averages")
async def api_get_avg_speeds(
    league: int | None = None,
    club: int | None = None,
    gender: str = "MALE",
    category: str = "ABSOLUT",
    only_league_races: bool = False,
    normalize: bool = False,
    db=Depends(get_db),
):
    assert league is not None or club is not None, "Either league or club must be specified"
    assert sum(x is not None for x in [league, club]) == 1, "Only one of league or club can be specified"
    return get_year_speeds_filtered(
        db,
        GetYearSpeedsByParams(
            league_id=league,
            club_id=club,
            gender=gender,
            category=category,
            only_league_races=only_league_races,
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
    return get_nth_speed_filtered(
        db,
        index,
        GetYearSpeedsByParams(
            league_id=league,
            gender=gender,
            category=category,
            normalize=normalize,
        ),
    )
