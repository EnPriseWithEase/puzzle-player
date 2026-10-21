#!/bin/bash
DB="puzzle.sqlite"


sqlite3 "$DB" <<'SQL'
  DROP TABLE IF EXISTS temp;
  CREATE TABLE temp (pgn TEXT);
SQL

for file in ./puzzles/*.csv; do
  echo $file
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


