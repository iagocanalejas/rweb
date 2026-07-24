import logging
from dataclasses import dataclass
from typing import Any, Self

from psycopg2.extensions import connection as Connection
from psycopg2.extras import RealDictCursor, RealDictRow

from models._utils import DatabaseQueryError

logger = logging.getLogger("rweb")


@dataclass
class League:
    id: int
    name: str
    symbol: str
    gender: str
    category: str
    participants: dict[int, int]

    @classmethod
    def from_row(cls, row: RealDictRow) -> Self:
        return cls(
            id=row["id"],
            name=row["name"],
            symbol=row["symbol"],
            gender=row["gender"],
            category=row["category"],
            participants={},
        )

    @classmethod
    def from_dict(cls, **kwargs) -> Self:
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "symbol": self.symbol,
            "gender": self.gender,
            "category": self.category,
            "participants": self.participants,
        }


async def get_leagues(db: Connection) -> list[dict[str, Any]]:
    raw_query = """
        SELECT id, name, symbol, gender, category FROM league WHERE parent_id IS NOT NULL ORDER BY id;
    """

    logger.debug("Executing query:")
    logger.debug(raw_query)

    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            cursor.execute(raw_query)
            rows = cursor.fetchall()
        except Exception as e:
            logger.exception("Failed executing query on league table.")
            raise DatabaseQueryError("Error fetching leagues") from e

        leagues = [League.from_row(row).to_dict() for row in rows]

    yearly_league_participants = await get_yearly_league_participants(db)
    for league in leagues:
        league["participants"] = yearly_league_participants.get(league["id"], {})

    return leagues


async def get_yearly_league_participants(db: Connection) -> dict[int, dict[int, int]]:
    raw_query = """
        WITH participants_query AS (
            SELECT
                r.league_id,
                EXTRACT(YEAR FROM r.date)::INTEGER AS year,
                COUNT(p.id) AS participants
            FROM race r
            JOIN participant p ON r.id = p.race_id
            WHERE r.league_id IS NOT NULL
            GROUP BY r.id, r.league_id, r.date
        )
        SELECT
            league_id,
            year,
            MAX(participants) AS max_participants
        FROM participants_query
        GROUP BY league_id, year
        ORDER BY league_id, year;
    """

    logger.debug("Executing query:")
    logger.debug(raw_query)

    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            cursor.execute(raw_query)
            rows = cursor.fetchall()
        except Exception as e:
            logger.exception("Failed executing query on league table.")
            raise DatabaseQueryError("Error fetching league participants") from e

        yearly_league_participants = {}
        for row in rows:
            if row["league_id"] not in yearly_league_participants:
                yearly_league_participants[row["league_id"]] = {}
            yearly_league_participants[row["league_id"]][row["year"]] = row["max_participants"]

    return yearly_league_participants
