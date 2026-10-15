import { parse } from "@mliebelt/pgn-parser";

const pgnString = `
[Event "Endgame Sparring"]
[PuzzleType "engine"]
[PuzzleClass "endgame - pawn"] 
[FEN "8/5p2/8/6Pk/5P2/8/8/7K w - - 0 1"]
**
`;

try {
  const pgn = parse(pgnString, { startRule: "game" });
  console.dir(pgn, { depth: null });
} catch (error) {
  console.error("PGN parse error:", error);
  process.exitCode = 1;
}

