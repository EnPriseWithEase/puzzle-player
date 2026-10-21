import { Chess } from "chess.js";
import { Chessground } from "chessground";

import { PgnNavigator } from "./pgn.js";
import { cgTurnColor, legalDests, handleMoveWithPromotion, createViewSolutionButton } from "./util";
import { changeAudio, playSound } from "./audio";
import { reviewSession } from "./review";

const CP_THRESHOLD = 0.3;
const MARGINAL_THRESHOLD = 0.6;

export class CandidatePuzzleSession {
  constructor(el, loadedPgn, options = {}, signal = null) {
    this.el = el;
    this.loadedPgn = loadedPgn;

    const {
      abortSignal = null,
      onViewSolution = null,
    } = options;

    this.currentAbortSignal = abortSignal || signal;
    this.onViewSolution = onViewSolution;

    // Instance-specific navigator and state
    this.navigator = new PgnNavigator();
    this.pgn = null;
    this.cg = null;
    this.chess = null;
    this.resolvePuzzle = null;

    this.foundCandidates = new Set();
    this.shapes = [];
    this.marginalMoves = [];
    this.advanceButton = null;
    this.onAbortListener = null;
    this.boardLocked = false;
    this.puzzleFinished = false;
    this.disposed = false;
  }

  start() {
    return new Promise(resolve => {
      console.log("IN PUZZLE-CANDIDATES");

      this.resolvePuzzle = resolve;
      this.boardLocked = false;
      this.puzzleFinished = false;

      if (this.currentAbortSignal?.aborted || this.disposed) {
        resolve();
        return;
      }

      // Load PGN into the session's private navigator instance
      this.pgn = this.navigator.loadPgn(this.loadedPgn);
      this.chess = new Chess(this.pgn.tags.FEN);

      this.prepareCandidates();
      this.navigator.setPath([]);

      this.foundCandidates = new Set();
      this.shapes = [];

      if (this.currentAbortSignal) {
        this.onAbortListener = () => this.onAbort();
        this.currentAbortSignal.addEventListener("abort", this.onAbortListener, { once: true });
        if (this.currentAbortSignal.aborted) {
          this.onAbort();
          return;
        }
      }

      this.cg = Chessground(this.el, {
        fen: this.chess.fen(),
        turnColor: cgTurnColor(this.chess),

        drawable: {
          enabled: false,
          shapes: this.shapes,
          eraseOnClick: false,
        },

        movable: {
          color: cgTurnColor(this.chess),
          free: false,
          dests: legalDests(this.chess),

          events: {
            after: (orig, dest) => {
              this.boardLocked = true;
              handleMoveWithPromotion(this.chess, orig, dest, (o, d, p) => this.handleMove(o, d, p));
              setTimeout(() => { if (!this.puzzleFinished && !this.disposed) this.boardLocked = false; }, 0);
            },
          },
        },

        draggable: {
          showGhost: true,
        },

        events: {
          select: (dest) => {
            setTimeout(() => {
              if (this.boardLocked || this.disposed) return;
            }, 0);
          }
        },
      });

      const boardSection = this.el.querySelector("section") || document.querySelector("#board section");
      if (boardSection) {
        boardSection.classList.remove("border-white", "border-black");
        boardSection.classList.add(`border-${cgTurnColor(this.chess)}`);
      }

      window.chess = this.chess;
      window.cg = this.cg;

      this.advanceButton = createViewSolutionButton(
        this.onViewSolution,
        () => {
          this.cleanup();
          console.log("CANDIDATES CHESSGROUND DESTROYED - VIEW SOLUTION BUTTON");
          this.resolvePuzzle();
        }
      );
    });
  }

  prepareCandidates() {
    this.marginalMoves = [];
    const children = this.pgn.moves;

    const evaluatedChildren = children.filter(
      node => typeof node?.commentDiag?.eval === "number"
    );

    if (evaluatedChildren.length === 0) return;

    const playerColor = this.chess.turn();

    const candidates = children.map(node => {
      const evalValue = node?.commentDiag?.eval;
      return {
        node,
        eval: typeof evalValue === "number"
          ? playerColor === "w" ? evalValue : -evalValue
          : null,
      };
    });

    const evaluatedCandidates = candidates.filter(candidate => candidate.eval !== null);
    const bestEval = Math.max(...evaluatedCandidates.map(candidate => candidate.eval));

    const greenMoves = [];

    for (const candidate of candidates) {
      if (candidate.eval === null) {
        greenMoves.push(candidate.node);
        continue;
      }

      const difference = bestEval - candidate.eval;

      if (difference <= CP_THRESHOLD) {
        greenMoves.push(candidate.node);
      } else if (difference <= MARGINAL_THRESHOLD) {
        this.marginalMoves.push(candidate.node);
      }
    }

    this.pgn.moves = greenMoves;
  }

  findMatchingMarginalMove(orig, dest, promotion) {
    return this.marginalMoves.some(node =>
      node.from === orig &&
      node.to === dest &&
      (promotion === undefined || node.promotion === promotion)
    );
  }

  handleMove(orig, dest, promotion = undefined) {
    if (this.shouldStop()) return;

    this.boardLocked = true;

    const index = this.navigator.findMatchingChildIndex(orig, dest, promotion);

    if (index !== null) {
      changeAudio(this.navigator.getNodeAtPath([index]));
      this.trackAttempt(orig, dest, "green", index);
      reviewSession.logAttempt(true, this.chess, orig, dest, promotion);
    } else if (this.findMatchingMarginalMove(orig, dest, promotion)) {
      playSound("error");
      this.trackAttempt(orig, dest, "yellow");
      reviewSession.logAttempt(false, this.chess, orig, dest, promotion);
    } else {
      playSound("error");
      this.trackAttempt(orig, dest, "red");
      reviewSession.logAttempt(false, this.chess, orig, dest, promotion);
    }

    if (this.isSolved()) {
      this.finishPuzzle();
      return;
    }

    this.resetBoard();
    this.boardLocked = false;
  }

  trackAttempt(orig, dest, result, index = null) {
    this.shapes.push({ orig, dest, brush: result });

    if (result === "green") {
      this.foundCandidates.add(index);
    }

    const priority = ["red", "yellow", "green"];
    this.shapes.sort((a, b) => priority.indexOf(a.brush) - priority.indexOf(b.brush));

    if (this.cg) {
      this.cg.set({ drawable: { shapes: this.shapes } });
    }
  }

  resetBoard() {
    if (!this.cg) return;
    this.chess.load(this.pgn.tags.FEN);

    this.cg.set({
      fen: this.chess.fen(),
      turnColor: cgTurnColor(this.chess),
      drawable: { shapes: this.shapes },
      movable: {
        color: cgTurnColor(this.chess),
        free: false,
        dests: legalDests(this.chess),
      },
    });
  }

  isSolved() {
    const children = this.navigator.getChildrenAtPath();
    return this.foundCandidates.size === children.length;
  }

  finishPuzzle() {
    if (this.puzzleFinished || this.disposed) return;
    this.puzzleFinished = true;
    this.boardLocked = true;

    if (this.shouldStop()) return;

    this.cleanup();
    console.log("CANDIDATES CHESSGROUND DESTROYED");
    this.resolvePuzzle();
  }

  shouldStop() {
    return (
      this.disposed ||
      this.currentAbortSignal?.aborted ||
      this.puzzleFinished
    );
  }

  cleanup() {
    if (this.disposed) return;
    this.disposed = true;

    if (this.advanceButton) {
      this.advanceButton.remove();
      this.advanceButton = null;
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
    console.log("CANDIDATES ABORTED");
    this.cleanup();
    if (this.resolvePuzzle) {
      this.resolvePuzzle();
    }
  }

  getFen() {
    return this.chess?.fen() ?? null;
  }
}

export function runCandidatePuzzle(el, loadedPgn, options = {}, signal = null) {
  const session = new CandidatePuzzleSession(el, loadedPgn, options, signal);
  return session.start();
}

