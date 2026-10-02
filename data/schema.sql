CREATE TABLE deck (
  id            integer PRIMARY KEY NOT NULL,
  name          text NOT NULL UNIQUE,
  folder        text,
  config        text
);

-- deck.config = {
--   puzzle_type:    "standard",           // standard, candidates
--   review_order:   "random",             // sequential, random
--   retain:         "incorrect",          // none, all, incorrect
-- }

CREATE TABLE review (
  id         integer PRIMARY KEY,
  puzzle     integer NOT NULL,
  type       text NOT NULL,
  inittime   integer NOT NULL,
  result     integer NOT NULL,
  numright   integer NOT NULL,
  numwrong   integer NOT NULL,
  elapsed    integer NOT NULL,
  attempts   text NOT NULL,

  FOREIGN KEY (puzzle) REFERENCES puzzle(id)
);

-- review.attempts = {
--   variation:  1. e4 e5 2. Nc3    // variation
--   correct:    false,             // true, false
--   elapsed:    0,                 // now - inittime in milliseconds
-- }

CREATE TABLE puzzle (
  id       integer PRIMARY KEY,
  pgn      text NOT NULL UNIQUE
);

CREATE TABLE deck_puzzle (
  deck   integer NOT NULL,
  puzzle integer NOT NULL,
  config text,

  PRIMARY KEY (deck, puzzle),
  FOREIGN KEY (puzzle) REFERENCES puzzle(id),
  FOREIGN KEY (deck)   REFERENCES deck(id)
);

-- deck_puzzle.config {
--   status: unreviewed,             // unreviewed, reviewed, suspended
-- }

