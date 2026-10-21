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

export class StockfishPuzzleSession {
  constructor(el, loadedPgn, options = {}) {
    this.el = el;
    this.loadedPgn = loadedPgn;
    
    const {
      abortSignal = null,
      maxMoves: maxMovesOption = null,
      targetEval: targetEvalOption = -200,
      engineOptions = {},
      onViewSolution = null,
    } = options;

    this.maxMoves = maxMovesOption;
    this.targetEval = targetEvalOption;
    this.engineOptions = engineOptions; // Fixed bug #2
    this.currentAbortSignal = abortSignal;
    this.onViewSolution = onViewSolution;

    // Instance-specific state
    this.cg = null;
    this.chess = null;
    this.engine = null;
    this.advanceButton = null;
    this.onAbortListener = null;

    this.boardLocked = true;
    this.puzzleFinished = false;
    this.attemptLogged = false;
    this.viewSolutionButtonClicked = false;
    this.disposed = false; // Added terminal flag #3

    this.initialFen = null;
    this.playerColor = null;
    this.initialEval = null;
    this.currentEval = null;
    this.playerMoves = 0;
    this.endingReason = null;
    this.searchOptions = null;

    this.resolvePuzzle = null;
    this.rejectPuzzle = null;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.resolvePuzzle = resolve;
      this.rejectPuzzle = reject;

      if (this.currentAbortSignal?.aborted) {
        resolve();
        return;
      }

      this.initialFen = this.loadedPgn.tags.FEN || new Chess().fen();
      this.chess = new Chess(this.initialFen);
      this.playerColor = this.chess.turn() === "w" ? "white" : "black";

      const {
        depth = 12,
        movetime = null,
        ...uciOptions
      } = this.engineOptions || {};

      this.searchOptions = movetime != null ? { movetime } : { depth };
      this.engine = createStockfish({ engineOptions: uciOptions });

      if (this.currentAbortSignal) {
        this.onAbortListener = () => this.onAbort();
        this.currentAbortSignal.addEventListener(
          "abort",
          this.onAbortListener,
          { once: true }
        );
        // Fixed race condition #4
        if (this.currentAbortSignal.aborted) {
          this.onAbort();
          return;
        }
      }

      this.cg = Chessground(this.el, {
        fen: this.chess.fen(),
        turnColor: cgTurnColor(this.chess),
        movable: {
          color: null,
          free: false,
          dests: legalDests(this.chess),
          events: {
            after: (orig, dest) => {
              this.boardLocked = true;
              handleMoveWithPromotion(
                this.chess,
                orig,
                dest,
                (o, d, p) => this.handleMove(o, d, p)
              );
            },
          },
        },
        draggable: { showGhost: true },
      });

      // Scoped board selection #6
      const boardSection = this.el.querySelector("section") || document.querySelector("#board section");
      if (boardSection) {
        boardSection.classList.remove("border-white", "border-black");
        boardSection.classList.add(`border-${cgTurnColor(this.chess)}`);
      }

      this.advanceButton = createViewSolutionButton(
        this.onViewSolution,
        () => {
          this.viewSolutionButtonClicked = true;
          this.cleanup();
          this.resolvePuzzle();
        }
      );

      this.initializeEngine();
    });
  }

  async initializeEngine() {
    try {
      await this.engine.init();
      if (this.shouldStop()) return;

      const result = await this.engine.evaluate(this.initialFen, this.searchOptions);
      if (this.shouldStop()) return;

      this.initialEval = result?.mate == null ? result?.cp ?? null : null;
      this.currentEval = result;

      if (this.chess.isGameOver()) {
        this.endingReason = "game-over";
        await this.finishPuzzle();
        return;
      }

      this.boardLocked = false;
      this.updateBoard();
    } catch (error) {
      if (this.shouldStop()) return;
      this.handleEngineError(error);
    }
  }

  async handleMove(orig, dest, promotion = undefined) {
    if (this.shouldStop()) return;
    this.boardLocked = true;

    let move;
    try {
      move = this.chess.move({
        from: orig,
        to: dest,
        ...(promotion !== undefined ? { promotion } : {}),
      });
    } catch {
      move = null;
    }

    if (!move) {
      playSound("error");
      this.resetBoard();
      this.boardLocked = false;
      return;
    }

    this.playerMoves++;
    changeAudio(move);

    if (promotion !== undefined) {
      this.cg.set({ fen: this.chess.fen() });
    }

    this.lockBoard();

    if (this.chess.isGameOver()) {
      this.endingReason = "game-over";
      await this.finishPuzzle();
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    if (this.shouldStop()) return;

    try {
      const result = await this.engine.search(this.chess.fen(), this.searchOptions);
      if (this.shouldStop()) return;

      this.currentEval = result.evaluation;

      if (this.hasFailedEvaluationThreshold()) {
        this.endingReason = "evaluation-threshold";
        await this.finishPuzzle();
        return;
      }

      if (this.maxMoves != null && this.playerMoves >= this.maxMoves) {
        this.endingReason = "move-limit";
        await this.finishPuzzle();
        return;
      }

      if (!result.bestMove) {
        if (this.chess.isGameOver()) {
          this.endingReason = "game-over";
          await this.finishPuzzle();
          return;
        }
        throw new Error("Stockfish returned no legal move");
      }

      const engineMove = this.chess.move({
        from: result.bestMove.from,
        to: result.bestMove.to,
        ...(result.bestMove.promotion ? { promotion: result.bestMove.promotion } : {}),
      });

      if (!engineMove) {
        throw new Error("Stockfish returned an illegal move");
      }

      changeAudio(engineMove);

      if (engineMove.promotion) {
        this.cg.set({ fen: this.chess.fen() });
      }

      if (this.isSolved()) {
        this.updateBoard();
        await this.finishPuzzle();
        return;
      }

      this.boardLocked = false;
      this.updateBoard();
    } catch (error) {
      if (this.shouldStop()) return;
      this.handleEngineError(error);
    }
  }

  isSolved() {
    if (this.chess.isGameOver()) {
      this.endingReason = "game-over";
      return true;
    }
    return false;
  }

  getPlayerEvaluation(evaluation) {
    if (!evaluation) return null;
    const sign = this.playerColor === "white" ? 1 : -1;

    if (evaluation.mate != null) {
      return { type: "mate", value: evaluation.mate * sign };
    }
    if (evaluation.cp != null) {
      return { type: "cp", value: evaluation.cp * sign };
    }
    return null;
  }

  hasFailedEvaluationThreshold() {
    if (this.targetEval == null) return false;
    const evaluation = this.getPlayerEvaluation(this.currentEval);
    if (!evaluation) return false;

    if (evaluation.type === "mate") {
      return evaluation.value < 0;
    }
    return evaluation.value <= this.targetEval;
  }

  isAboveFailureThreshold() {
    if (this.targetEval == null) return true;
    const evaluation = this.getPlayerEvaluation(this.currentEval);
    if (!evaluation) return false;

    if (evaluation.type === "mate") {
      return evaluation.value > 0;
    }
    return evaluation.value > this.targetEval;
  }

  isAttemptCorrect() {
    if (this.endingReason === "game-over") {
      if (this.chess.isCheckmate()) {
        return this.chess.turn() !== this.playerColor[0];
      }
      if (this.chess.isDraw()) {
        return this.initialEval !== null && Math.abs(this.initialEval) <= 100;
      }
      return false;
    }
    if (this.endingReason === "evaluation-threshold") return false;
    if (this.endingReason === "move-limit") return this.isAboveFailureThreshold();
    return false;
  }

  async finishPuzzle() {
    if (this.puzzleFinished || this.disposed) return;

    this.puzzleFinished = true;
    this.boardLocked = true;

    if (this.advanceButton) {
      this.advanceButton.disabled = true;
    }

    const pgnString = this.createGamePgn();

    if (!this.attemptLogged) {
      this.attemptLogged = true;
      reviewSession.logGameAttempt(this.isAttemptCorrect(), pgnString);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    if (this.shouldStop()) return; // Replaced raw aborted check with shouldStop()

    this.cleanup();
    this.resolvePuzzle(pgnString);
  }

  createGamePgn() {
    let result = "*";
    if (this.chess.isCheckmate()) {
      result = this.chess.turn() === "w" ? "0-1" : "1-0";
    } else if (this.chess.isDraw()) {
      result = "1/2-1/2";
    }

    this.chess.header(
      "Event", "Stockfish Puzzle",
      "SetUp", "1",
      "FEN", this.initialFen,
      "Result", result
    );

    return this.chess.pgn();
  }

  lockBoard() {
    if (!this.cg) return;
    this.cg.set({
      movable: { color: null, free: false, dests: new Map() },
    });
  }

  resetBoard() {
    if (!this.cg) return;
    this.cg.set({
      fen: this.chess.fen(),
      turnColor: cgTurnColor(this.chess),
      movable: {
        color: cgTurnColor(this.chess),
        free: false,
        dests: legalDests(this.chess),
      },
    });
  }

  updateBoard() {
    if (!this.cg) return;
    const turnColor = cgTurnColor(this.chess);

    this.cg.set({
      fen: this.chess.fen(),
      turnColor,
      movable: {
        color: this.boardLocked ? null : turnColor,
        free: false,
        dests: this.boardLocked ? new Map() : legalDests(this.chess),
      },
    });

    const boardSection = this.el.querySelector("section") || document.querySelector("#board section");
    if (boardSection) {
      boardSection.classList.remove("border-white", "border-black");
      boardSection.classList.add(`border-${turnColor}`);
    }
  }

  shouldStop() {
    return (
      this.disposed ||
      this.viewSolutionButtonClicked ||
      this.currentAbortSignal?.aborted ||
      this.puzzleFinished
    );
  }

  handleEngineError(error) {
    if (this.disposed) return;
    console.error("Stockfish puzzle error:", error);
    this.cleanup();
    if (this.rejectPuzzle) {
      this.rejectPuzzle(error);
    }
  }

  cleanup() {
    if (this.disposed) return;
    this.disposed = true; // Makes cleanup idempotent (#3)

    if (this.advanceButton) {
      this.advanceButton.remove();
      this.advanceButton = null;
    }
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }
    if (this.cg) {
      this.cg.destroy();
      this.cg = null;
    }
    if (this.currentAbortSignal && this.onAbortListener) {
      this.currentAbortSignal.removeEventListener("abort", this.onAbortListener);
      this.onAbortListener = null;
    }
  }

  onAbort() {
    if (this.disposed) return;
    this.cleanup();
    if (this.resolvePuzzle) {
      this.resolvePuzzle();
    }
  }

  getFen() {
    return this.chess?.fen() ?? null;
  }
}

export function runStockfishPuzzle(el, loadedPgn, options = {}) {
  const session = new StockfishPuzzleSession(el, loadedPgn, options);
  return session.start();
}

