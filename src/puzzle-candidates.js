import { Chess } from "chess.js";
import { Chessground } from "chessground";

import { findMatchingChildIndex, getChildrenAtPath, setPath, getNodeAtPath } from "./pgn";
import { cgTurnColor, legalDests, handleMoveWithPromotion, handleClickMoveWithPromotion, createViewSolutionButton } from "./util"
import { changeAudio, playSound } from "./audio";
import { reviewSession } from "./review";

const CP_THRESHOLD = 0.3;
const MARGINAL_THRESHOLD = 0.6;

let cg;
let chess;
let promotion;
let pgn;
let resolvePuzzle;

let foundCandidates;
let shapes;
let marginalMoves;
let advanceButton;
let currentAbortSignal = null;
let onAbortListener = null;
let isProcessingMove = false;

export function runCandidatePuzzle(el, loadedPgn, options = {}, signal = null) {
  return new Promise(resolve => {

    console.log("IN PUZZLE-CANDIDATES");

    currentAbortSignal = signal;

    if (currentAbortSignal?.aborted) {
      resolve();
      return;
    }

    resolvePuzzle = resolve;

    const { 
//      opponentMovesFirst = false,
      onViewSolution = null,
    } = options;

    pgn = loadedPgn;

    chess = new Chess(pgn.tags.FEN);

    prepareCandidates();

    setPath([]);

    foundCandidates = new Set();
    shapes = [];

    if (currentAbortSignal) {
      onAbortListener = onAbort;
      signal.addEventListener("abort", onAbortListener, { once: true });
    }

    cg = Chessground(el, {
      fen: chess.fen(),
      turnColor: cgTurnColor(chess),

      drawable: {
        enabled: false,
        shapes: shapes,
        eraseOnClick: false,
      },

      movable: {
        color: cgTurnColor(chess),
        free: false,
        dests: legalDests(chess),

        events: {
          after(orig, dest) {
            isProcessingMove = true;
            handleMoveWithPromotion(chess, orig, dest, handleMove);
            // runs after events: select(dest) below to prevent move from being attempted twice
            setTimeout(() => { isProcessingMove = false; }, 0);
          },
        },
      },

      draggable: {
        showGhost: true,
      },

      events: {
        select(dest) {
          setTimeout(() => { // ensures this runs after events: after(orig, dest)
            if (isProcessingMove) return;
            handleClickMoveWithPromotion(chess, cg, dest, handleMove);
          }, 0);
        }
      },
    });

    const boardSection = document.querySelector("#board section");
    boardSection.classList.remove("border-white", "border-black");
    boardSection.classList.add(`border-${cgTurnColor(chess)}`);
    //const board = el.querySelector("cg-board");
    //board.classList.add(`border-${cgTurnColor(chess)}`);

    window.chess = chess;
    window.cg = cg;

    advanceButton = createViewSolutionButton(
      onViewSolution,
      () => {
        if (currentAbortSignal && onAbortListener) {
          currentAbortSignal.removeEventListener("abort", onAbortListener);
        }
        cleanup();
        console.log("CANDIDATES CHESSGROUND DESTROYED - VIEW SOLUTION BUTTON");
        resolvePuzzle();
      }
    );

  });
}

function prepareCandidates() {

  console.log("PREPARE CANDIDATES");

  marginalMoves = [];

  const children = pgn.moves;

  const evaluatedChildren = children.filter(
    node => typeof node?.commentDiag?.eval === "number"
  );

  // No evaluations means all variations correct
  if (evaluatedChildren.length === 0) {
    return;
  }

  // commentDiag.eval is from White's perspective.
  // Convert evla to the player's perspective
  const playerColor = chess.turn();

  const candidates = children.map(node => {

    const evalValue = node?.commentDiag?.eval;

    return {
      node,
      eval:
        typeof evalValue === "number"
          ? playerColor === "w"
            ? evalValue
            : -evalValue
          : null,
    };
  });

  const evaluatedCandidates = candidates.filter(
    candidate => candidate.eval !== null
  );

  const bestEval = Math.max(
    ...evaluatedCandidates.map(candidate => candidate.eval)
  );

  const greenMoves = [];

  for (const candidate of candidates) {

    // Nodes without evaluations retain the original behavior
    // and remain valid green candidates.
    if (candidate.eval === null) {
      greenMoves.push(candidate.node);
      continue;
    }

    const difference = bestEval - candidate.eval;

    if (difference <= CP_THRESHOLD) {
      greenMoves.push(candidate.node);

    } else if (difference <= MARGINAL_THRESHOLD) {
      marginalMoves.push(candidate.node);
    }

    console.log({
        move: candidate.node.san,
        eval: candidate.eval,
        bestEval,
        difference,
        CP_THRESHOLD,
        MARGINAL_THRESHOLD,
    });

  }

  // The puzzle itself now consists only of green candidates.
  pgn.moves = greenMoves;

  window.pgn = pgn;
  window.greenMoves = greenMoves;
  window.marginalMoves = marginalMoves;
}


function findMatchingMarginalMove(orig, dest, promotion) {

  return marginalMoves.some(node =>
    node.from === orig &&
    node.to === dest &&
    (promotion === undefined || node.promotion === promotion)
  );
}


function handleMove(orig, dest, promotion = undefined) {

  if (currentAbortSignal?.aborted) return;

  const index = findMatchingChildIndex(orig, dest, promotion);

  if (index !== null) {

    changeAudio(getNodeAtPath([index]));

    trackAttempt(orig, dest, "green", index);

    reviewSession.logAttempt(
      true,
      chess,
      orig,
      dest,
      promotion
    );

  } else if (findMatchingMarginalMove(orig, dest, promotion)) {

    playSound("error");

    trackAttempt(orig, dest, "yellow");

    reviewSession.logAttempt(
      false,
      chess,
      orig,
      dest,
      promotion
    );

  } else {

    playSound("error");

    trackAttempt(orig, dest, "red");

    reviewSession.logAttempt(
      false,
      chess,
      orig,
      dest,
      promotion
    );
  }

  if (isSolved()) {
    finishPuzzle();
    return;
  }

  resetBoard();
}


function trackAttempt(orig, dest, result, index = null) {

  shapes.push({
    orig,
    dest,
    brush: result,
  });

  if (result === "green") {
    foundCandidates.add(index);
  }

  const priority = ["red", "yellow", "green"];

  shapes.sort(
    (a, b) =>
      priority.indexOf(a.brush) - priority.indexOf(b.brush)
  );

  cg.set({
    drawable: {
      shapes: shapes,
    },
  });

}


function resetBoard() {

  chess.load(pgn.tags.FEN);

  cg.set({
    fen: chess.fen(),
    turnColor: cgTurnColor(chess),
    drawable: {
      shapes: shapes,
    },
    movable: {
      color: cgTurnColor(chess),
      free: false,
      dests: legalDests(chess),
    },
  });
}


function isSolved() {

  const children = getChildrenAtPath();

  return foundCandidates.size === children.length;
}


function finishPuzzle() {

  if (currentAbortSignal?.aborted) return;

  console.log("Found candidates:", foundCandidates);

  if (currentAbortSignal && onAbortListener) {
    currentAbortSignal.removeEventListener("abort", onAbortListener);
  }

  cleanup();

  console.log("CANDIDATES CHESSGROUND DESTROYED");

  resolvePuzzle();

}

//
// REPLICATED CODE ACROSS UNITS
//

function cleanup() {
  if (advanceButton) {
    advanceButton.remove();
    advanceButton = null;
  }

  if (cg) {
    cg.destroy();
    cg = null;
  }

  if (currentAbortSignal && onAbortListener) {
    currentAbortSignal.removeEventListener("abort", onAbortListener);
    onAbortListener = null;
  }
}

function onAbort() {
  console.log("CANDIDATES ABORTED");
  cleanup();
  if (resolvePuzzle) {
    resolvePuzzle();
  }
}

export function getFen() {
  return chess.fen();
}

