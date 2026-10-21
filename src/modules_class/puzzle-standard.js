import { Chess } from "chess.js";
import { Chessground } from "chessground";

import { PgnNavigator } from "./pgn.js";
import { reviewSession } from "./review.js";
import { cgTurnColor, legalDests, handleMoveWithPromotion, createViewSolutionButton } from "./util.js";
import { changeAudio, playSound } from "./audio.js";

export class StandardPuzzleSession {
  constructor(el, loadedPgn, options = {}) {
    this.el = el;
    this.loadedPgn = loadedPgn;

    const {
      abortSignal = null,
      opponentMovesFirst = false,
      onViewSolution = null,
    } = options;

    this.currentAbortSignal = abortSignal;
    this.opponentMovesFirst = opponentMovesFirst;
    this.onViewSolution = onViewSolution;

    // Instance-specific navigator and state
    this.navigator = new PgnNavigator();
    this.pgn = null;
    this.cg = null;
    this.chess = null;
    this.promotion = undefined;
    this.advanceButton = null;
    this.onAbortListener = null;

    this.viewSolutionButtonClicked = false;
    this.boardLocked = false;
    this.puzzleFinished = false;
    this.disposed = false;

    this.resolvePuzzle = null;
  }

  start() {
    return new Promise(resolve => {
      console.log("IN PUZZLE-STANDARD");
      this.resolvePuzzle = resolve;

      if (this.currentAbortSignal?.aborted || this.disposed) {
        resolve();
        return;
      }

      // Load PGN into the session's private navigator instance
      this.pgn = this.navigator.loadPgn(this.loadedPgn);
      this.navigator.setPath([]);

      this.chess = new Chess(this.pgn.tags.FEN);
      window.chess = this.chess;

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

      this.advanceButton = createViewSolutionButton(
        this.onViewSolution,
        () => {
          this.viewSolutionButtonClicked = true;
          this.cleanup();
          this.resolvePuzzle();
        }
      );

      window.cg = this.cg;
    });
  }

  async handleMove(orig, dest, promotion = undefined) {
    if (this.shouldStop()) return;

    this.boardLocked = true;

    const moveIsCorrect = this.makePlayerMove(orig, dest, promotion);

    if (!moveIsCorrect) {
      reviewSession.logAttempt(false, this.chess, orig, dest, promotion);
      playSound("error");

      this.resetBoard();
      this.boardLocked = false;
      return;
    }

    if (this.isSolved()) {
      reviewSession.logAttempt(true);
      await this.finishPuzzle();
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 400));

    if (this.shouldStop()) return;

    this.makeOpponentMove();
    this.updateBoard();

    if (this.isSolved()) {
      reviewSession.logAttempt(true);
      await this.finishPuzzle();
      return;
    }

    this.boardLocked = false;
  }

  makePlayerMove(orig, dest, promotion) {
    const index = this.navigator.findMatchingChildIndex(orig, dest, promotion);
    if (index === null) return false;

    this.navigator.pgnPath.push(index);

    const move = this.chess.move({
      from: orig,
      to: dest,
      promotion,
    });

    changeAudio(move);

    if (promotion !== undefined) {
      this.cg.set({ fen: this.chess.fen() });
    }

    return true;
  }

  makeOpponentMove() {
    const children = this.navigator.getChildrenAtPath();
    if (children.length === 0) return false;

    const index = Math.floor(Math.random() * children.length);
    const node = children[index];

    this.navigator.pgnPath.push(index);

    const move = this.chess.move({
      from: node.from,
      to: node.to,
      promotion: node.promotion,
    });

    changeAudio(move);

    if (node.promotion !== undefined) {
      this.cg.set({ fen: this.chess.fen() });
    } else {
      this.cg.move(node.from, node.to);
    }

    return true;
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

    const playerColor = cgTurnColor(this.chess);
    const playerDests = legalDests(this.chess);

    this.cg.set({
      fen: this.chess.fen(),
      turnColor: playerColor,
      movable: {
        color: playerColor,
        free: false,
        dests: playerDests,
      },
    });
  }

  isSolved() {
    const node = this.navigator.getNodeAtPath();
    return !!node && node.children?.length === 0;
  }

  async finishPuzzle() {
    if (this.puzzleFinished || this.disposed) return;

    this.puzzleFinished = true;
    this.boardLocked = true;

    if (this.advanceButton) {
      this.advanceButton.disabled = true;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.shouldStop()) return;

    this.cleanup();
    this.resolvePuzzle();
  }

  shouldStop() {
    return (
      this.disposed ||
      this.viewSolutionButtonClicked ||
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
    console.log("STANDARD ABORTED");
    this.cleanup();
    if (this.resolvePuzzle) {
      this.resolvePuzzle();
    }
  }

  getFen() {
    return this.chess?.fen() ?? null;
  }
}

export function runPuzzle(el, loadedPgn, options = {}) {
  const session = new StandardPuzzleSession(el, loadedPgn, options);
  return session.start();
}

