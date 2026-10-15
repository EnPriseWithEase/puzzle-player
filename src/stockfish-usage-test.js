import { createStockfish } from "./stockfish.js";

const engine = createStockfish({
  workerPath: "/assets/stockfish/stockfish-19-lite-single.js",
  engineOptions: {
    "Threads": 1,
    "Hash": 32,
  },
});

try {
  await engine.init();
  console.log("Stockfish ready");

  const fen =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const result = await engine.search(fen, {
    depth: 10,
  });

  console.log("Best move:", result.bestMove);
  console.log("Evaluation:", result.evaluation);
} catch (error) {
  console.error("Stockfish test failed:", error);
}

