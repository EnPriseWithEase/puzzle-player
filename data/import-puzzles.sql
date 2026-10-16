CREATE TEMP TABLE temp (pgn text);

.mode csv

-- .import ./puzzles/1001_chess_exercises_for_beginners.csv  temp
-- .import ./puzzles/tactic-ninja.csv                        temp
-- .import ./puzzles/bain.csv                                temp
-- .import ./puzzles/polgar_mate_in_one.csv                  temp
-- .import ./puzzles/polgar_mate_in_two.csv                  temp
-- .import ./puzzles/polgar_mate_in_three.csv                temp
-- .import ./puzzles/endgame.csv                             temp
.import ./puzzles/classical-games.csv                     temp


INSERT INTO puzzle select null, pgn from temp;

INSERT OR IGNORE INTO puzzle (id, pgn)
  SELECT NULL, pgn FROM temp;

DROP TABLE temp;


