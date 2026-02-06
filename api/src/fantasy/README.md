# Fantasy Module (Placeholder)

This folder is reserved for the upcoming Fantasy (Dunkest) integration.

## External Data Source
All fantasy endpoints proxy data from `https://www.dunkest.com/api` and do **not** match Euroleague DB schemas.
Key differences observed:
- Euroleague seasons use codes like `E2025` while Dunkest uses numeric `season_id` like `23`.
- Euroleague rounds are referred to as `rounds`; Dunkest uses `weeks` and sometimes `rounds` inside a week.

## Mapping Notes (Draft)
- `season_id` (Dunkest) -> derived from Euroleague season code (e.g., `E2025` -> `23`).
  - Proposed rule: `season_id = last two digits of end year` (for `E2025`, end year = 2025 -> 25) **OR**
    `season_id = (end year - 2002)` (for 2025 -> 23). Needs confirmation.
- Dunkest `week_number` roughly maps to Euroleague `round` groups. Needs explicit mapping table.
- Player and team IDs are **different** between Euroleague and Dunkest.
  - Proposed strategy: map by **name matching** (team name, player full name).
  - This requires a normalization step (case, accents, punctuation, common aliases).
  - We should maintain a manual override map for edge cases (e.g., multiple players with same name).
  - The mapping should be cached and refreshed periodically.

## Known Endpoints (Examples)
- `GET /api/stats/table?season_id=23&mode=nba&stats_type=avg&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&weeks[]=1`
- `GET /api/stats/defense-vs-position?season_id=23&stats_id=25&position_id=1`
- `GET /api/stats/dunkest/week/rounds?season_id=23&week_number=2`

## Local API (Draft)
- `GET /fantasy/season/E2025/players/stats?mode=nba&statsType=avg&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&weeks[]=1`
- `GET /fantasy/season/E2025/teams/pir-allowed?statsId=25&positionId=1`

## Stat ID Mapping (Dunkest)
- `statsId = 25` -> `PIR`

## Next Steps
- Confirm season_id mapping rule.
- Define week/round mapping table.
- Create DTOs and a new NestJS module when the mapping is finalized.
