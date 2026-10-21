#!/bin/bash
DB="puzzle.sqlite"

for file in ./puzzles/*.csv; do
  sqlite3 "$DB" <<SQL
.mode csv
.import "$file" temp
SQL
done

sqlite3 "$DB" <<'SQL'
INSERT OR IGNORE INTO puzzle (id, pgn)
SELECT NULL, pgn FROM temp;

DROP TABLE temp;
SQL


