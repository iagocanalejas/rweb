import logging
from dataclasses import dataclass
from typing import Any, Self

from psycopg2.extensions import connection as Connection
from psycopg2.extras import RealDictCursor, RealDictRow

from models._utils import DatabaseQueryError

logger = logging.getLogger("rweb")


@dataclass
class Club:
    id: int
    name: str

    @classmethod
    def from_row(cls, row: RealDictRow) -> Self:
        return cls(
            id=row["id"],
            name=row["name"],
        )

    @classmethod
    def from_dict(cls, **kwargs) -> Self:
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
        }


def get_clubs_filtered(db: Connection, query: str) -> list[dict[str, Any]]:
    raw_query = """
        SELECT id, name FROM entity WHERE type = 'CLUB' AND is_active
        AND (
            unaccent(%(query)s) = ANY(known_names)
            OR normalized_name ILIKE '%%' || unaccent(%(query)s) || '%%'
            OR name ILIKE '%%' || unaccent(%(query)s) || '%%'
        );
    """

    logger.debug("Executing query:")
    logger.debug(raw_query)

    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            cursor.execute(raw_query, {"query": query.upper()})
            rows = cursor.fetchall()
        except Exception as e:
            logger.exception("Failed executing query on entity table.")
            raise DatabaseQueryError(f"Error searching clubs with query='{query}'") from e

        return [Club.from_row(row).to_dict() for row in rows]
