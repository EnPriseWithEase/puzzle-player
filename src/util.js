import { Chess, SQUARES } from "chess.js";

const promotion = document.getElementById("promotion");

export function handleClickMoveWithPromotion(chess, cg, dest, onMove) {

  console.log("CLICK MOVE SELECT", { dest, selected: cg.state.selected, });

  const orig = getUniqueOrigForDest(chess, dest);

  if (!orig) return;

  if (!isLegalMove(chess, orig, dest)) {
    console.log("CLICK MOVE: invalid move:", { orig, dest });
    return;
  }

  cg.move(orig, dest);
  handleMoveWithPromotion(chess, orig, dest, onMove);
}

export function isPromotion(chess, orig, dest) {
  const piece = chess.get(orig);

  if (!piece || piece.type !== "p") {
    return false;
  }

  return dest[1] === "1" || dest[1] === "8";
}

export function handleMoveWithPromotion(chess, orig, dest, onMove) {
  if (isPromotion(chess, orig, dest)) {
    showPromotionPopup(
      orig,
      dest,
      chess,
      promotion => onMove(orig, dest, promotion)
    );
  } else {
    onMove(orig, dest);
  }
}

export function showPromotionPopup(orig, dest, chess, onSelect) {
  const color = chess.get(orig).color;

  for (const piece of ["q", "r", "b", "n"]) {
    const button = promotion.querySelector(
      `[data-piece="${piece}"]`
    );

    const image = document.createElement("img");

    image.src =
      `assets/images/pieces/merida/${color}${piece.toUpperCase()}.svg`;

    button.replaceChildren(image);

    button.onclick = () => {
      hidePromotionPopup();
      onSelect(piece);
    };
  }

  promotion.classList.add("visible");
}

export function hidePromotionPopup() {
  promotion.classList.remove("visible");
}

export function legalDests(chess) {
  const dests = new Map();
  SQUARES.forEach((s) => {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length)
      dests.set(
        s,
        ms.map((m) => m.to),
      );
  });
  return dests;
}

export function isLegalMove(chess, orig, dest) {
  const legalMoves = chess.moves({ square: orig, verbose: true });
  return legalMoves.some(m => m.to === dest);
}

export function cgTurnColor(chess) {
  return chess.turn() === "w" ? "white" : "black";
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getUniqueOrigForDest(chess, dest) {
  const dests = legalDests(chess);
  const origins = [];

  for (const [orig, destinations] of dests.entries()) {
    if (destinations.includes(dest)) {
      origins.push(orig);
    }
  }

  return origins.length === 1 ? origins[0] : null;
}

export function createViewSolutionButton(callback, finish) {

  const button = document.createElement("button");

  button.type = "button";
  button.textContent = "View the solution";
  button.className = "continueBtn";

  button.addEventListener("click", () => {
    button.disabled = true;
    callback();
    button.remove();
    finish();
  });

  document.querySelector(".preboard-middle").appendChild(button);

  return button;
}


export function selectRandomLine(
  lines,
  threshold = 50,
  turn = "w"
) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return null;
  }

  // Convert White-relative evaluations to the perspective
  // of the side making the engine move.
  const sign =
    turn === "b" || turn === "black" ? -1 : 1;

  const candidates = lines
    .filter(line => line?.bestMove && line?.evaluation)
    .map(line => {
      const evaluation = line.evaluation;

      if (evaluation.mate != null) {
        return {
          line,
          isMate: true,
          score: evaluation.mate * sign,
        };
      }

      if (evaluation.cp != null) {
        return {
          line,
          isMate: false,
          score: evaluation.cp * sign,
        };
      }

      return null;
    })
    .filter(Boolean);

  if (candidates.length === 0) {
    return null;
  }

  // Find the best candidate from the engine's perspective.
  const best = candidates.reduce((a, b) =>
    b.score > a.score ? b : a
  );

  // If the best candidate is a forced mate,
  // don't randomly select centipawn alternatives.
  if (best.isMate) {
    return best.line;
  }

  const maxDifference = Math.max(
    0,
    Number.isFinite(Number(threshold))
      ? Number(threshold)
      : 50
  );

  // Only include centipawn candidates within the threshold.
  const eligible = candidates.filter(candidate =>
    !candidate.isMate &&
    best.score - candidate.score <= maxDifference
  );

  if (eligible.length === 0) {
    return best.line;
  }

  return eligible[
    Math.floor(Math.random() * eligible.length)
  ].line;
}


export function selectLongestDraw(lines, fen, turn = "w") {
  if (!Array.isArray(lines) || lines.length === 0) {
    return null;
  }

  const sign =
    turn === "b" || turn === "black" ? -1 : 1;

  const candidates = lines
    .filter(line => line?.bestMove && line?.evaluation)
    .map(line => {
      const evaluation = line.evaluation;

      if (evaluation.mate != null) {
        return {
          line,
          score: evaluation.mate * sign,
          isMate: true,
        };
      }

      if (evaluation.cp != null) {
        return {
          line,
          score: evaluation.cp * sign,
          isMate: false,
        };
      }

      return null;
    })
    .filter(Boolean);

  if (candidates.length === 0) {
    return null;
  }

  // Find the best line from the engine's perspective.
  const best = candidates.reduce((a, b) =>
    b.score > a.score ? b : a
  );

  // Preserve the engine's best move unless it evaluates to exactly 0 cp.
  if (best.isMate || best.score !== 0) {
    return best.line;
  }

  // Consider every MultiPV line evaluated at exactly 0 cp.
  const drawLines = candidates.filter(candidate =>
    !candidate.isMate &&
    candidate.score === 0
  );

  if (drawLines.length === 0) {
    return best.line;
  }

  // Replay each PV and count plies until the game ends.
  const scoredLines = drawLines.map(candidate => {
    const game = new Chess(fen);
    let moveCount = 0;

    for (const uci of candidate.line.pv ?? []) {
      // Check termination before attempting the next move.
      if (
        game.isGameOver() ||
        game.isInsufficientMaterial()
      ) {
        break;
      }

      const match = uci.match(
        /^([a-h][1-8])([a-h][1-8])([qrbn])?$/
      );

      if (!match) break;

      let move;

      try {
        move = game.move({
          from: match[1],
          to: match[2],
          ...(match[3]
            ? { promotion: match[3] }
            : {}),
        });
      } catch {
        break;
      }

      if (!move) break;

      moveCount++;

      // Explicitly check insufficient material because Stockfish
      // PV output may continue beyond that position.
      if (
        game.isGameOver() ||
        game.isInsufficientMaterial()
      ) {
        break;
      }
    }

    return {
      line: candidate.line,
      moveCount,
    };
  });

  // Select the longest continuation.
  const longest = Math.max(
    ...scoredLines.map(candidate => candidate.moveCount)
  );

  // Randomly break ties.
  const longestLines = scoredLines.filter(
    candidate => candidate.moveCount === longest
  );

  return longestLines[
    Math.floor(Math.random() * longestLines.length)
  ].line;
}

