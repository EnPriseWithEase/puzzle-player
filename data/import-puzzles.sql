CREATE TEMP TABLE temp (pgn text);

.mode csv

.import puzzles-standard-tactics.csv         temp
.import puzzles-candidates-classical.csv     temp

INSERT INTO puzzle select null, pgn from temp;

INSERT OR IGNORE INTO puzzle (id, pgn)
  SELECT NULL, pgn FROM temp;

DROP TABLE temp;


