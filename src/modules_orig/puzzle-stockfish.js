import { Chess } from "chess.js";
import { Chessground } from "chessground";

import { reviewSession } from "./review.js";
import {
  cgTurnColor,
  legalDests,
  handleMoveWithPromotion,
  createViewSolutionButton,
} from "./util.js";
import { changeAudio, playSound } from "./audio.js";
import { createStockfish } from "./stockfish.js";

let cg;
let chess;
let engine;
let promotion;
let resolvePuzzle;
let rejectPuzzle;
let viewSolutionButtonClicked;
let advanceButton;
let currentAbortSignal = null;
let onAbortListener = null;
let boardLocked;
let puzzleFinished;
let attemptLogged;

let initialFen;
let playerColor;
let initialEval;
let currentEval;
let playerMoves;
let maxMoves;
let targetEval;
let searchOptions;
let endingReason;

export function runStockfishPuzzle(el, loadedPgn, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      abortSignal = null,
      maxMoves: maxMovesOption = null,
      targetEval: targetEvalOption = -200,
      engineOptions = {},
      onViewSolution = null,
    } = options;

    maxMoves = maxMovesOption;
    targetEval = targetEvalOption;

    currentAbortSignal = abortSignal;
    viewSolutionButtonClicked = false;
    boardLocked = true;
    puzzleFinished = false;
    attemptLogged = false;

    if (currentAbortSignal?.aborted) {
      resolve();
      return;
    }

    resolvePuzzle = resolve;
    rejectPuzzle = reject;

    initialFen = loadedPgn.tags.FEN || new Chess().fen();
    chess = new Chess(initialFen);

    // The player moves first: their color is the active color in the FEN.
    playerColor = chess.turn() === "w" ? "white" : "black";

    initialEval = null;
    currentEval = null;
    playerMoves = 0;
    endingReason = null;

    // Search controls are separate from Stockfish UCI options.
    const {
      depth = 12,
      movetime = null,
      ...uciOptions
    } = engineOptions;

    searchOptions = movetime != null
      ? { movetime }
      : { depth };

    engine = createStockfish({
      engineOptions: uciOptions,
    });

    if (currentAbortSignal) {
      onAbortListener = onAbort;
      currentAbortSignal.addEventListener(
        "abort",
        onAbortListener,
        { once: true }
      );
    }

    cg = Chessground(el, {
      fen: chess.fen(),
      turnColor: cgTurnColor(chess),

      movable: {
        color: null,
        free: false,
        dests: legalDests(chess),

        events: {
          after(orig, dest) {
            boardLocked = true;

            handleMoveWithPromotion(
              chess,
              orig,
              dest,
              handleMove
            );
          },
        },
      },

      draggable: {
        showGhost: true,
      },
    });

    const boardSection = document.querySelector("#board section");

    if (boardSection) {
      boardSection.classList.remove("border-white", "border-black");
      boardSection.classList.add(`border-${cgTurnColor(chess)}`);
    }

    advanceButton = createViewSolutionButton(
      onViewSolution,
      () => {
        viewSolutionButtonClicked = true;
        cleanup();
        resolvePuzzle();
      }
    );

    window.cg = cg;
    window.chess = chess;

    initializeEngine();
  });
}

async function initializeEngine() {
  try {
    await engine.init();

    if (shouldStop()) return;

    // Evaluate the initial position before the player's first move.
    const result = await engine.evaluate(
      initialFen,
      searchOptions
    );

    if (shouldStop()) return;

    initialEval = result?.mate == null
      ? result?.cp ?? null
      : null;

    currentEval = result;

    if (chess.isGameOver()) {
      endingReason = "game-over";
      await finishPuzzle();
      return;
    }

    boardLocked = false;
    updateBoard();
  } catch (error) {
    if (shouldStop()) return;
    handleEngineError(error);
  }
}

async function handleMove(orig, dest, promotion = undefined) {
  if (shouldStop()) return;

  boardLocked = true;

  let move;

  try {
    move = chess.move({
      from: orig,
      to: dest,
      ...(promotion !== undefined ? { promotion } : {}),
    });
  } catch {
    move = null;
  }

  if (!move) {
    playSound("error");
    resetBoard();
    boardLocked = false;
    return;
  }

  playerMoves++;
  changeAudio(move);

  if (promotion !== undefined) {
    cg.set({ fen: chess.fen() });
  }

  lockBoard();

  // A player move can end the game immediately.
  if (chess.isGameOver()) {
    endingReason = "game-over";
    await finishPuzzle();
    return;
  }

  // Keep the opponent's response visually separate from the player move.
  await new Promise(resolve => setTimeout(resolve, 400));

  if (shouldStop()) return;

  try {
    // This search supplies BOTH the engine's reply and the evaluation
    // of the position before that reply. No second evaluation search.
    const result = await engine.search(
      chess.fen(),
      searchOptions
    );

    if (shouldStop()) return;

    currentEval = result.evaluation;

    if (hasFailedEvaluationThreshold()) {
      endingReason = "evaluation-threshold";
      await finishPuzzle();
      return;
    }

    if (maxMoves != null && playerMoves >= maxMoves) {
      endingReason = "move-limit";
      await finishPuzzle();
      return;
    }

    if (!result.bestMove) {
      if (chess.isGameOver()) {
        endingReason = "game-over";
        await finishPuzzle();
        return;
      }

      throw new Error("Stockfish returned no legal move");
    }

    const engineMove = chess.move({
      from: result.bestMove.from,
      to: result.bestMove.to,
      ...(result.bestMove.promotion
        ? { promotion: result.bestMove.promotion }
        : {}),
    });

    if (!engineMove) {
      throw new Error("Stockfish returned an illegal move");
    }

    changeAudio(engineMove);

    if (engineMove.promotion) {
      cg.set({ fen: chess.fen() });
    }

    if (isSolved()) {
      updateBoard();
      await finishPuzzle();
      return;
    }

    boardLocked = false;
    updateBoard();

  } catch (error) {
    if (shouldStop()) return;
    handleEngineError(error);
  }
}

// Returns true when any configured ending condition has been reached.
function isSolved() {
  if (chess.isGameOver()) {
    endingReason = "game-over";
    return true;
  }

  return false;
}

function getPlayerEvaluation(evaluation) {
  if (!evaluation) return null;

  const sign = playerColor === "white" ? 1 : -1;

  if (evaluation.mate != null) {
    return {
      type: "mate",
      value: evaluation.mate * sign,
    };
  }

  if (evaluation.cp != null) {
    return {
      type: "cp",
      value: evaluation.cp * sign,
    };
  }

  return null;
}

function hasFailedEvaluationThreshold() {
  if (targetEval == null) return false;

  const evaluation = getPlayerEvaluation(currentEval);

  if (!evaluation) return false;

  // A forced mate against the player is beyond any centipawn threshold.
  if (evaluation.type === "mate") {
    return evaluation.value < 0;
  }

  return evaluation.value <= targetEval;
}

function isAboveFailureThreshold() {
  if (targetEval == null) return true;

  const evaluation = getPlayerEvaluation(currentEval);

  if (!evaluation) return false;

  if (evaluation.type === "mate") {
    return evaluation.value > 0;
  }

  return evaluation.value > targetEval;
}

function isAttemptCorrect() {
  if (endingReason === "game-over") {
    if (chess.isCheckmate()) {
      // chess.turn() is the side that was checkmated.
      return chess.turn() !== playerColor[0];
    }

    if (chess.isDraw()) {
      return initialEval !== null &&
        Math.abs(initialEval) <= 100;
    }

    return false;
  }

  if (endingReason === "evaluation-threshold") {
    return false;
  }

  if (endingReason === "move-limit") {
    return isAboveFailureThreshold();
  }

  return false;
}

async function finishPuzzle() {
  if (puzzleFinished) return;

  puzzleFinished = true;
  boardLocked = true;

  if (advanceButton) {
    advanceButton.disabled = true;
  }

  const pgnString = createGamePgn();

  if (!attemptLogged) {
    attemptLogged = true;
    reviewSession.logGameAttempt(isAttemptCorrect(), pgnString);
  }

  // Preserve the existing runner's finishing pause.
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (currentAbortSignal?.aborted) return;

  cleanup();
  resolvePuzzle(pgnString);
}

function createGamePgn() {
  let result = "*";

  if (chess.isCheckmate()) {
    result = chess.turn() === "w" ? "0-1" : "1-0";
  } else if (chess.isDraw()) {
    result = "1/2-1/2";
  }

  chess.header(
    "Event", "Stockfish Puzzle",
    "SetUp", "1",
    "FEN", initialFen,
    "Result", result
  );

  return chess.pgn();
}

function lockBoard() {
  if (!cg) return;

  cg.set({
    movable: {
      color: null,
      free: false,
      dests: new Map(),
    },
  });
}

function resetBoard() {
  if (!cg) return;

  cg.set({
    fen: chess.fen(),
    turnColor: cgTurnColor(chess),
    movable: {
      color: cgTurnColor(chess),
      free: false,
      dests: legalDests(chess),
    },
  });
}

function updateBoard() {
  if (!cg) return;

  const turnColor = cgTurnColor(chess);

  cg.set({
    fen: chess.fen(),
    turnColor,
    movable: {
      color: boardLocked ? null : turnColor,
      free: false,
      dests: boardLocked ? new Map() : legalDests(chess),
    },
  });

  const boardSection = document.querySelector("#board section");

  if (boardSection) {
    boardSection.classList.remove("border-white", "border-black");
    boardSection.classList.add(`border-${turnColor}`);
  }
}

function shouldStop() {
  return (
    viewSolutionButtonClicked ||
    currentAbortSignal?.aborted ||
    puzzleFinished
  );
}

function handleEngineError(error) {
  console.error("Stockfish puzzle error:", error);

  cleanup();

  if (rejectPuzzle) {
    rejectPuzzle(error);
  }
}

function cleanup() {
  if (advanceButton) {
    advanceButton.remove();
    advanceButton = null;
  }

  if (engine) {
    engine.destroy();
    engine = null;
  }

  if (cg) {
    cg.destroy();
    cg = null;
  }

  if (currentAbortSignal && onAbortListener) {
    currentAbortSignal.removeEventListener(
      "abort",
      onAbortListener
    );
    onAbortListener = null;
  }
}

function onAbort() {
  cleanup();

  if (resolvePuzzle) {
    resolvePuzzle();
  }
}

export function getFen() {
  return chess?.fen() ?? null;
}

