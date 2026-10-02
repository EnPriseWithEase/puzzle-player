import { Chess } from "chess.js";
import { Chessground } from "chessground";

import { pgnPath, setPath, getNodeAtPath, getChildrenAtPath, findMatchingChildIndex, addNodeToPath, createNode, removeNodeAtPath } from "./pgn";
import { cgTurnColor, legalDests, handleMoveWithPromotion, handleClickMoveWithPromotion } from "./util"
import { changeAudio, playSound } from "./audio";

let cg;
let chess;
let pgn;
let orientation = "white";
let resolvePuzzle;
let advanceButton = null;
let currentAbortSignal;
let onAbortListener = null;

export function runViewer(el, loadedPgn, options={}, signal = null) {
  return new Promise(resolve => {

    console.log("IN VIEWER");

    currentAbortSignal = signal;

    if (currentAbortSignal?.aborted) {
      resolve();
      return;
    }

    resolvePuzzle = resolve;

    pgn = loadedPgn;

    chess = new Chess(pgn.tags.FEN);

    window.chess = chess;

    orientation = "white";

    setPath([]);

    if (currentAbortSignal) {
      onAbortListener = onAbortViewer;
      signal.addEventListener("abort", onAbortListener, { once: true });
    }

    cg = Chessground(el, {
      fen: chess.fen(),
      orientation: orientation,
      turnColor: cgTurnColor(chess),

      movable: {
        color: "both",
        free: false,
        dests: legalDests(chess),

        events: {
          after(orig, dest) {
            handleMoveWithPromotion(chess, orig, dest, handleMove);
          },
        },
      },

      draggable: {
        showGhost: true,
      },

      events: {
        select(dest) {
          handleClickMoveWithPromotion(chess, cg, dest, handleMove);
        }
      },

      drawable: {
        enabled: true,
        visible: true,
        autoShapes: [],
        shapes: [],
      },
    });

    const board = el.querySelector("cg-board");
    board.classList.add(`border-${cgTurnColor(chess)}`);

    window.cg = cg;

    createNavigation();

    updateBoard();
    updatePgnArrows();

    createContinueButton(() => {
      cleanupViewer();
      resolve();
    });
  });
}

export function closeViewer() {
  if (currentAbortSignal?.aborted) return;

  cleanupViewer();

  if (resolvePuzzle) resolvePuzzle();
}


function handleMove(orig, dest, promotion = undefined) {

  const matchingIndex = findMatchingChildIndex(
    orig,
    dest,
    promotion
  );

  if (matchingIndex !== null) {

    const children = getChildrenAtPath();
    const node = children[matchingIndex];

    chess.load(node.fenAfter);

    pgnPath.push(matchingIndex);

    changeAudio(getNodeAtPath(pgnPath));

    updateBoard();
    updatePgnArrows();

    return;
  }

  // not in tree, create temporary user node
  const node = createNode(chess, orig, dest, promotion);

  addNodeToPath(node);

  changeAudio(node);

  updateChess();
  updateBoard();
  updatePgnArrows();
}

function moveBackward() {

  if (pgnPath.length === 0) {
    return;
  }

  playSound("move");

  const currentNode = getNodeAtPath();

  if (currentNode?.isOriginal === false) {
    removeNodeAtPath();
  } else {
    pgnPath.pop();
  }

  updateChess();
  updateBoard();
  updatePgnArrows();
}


// move forward in mainline
function moveForward() {

  const children = getChildrenAtPath();

  if (children.length === 0) {
    return;
  }

  pgnPath.push(0);

  changeAudio(getNodeAtPath());

  updateChess();
  updateBoard();
  updatePgnArrows();
}

// reset to starting fen 
function resetBoard() {

  playSound("move");

  // remove temporary nodes
  while (pgnPath.length > 0) {

    const currentNode = getNodeAtPath();

    if (currentNode?.isOriginal === false) {
      removeNodeAtPath();
    } else {
      pgnPath.pop();
    }
  }

  updateChess();
  updateBoard();
  updatePgnArrows();
}

function updateChess() {

  const node = getNodeAtPath();

  if (!node) {
    chess.load(pgn.tags.FEN);
    return;
  }

  chess.load(node.fenAfter);
}

// green arrows for pgn moves
function updatePgnArrows() {

  if (!cg) {
    return;
  }

  const children = getChildrenAtPath();

  const arrows = children
    .filter(node => node.isOriginal === true)
    .map(node => ({
      orig: node.from,
      dest: node.to,
      brush: "green",
    }));

  cg.set({
    drawable: {
      autoShapes: arrows,
    },
  });
}


function updateBoard() {

  cg.set({
    fen: chess.fen(),
    orientation: orientation,
    turnColor: cgTurnColor(chess),
    lastMove: getLastMove(chess),

    movable: {
      color: "both",
      free: false,
      dests: legalDests(chess),
    },
  });

  updateNavigationButtons();
}

function getLastMove() {
  const node = getNodeAtPath();

  if (!node) {
    return undefined;
  }

  return [node.from, node.to];
}

function createNavigation() {

  const buttons = document.getElementById("postboard");

  buttons.innerHTML = `
    <button
      class="navBtn"
      id="resetBoard"
      title="Back to start"
      aria-label="Back to start"
    >
      <span class="material-icons">first_page</span>
    </button>

    <button
      class="navBtn"
      id="navBackward"
      title="One move back"
      aria-label="One move back"
    >
      <span class="material-icons">keyboard_arrow_left</span>
    </button>

    <button
      class="navBtn"
      id="navForward"
      title="One move forward"
      aria-label="One move forward"
    >
      <span class="material-icons">keyboard_arrow_right</span>
    </button>

    <button
      class="navBtn"
      id="openLichessAnalysis"
      title="Copy FEN to clipboard OR Open Lichess Analysis"
      aria-label="Copy FEN to clipboard OR Open Lichess Analysis"
    >
      <span class="material-icons md-small">content_copy</span>
    </button>

    <button
      class="navBtn"
      id="stockfishToggle"
      title="Computer Analysis"
      aria-label="Computer Analysis"
    >
      <span class="material-icons md-small">developer_board_off</span>
    </button>

    <button
      class="navBtn"
      id="rotateBoard"
      title="Flip board"
      aria-label="Flip board"
    >
      <span class="flipBoardIcon material-icons md-small">flip</span>
    </button>
  `;

  buttons
    .querySelector("#resetBoard")
    .addEventListener("click", resetBoard);

  buttons
    .querySelector("#navBackward")
    .addEventListener("click", moveBackward);

  buttons
    .querySelector("#navForward")
    .addEventListener("click", moveForward);

  buttons
    .querySelector("#openLichessAnalysis")
    .addEventListener("click", openLichessAnalysis);

  buttons
    .querySelector("#stockfishToggle")
    .addEventListener("click", toggleAnalysis);

  buttons
    .querySelector("#rotateBoard")
    .addEventListener("click", rotateBoard);
}


function updateNavigationButtons() {

  const reset =
    document.getElementById("resetBoard");

  const back =
    document.getElementById("navBackward");

  const forward =
    document.getElementById("navForward");

  const atStart =
    pgnPath.length === 0;

  const hasForwardMove =
    getChildrenAtPath().length > 0;

  if (reset) {
    reset.disabled = atStart;
  }

  if (back) {
    back.disabled = atStart;
  }

  if (forward) {
    forward.disabled = !hasForwardMove;
  }
}

async function copyFen() {

  try {

    await navigator.clipboard.writeText(
      chess.fen()
    );

    const button =
      document.getElementById("copyFen");

    const icon =
      button?.querySelector(".material-icons");

    if (!icon) {
      return;
    }

    icon.textContent = "check";

    setTimeout(() => {
      icon.textContent = "content_copy";
    }, 1000);

  } catch (error) {

    console.error(
      "Could not copy FEN:",
      error
    );
  }
}

function openLichessAnalysis() {

  const fen = chess.fen();

  const url =
    `https://lichess.org/analysis/standard/${encodeURIComponent(fen)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

// placeholder
function toggleAnalysis() {

  console.log(
    "Computer analysis placeholder"
  );

  const button =
    document.getElementById(
      "stockfishToggle"
    );

  if (button) {
    button.classList.toggle(
      "active-toggle"
    );
  }
}


function rotateBoard() {

  orientation = orientation === "white" ? "black" : "white";

  cg.set({
    orientation: orientation,
  });
}


function createContinueButton(onContinue) {
  const preboardMiddle = document.querySelector(".preboard-middle");

  advanceButton = document.createElement("button");

  advanceButton.textContent = "Continue";
  advanceButton.className = "continueBtn";

  advanceButton.addEventListener("click", () => {
    onContinue();
  });

  preboardMiddle.appendChild(advanceButton);
}

function cleanupViewer() {
  if (advanceButton) {
    advanceButton.remove();
    advanceButton = null;
  }

  const postboard = document.getElementById("postboard");
  if (postboard) {
    postboard.innerHTML = "";
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

function onAbortViewer() {
  console.log("VIEWER ABORTED");
  cleanupViewer();
  if (resolvePuzzle) {
    resolvePuzzle();
  }
}

