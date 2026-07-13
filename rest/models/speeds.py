import logging
from collections import defaultdict
from dataclasses import dataclass, field

from psycopg2.extensions import connection as Connection
from psycopg2.extras import RealDictCursor

logger = logging.getLogger("rweb")


@dataclass
class GetYearSpeedsByParams:
    club_id: int | None = None
    league_id: int | None = None
    flag_id: int | None = None
    gender: str = "MALE"
    category: str = "ABSOLUT"
    day: int | None = None
    years: list[int] = field(default_factory=list)
    branch_teams: bool = False
    only_league_races: bool = False
    normalize: bool = False


async def get_year_speeds_filtered(
    db: Connection,
    params: GetYearSpeedsByParams,
) -> dict[int, list[float]]:
    subquery_where = _get_speeds_filter(params)

    speed_expression = "(p.distance / (extract(EPOCH FROM p.laps[cardinality(p.laps)]))) * 3.6"

    where_clause = ""
    if params.years:
        # Convert python int list into a comma-separated string e.g., "2023, 2024"
        years_str = ", ".join(map(str, params.years))
        where_clause = f"WHERE year in ({years_str})"

    if params.normalize:
        normalize_clause = """
            speed BETWEEN
            (
                SELECT AVG(speed) - (2 * STDDEV_POP(speed))
                FROM speeds_query
            )
            AND
            (
                SELECT AVG(speed) + (2 * STDDEV_POP(speed))
                FROM speeds_query
            )
        """
        if where_clause:
            where_clause = f"{where_clause} AND {normalize_clause}"
        else:
            where_clause = f"WHERE {normalize_clause}"

    raw_query = f"""
        WITH speeds_query AS (
            SELECT
                extract(YEAR from date)::INTEGER as year,
                CAST({speed_expression} AS DOUBLE PRECISION) as speed
            FROM participant p JOIN race r ON p.race_id = r.id
            WHERE {subquery_where}
            ORDER BY r.date, speed DESC
        )
        SELECT year, array_agg(speed) AS speeds
        FROM speeds_query
        {where_clause}
        GROUP BY year
        ORDER BY year;
    """

    logger.debug("Executing query:")
    logger.debug(raw_query)

    speeds: dict[int, list[float]] = {}

    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            cursor.execute(raw_query)
            rows = cursor.fetchall()
        except Exception as e:
            raise AssertionError(f"failed to execute query={raw_query}") from e

        for row in rows:
            speeds[row["year"]] = row["speeds"]

    return speeds


async def get_nth_speed_filtered(
    db: Connection,
    index: int,
    params: GetYearSpeedsByParams,
) -> dict[int, list[float]]:
    assert index > 0, f"invalid {index=}"

    subquery_where = _get_speeds_filter(params)
    if params.years:
        # Convert python int list into a comma-separated string e.g., "2023, 2024"
        years_str = ", ".join(map(str, params.years))
        where_clause = f" AND extract(YEAR FROM r.date) in ({years_str})"

    speed_expression = "(p.distance / (extract(EPOCH FROM p.laps[cardinality(p.laps)]))) * 3.6"

    where_clause = ""
    if params.normalize:
        where_clause = """
            WHERE speed BETWEEN (
                SELECT AVG(speed) - (2 * STDDEV_POP(speed))
                FROM speeds_query
            ) AND (
                SELECT AVG(speed) + (2 * STDDEV_POP(speed))
                FROM speeds_query
            )
        """

    raw_query = f"""
        WITH speeds_query AS (
            SELECT
                p.race_id,
                extract(YEAR from date)::INTEGER as year,
                CAST({speed_expression} AS DOUBLE PRECISION) as speed
            FROM participant p JOIN race r ON p.race_id = r.id
            WHERE {subquery_where}
            ORDER BY r.date
        )
        SELECT race_id, year, (array_agg(speed ORDER BY speed DESC))[{index}] AS speed
        FROM speeds_query
        {where_clause}
        GROUP BY race_id, year
        HAVING array_length(array_agg(speed), 1) >= {index};
    """

    logger.debug("Executing query:")
    logger.debug(raw_query)

    speeds: dict[int, list[float]] = defaultdict(list)

    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            cursor.execute(raw_query)
            rows = cursor.fetchall()
        except Exception as e:
            raise AssertionError(f"failed to execute query={raw_query}") from e

        for row in rows:
            speeds[row["year"]].append(row["speed"])

    return speeds


def _get_speeds_filter(params: GetYearSpeedsByParams) -> str:
    assert params.gender and params.gender in ["MALE", "FEMALE"], "invalid gender"
    assert params.category and params.category in ["ABSOLUT", "VETERAN"], "invalid category"
    assert params.day is None or params.day in (1, 2), f"invalid {params.day=}"
    assert params.league_id is None or params.league_id > 0, f"invalid {params.league_id=}"

    # Gender filter
    if params.only_league_races or params.league_id is not None:
        gender_filter = f"(p.gender = '{params.gender}' AND r.gender = '{params.gender}')"
    else:
        gender_filter = f"(p.gender = '{params.gender}' AND (r.gender = '{params.gender}' OR r.gender = 'ALL'))"

    # Category filter
    if params.only_league_races or params.league_id is not None:
        category_filter = f"(p.category = '{params.category}' AND r.category = '{params.category}')"
    else:
        category_filter = (
            f"(p.category = '{params.category}' AND (r.category = '{params.category}' OR r.category = 'ALL'))"
        )

    # Base filters
    filters = [
        "NOT r.cancelled",
        "p.laps <> '{}'",
        "NOT p.retired",
        "NOT p.guest",
        "NOT p.absent",
        "p.distance IS NOT NULL",
        "(extract(EPOCH FROM p.laps[cardinality(p.laps)])) > 0",  # avoid division by zero
        "NOT EXISTS(SELECT * FROM penalty WHERE participant_id = p.id AND disqualification)",  # avoid disqualifications
        gender_filter,
        category_filter,
    ]

    if params.normalize:
        filters.append("NOT r.has_weird_speeds")

    # Conditional filters
    if params.day is not None:
        filters.append(f"r.day = {params.day}")

    if params.branch_teams:
        filters.append("EXISTS(SELECT 1 FROM unnest(p.club_names) AS club_name WHERE club_name LIKE '% B')")
    elif params.league_id is not None and params.flag_id is not None:
        filters.append(
            "(p.club_names = '{}' "
            + "OR NOT EXISTS(SELECT 1 FROM unnest(p.club_names) AS club_name WHERE club_name LIKE '% B'))"
        )

    if params.only_league_races:
        filters.append("r.league_id IS NOT NULL")

    if params.club_id is not None:
        filters.append(f"p.club_id = {params.club_id}")
    if params.league_id is not None:
        filters.append(f"r.league_id = {params.league_id}")
    if params.flag_id is not None:
        filters.append(f"r.flag_id = {params.flag_id}")

    return " AND ".join(filters)
