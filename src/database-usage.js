import { dbQuery, dbInsert, dbUpdate, dbRun } from "./database.js";

export function getDeckPuzzles(deckId) {
  return dbQuery(
    `SELECT
       puzzle.id,
       puzzle.pgn,
       deck_puzzle.config
     FROM deck_puzzle
     JOIN puzzle ON puzzle.id = deck_puzzle.puzzle
     WHERE deck_puzzle.deck = ?
       AND (
         json_extract(deck_puzzle.config, '$.status') = 'unreviewed'
         OR deck_puzzle.config IS NULL
       )`,
    {
      params: [deckId],
      jsonColumns: ["config"],
    }
  );
}

export function getDecks() {
  return dbQuery(
    `SELECT
       deck.*,
       SUM(
          CASE
            WHEN json_extract(deck_puzzle.config, '$.status') != 'suspended'
            THEN 1
            ELSE 0
          END
        ) AS total_puzzles,
       SUM(
         CASE
           WHEN json_extract(deck_puzzle.config, '$.status') = 'unreviewed'
             OR deck_puzzle.config IS NULL
           THEN 1
           ELSE 0
         END
       ) AS unreviewed_puzzles
     FROM deck
     LEFT JOIN deck_puzzle
       ON deck_puzzle.deck = deck.id
     GROUP BY deck.id
     ORDER BY deck.name`,
    { jsonColumns: ["config"] }
  );
}

export function writeReview(review) {
  return dbInsert(
    "review",
    review,
    { jsonColumns: ["attempts","config"] }
  );
}

export function updateDeckPuzzleStatus(deckId, puzzleId, status) {
  return dbRun(
    `UPDATE deck_puzzle
     SET config = json_set(COALESCE(config, '{}'), '$.status', ?)
     WHERE deck = ?
       AND puzzle = ?`,
    [status, deckId, puzzleId]
  );
}

export function resetDeck(deckId) {
  return dbRun(
    `UPDATE deck_puzzle
     SET config = json_set(config, '$.status', 'unreviewed')
     WHERE deck = ?
       AND json_extract(config, '$.status') = 'reviewed'`,
    [deckId]
  );
}


// statistics
//

export function getDailyReviewCounts() {
  return dbQuery(`
    SELECT
      date(inittime / 1000, 'unixepoch', 'localtime') AS day,
      COUNT(*) AS count
    FROM review
    GROUP BY day
    ORDER BY day
  `);
}

export function getTodaysReviewStats() {
  return dbQuery(`
    SELECT
      COUNT(*) AS cards,
      COALESCE(SUM(elapsed), 0) AS elapsed,
      COALESCE(SUM(result), 0) AS correct
    FROM review
    WHERE date(inittime / 1000, 'unixepoch', 'localtime')
        = date('now', 'localtime')
  `);
}


