import { Chess } from "chess.js";
import { Chessground } from "chessground";

import { PgnNavigator } from "./pgn.js";
import { 
  cgTurnColor, 
  legalDests, 
  handleMoveWithPromotion, 
  handleClickMoveWithPromotion, 
  hidePromotionPopup 
} from "./util";
import { changeAudio, playSound } from "./audio";

export class PuzzleViewerSession {
  constructor(el, loadedPgn, options = {}) {
    this.el = el;
    this.loadedPgn = loadedPgn;

    const {
      abortSignal = null,
      reviewResult = null,
    } = options;

    this.currentAbortSignal = abortSignal;
    this.reviewResult = reviewResult;

    // Instance-specific navigator and state
    this.navigator = new PgnNavigator();
    this.pgn = null;
    this.cg = null;
    this.chess = null;
    this.orientation = "white";
    this.advanceButton = null;
    this.onAbortListener = null;
    this.boardLocked = false;
    this.disposed = false;

    this.resolvePuzzle = null;
  }

  start() {
    return new Promise(resolve => {
      console.log("IN VIEWER");
      this.resolvePuzzle = resolve;

      if (this.currentAbortSignal?.aborted || this.disposed) {
        resolve();
        return;
      }

      this.boardLocked = false;
      this.pgn = this.navigator.loadPgn(this.loadedPgn);
      this.chess = new Chess(this.pgn.tags.FEN);
      this.orientation = "white";
      this.navigator.setPath([]);

      if (this.currentAbortSignal) {
        this.onAbortListener = () => this.onAbortViewer();
        this.currentAbortSignal.addEventListener("abort", this.onAbortListener, { once: true });
        if (this.currentAbortSignal.aborted) {
          this.onAbortViewer();
          return;
        }
      }

      this.cg = Chessground(this.el, {
        fen: this.chess.fen(),
        orientation: this.orientation,
        turnColor: cgTurnColor(this.chess),

        movable: {
          color: "both",
          free: false,
          dests: legalDests(this.chess),
          events: {
            after: (orig, dest) => {
              if (this.disposed) return;
              this.boardLocked = true;
              handleMoveWithPromotion(this.chess, orig, dest, (o, d, p) => this.handleMove(o, d, p));
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
              handleClickMoveWithPromotion(this.chess, this.cg, dest, (o, d, p) => this.handleMove(o, d, p));
            }, 0);
          }
        },

        drawable: {
          enabled: true,
          visible: true,
          autoShapes: [],
          shapes: [],
        },
      });

      const boardSection = this.el.querySelector("section") || document.querySelector("#board section");
      if (boardSection) {
        boardSection.classList.remove("border-white", "border-black");
        if (this.reviewResult === 0) {
          boardSection.classList.add("border-red");
        } else if (this.reviewResult === 1) {
          boardSection.classList.add("border-green");
        } else {
          boardSection.classList.add(`border-${cgTurnColor(this.chess)}`);
        }
      }

      this.createNavigation();
      this.updateBoard();
      this.updatePgnArrows();

      const buttonCreated = this.createContinueButton(() => {
        this.cleanupViewer();
        resolve();
      });

      // Prevent hanging promise if preboard container is missing
      if (!buttonCreated) {
        this.cleanupViewer();
        resolve();
      }
    });
  }

  closeViewer() {
    if (this.currentAbortSignal?.aborted || this.disposed) return;
    this.cleanupViewer();
    if (this.resolvePuzzle) this.resolvePuzzle();
  }

  async handleMove(orig, dest, promotion = undefined) {
    if (this.disposed) return;
    this.boardLocked = true;

    const matchingIndex = this.navigator.findMatchingChildIndex(orig, dest, promotion);

    if (matchingIndex !== null) {
      const children = this.navigator.getChildrenAtPath();
      const node = children[matchingIndex];

      this.chess.load(node.fenAfter);
      this.navigator.pgnPath.push(matchingIndex);

      changeAudio(this.navigator.getNodeAtPath(this.navigator.pgnPath));
      this.updateBoard();
      this.updatePgnArrows();

      await new Promise(resolve => setTimeout(resolve, 0));
      if (!this.disposed) this.boardLocked = false;
      return;
    }

    const node = this.navigator.createNode(this.chess, orig, dest, promotion);
    if (node) {
      this.navigator.addNodeToPath(node);
      changeAudio(node);
    }

    this.updateChess();
    this.updateBoard();
    this.updatePgnArrows();

    await new Promise(resolve => setTimeout(resolve, 0));
    if (!this.disposed) this.boardLocked = false;
  }

  moveBackward() {
    if (this.disposed || this.navigator.pgnPath.length === 0) return;

    hidePromotionPopup();
    playSound("move");

    const currentNode = this.navigator.getNodeAtPath();
    if (currentNode?.isOriginal === false) {
      this.navigator.removeNodeAtPath();
    } else {
      this.navigator.pgnPath.pop();
    }

    this.updateChess();
    this.updateBoard();
    this.updatePgnArrows();
  }

  moveForward() {
    if (this.disposed) return;
    const children = this.navigator.getChildrenAtPath();
    if (children.length === 0) return;

    hidePromotionPopup();
    this.navigator.pgnPath.push(0);

    changeAudio(this.navigator.getNodeAtPath());
    this.updateChess();
    this.updateBoard();
    this.updatePgnArrows();
  }

  resetBoard() {
    if (this.disposed) return;
    hidePromotionPopup();
    playSound("move");

    while (this.navigator.pgnPath.length > 0) {
      const currentNode = this.navigator.getNodeAtPath();
      if (currentNode?.isOriginal === false) {
        this.navigator.removeNodeAtPath();
      } else {
        this.navigator.pgnPath.pop();
      }
    }

    this.updateChess();
    this.updateBoard();
    this.updatePgnArrows();
  }

  updateChess() {
    const node = this.navigator.getNodeAtPath();
    if (!node) {
      this.chess.load(this.pgn.tags.FEN);
      return;
    }
    this.chess.load(node.fenAfter);
  }

  updatePgnArrows() {
    if (this.disposed || !this.cg) return;

    const children = this.navigator.getChildrenAtPath();
    const arrows = children
      .filter(node => node.isOriginal === true)
      .map(node => ({
        orig: node.from,
        dest: node.to,
        brush: "green",
      }));

    this.cg.set({
      drawable: { autoShapes: arrows },
    });
  }

  updateBoard() {
    if (this.disposed || !this.cg) return;

    this.cg.set({
      fen: this.chess.fen(),
      orientation: this.orientation,
      turnColor: cgTurnColor(this.chess),
      lastMove: this.getLastMove(),

      movable: {
        color: "both",
        free: false,
        dests: legalDests(this.chess),
      },
    });

    this.updateNavigationButtons();
  }

  getLastMove() {
    const node = this.navigator.getNodeAtPath();
    if (!node) return undefined;
    return [node.from, node.to];
  }

  createNavigation() {
    const buttons = this.el.querySelector("#postboard") || document.getElementById("postboard");
    if (!buttons) return;

    buttons.replaceChildren();

    const resetBoardButton = document.createElement("button");
    resetBoardButton.className = "navBtn";
    resetBoardButton.id = "resetBoard";
    resetBoardButton.title = "Back to start";
    const resetIcon = document.createElement("span");
    resetIcon.className = "material-icons";
    resetIcon.textContent = "first_page";
    resetBoardButton.appendChild(resetIcon);

    const navBackwardButton = document.createElement("button");
    navBackwardButton.className = "navBtn";
    navBackwardButton.id = "navBackward";
    navBackwardButton.title = "One move back";
    const backwardIcon = document.createElement("span");
    backwardIcon.className = "material-icons";
    backwardIcon.textContent = "keyboard_arrow_left";
    navBackwardButton.appendChild(backwardIcon);

    const navForwardButton = document.createElement("button");
    navForwardButton.className = "navBtn";
    navForwardButton.id = "navForward";
    navForwardButton.title = "One move forward";
    const forwardIcon = document.createElement("span");
    forwardIcon.className = "material-icons";
    forwardIcon.textContent = "keyboard_arrow_right";
    navForwardButton.appendChild(forwardIcon);

    const rotateBoardButton = document.createElement("button");
    rotateBoardButton.className = "navBtn";
    rotateBoardButton.id = "rotateBoard";
    rotateBoardButton.title = "Flip board";
    const rotateBoardIcon = document.createElement("span");
    rotateBoardIcon.className = "flipBoardIcon material-icons";
    rotateBoardIcon.textContent = "sync";
    rotateBoardButton.appendChild(rotateBoardIcon);

    const lichessButton = document.createElement("button");
    lichessButton.className = "navBtn";
    lichessButton.id = "lichessAnalysis";
    lichessButton.title = "Open Lichess Analysis";

    fetch("assets/images/lichess.svg")
      .then((response) => response.text())
      .then((svgText) => {
        if (this.disposed) return;
        lichessButton.innerHTML = svgText;
        const svgEl = lichessButton.querySelector("svg");
        if (svgEl) svgEl.classList.add("lichess-icon");
      })
      .catch((err) => console.error("Failed to load Lichess SVG:", err));

    const stockfishButton = document.createElement("button");
    stockfishButton.className = "navBtn";
    stockfishButton.id = "stockfishToggle";
    stockfishButton.title = "Computer Analysis";

    fetch("assets/images/stockfish.svg")
      .then((response) => response.text())
      .then((svgText) => {
        if (this.disposed) return;
        stockfishButton.innerHTML = svgText;
        const svgEl = stockfishButton.querySelector("svg");
        if (svgEl) svgEl.classList.add("stockfish-icon");
      })
      .catch((err) => console.error("Failed to load Stockfish SVG:", err));

    buttons.appendChild(resetBoardButton);
    buttons.appendChild(navBackwardButton);
    buttons.appendChild(navForwardButton);
    buttons.appendChild(lichessButton);

    resetBoardButton.addEventListener("click", () => this.resetBoard());
    navBackwardButton.addEventListener("click", () => this.moveBackward());
    navForwardButton.addEventListener("click", () => this.moveForward());
    lichessButton.addEventListener("click", () => this.openLichessAnalysis());
    stockfishButton.addEventListener("click", () => this.toggleAnalysis());
    rotateBoardButton.addEventListener("click", () => this.rotateBoard());
  }

  updateNavigationButtons() {
    const reset = this.el.querySelector("#resetBoard") || document.getElementById("resetBoard");
    const back = this.el.querySelector("#navBackward") || document.getElementById("navBackward");
    const forward = this.el.querySelector("#navForward") || document.getElementById("navForward");

    const atStart = this.navigator.pgnPath.length === 0;
    const hasForwardMove = this.navigator.getChildrenAtPath().length > 0;

    if (reset) reset.disabled = atStart;
    if (back) back.disabled = atStart;
    if (forward) forward.disabled = !hasForwardMove;
  }

  openLichessAnalysis() {
    const fen = this.chess.fen();
    const url = `https://lichess.org/analysis/standard/${encodeURIComponent(fen)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  toggleAnalysis() {
    const button = this.el.querySelector("#stockfishToggle") || document.getElementById("stockfishToggle");
    if (button) {
      button.classList.toggle("active-toggle");
    }
  }

  rotateBoard() {
    this.orientation = this.orientation === "white" ? "black" : "white";
    if (this.cg) this.cg.set({ orientation: this.orientation });
  }

  createContinueButton(onContinue) {
    const preboardMiddle = this.el.querySelector(".preboard-middle") || document.querySelector(".preboard-middle");
    if (!preboardMiddle) return false;

    this.advanceButton = document.createElement("button");
    this.advanceButton.textContent = "Continue";
    this.advanceButton.className = "continueBtn";

    this.advanceButton.addEventListener("click", () => {
      onContinue();
    });

    preboardMiddle.appendChild(this.advanceButton);
    return true;
  }

  cleanupViewer() {
    if (this.disposed) return;
    this.disposed = true;

    if (this.advanceButton) {
      this.advanceButton.remove();
      this.advanceButton = null;
    }

    const postboard = this.el.querySelector("#postboard") || document.getElementById("postboard");
    if (postboard) {
      postboard.innerHTML = "";
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

  onAbortViewer() {
    if (this.disposed) return;
    console.log("VIEWER ABORTED");
    this.cleanupViewer();
    if (this.resolvePuzzle) {
      this.resolvePuzzle();
    }
  }

  getFen() {
    return this.chess?.fen() ?? null;
  }
}

export function runViewer(el, loadedPgn, options = {}) {
  const session = new PuzzleViewerSession(el, loadedPgn, options);
  return session.start();
}

