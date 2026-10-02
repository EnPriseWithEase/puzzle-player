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
       COUNT(deck_puzzle.puzzle) AS total_puzzles,
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
    { jsonColumns: ["attempts"] }
  );
}

export function updateDeckPuzzleStatus(deckId, puzzleId, status) {
  return dbUpdate(
    "deck_puzzle",
    {
      config: {
        status,
      },
    },
    {
      deck: deckId,
      puzzle: puzzleId,
    },
    {
      jsonColumns: ["config"],
    }
  );
}

export function resetDeck(deckId) {
  return dbRun(
    `UPDATE deck_puzzle
     SET config = ?
     WHERE deck = ?
       AND json_extract(config, '$.status') = 'reviewed'`,
    [
      JSON.stringify({ status: "unreviewed" }),
      deckId,
    ]
  );
}

/*
export async function resetDeck(deckId) {
  const rows = await dbQuery(
    `SELECT
       deck,
       puzzle,
       config
     FROM deck_puzzle
     WHERE deck = ?`,
    {
      params: [deckId],
      jsonColumns: ["config"],
    }
  );

  for (const row of rows) {
    const status = row.config?.status ?? "unreviewed";

    if (status === "reviewed") {
      await updateDeckPuzzleStatus(
        row.deck,
        row.puzzle,
        "unreviewed"
      );
    }
  }
}
*/


