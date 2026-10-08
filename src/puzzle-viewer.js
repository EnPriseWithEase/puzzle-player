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
let boardLocked;

export function runViewer(el, loadedPgn, options={}) {
  return new Promise(resolve => {

    console.log("IN VIEWER");

    const {
        abortSignal = null,
        reviewResult = null,
    } = options;

    currentAbortSignal = abortSignal;
    boardLocked = false;

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
      currentAbortSignal.addEventListener("abort", onAbortListener, { once: true });
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
            boardLocked = true;
            handleMoveWithPromotion(chess, orig, dest, handleMove);
            // runs after events: select(dest) below to prevent move from being attempted twice
            setTimeout(() => { boardLocked = false; }, 0);
          },
        },
      },

      draggable: {
        showGhost: true,
      },

      events: {
        select(dest) {
          setTimeout(() => { // ensures this runs after events: after(orig, dest)
            if (boardLocked) return;
            handleClickMoveWithPromotion(chess, cg, dest, handleMove);
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

    const boardSection = document.querySelector("#board section");
    boardSection.classList.remove("border-white", "border-black");
    if (reviewResult === 0) {
        boardSection.classList.add("border-red");
    } else if (reviewResult === 1) {
        boardSection.classList.add("border-green");
    } else {
        boardSection.classList.add(`border-${cgTurnColor(chess)}`);
    }
    //const board = el.querySelector("cg-board");
    //board.classList.add(`border-${cgTurnColor(chess)}`);

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


async function handleMove(orig, dest, promotion = undefined) {
  boardLocked = true;

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
    boardLocked = false;

    return;
  }

  // not in tree, create temporary user node
  const node = createNode(chess, orig, dest, promotion);

  addNodeToPath(node);

  changeAudio(node);

  updateChess();
  updateBoard();
  updatePgnArrows();
  // prevents a standard orig-dest move from also immediately
  // triggering a click-to-move to the same square
  // for the opposite side
  // there may still be an issue during promotion?
  await new Promise(resolve => setTimeout(resolve, 0));

  boardLocked = false;
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

  buttons.replaceChildren();

  const resetBoardButton = document.createElement("button");
  resetBoardButton.className = "navBtn";
  resetBoardButton.id = "resetBoard";
  resetBoardButton.title = "Back to start";
  resetBoardButton.setAttribute("aria-label", "Back to start");

  const resetIcon = document.createElement("span");
  resetIcon.className = "material-icons";
  resetIcon.textContent = "first_page";
  resetBoardButton.appendChild(resetIcon);

  const navBackwardButton = document.createElement("button");
  navBackwardButton.className = "navBtn";
  navBackwardButton.id = "navBackward";
  navBackwardButton.title = "One move back";
  navBackwardButton.setAttribute("aria-label", "One move back");

  const backwardIcon = document.createElement("span");
  backwardIcon.className = "material-icons";
  backwardIcon.textContent = "keyboard_arrow_left";
  navBackwardButton.appendChild(backwardIcon);

  const navForwardButton = document.createElement("button");
  navForwardButton.className = "navBtn";
  navForwardButton.id = "navForward";
  navForwardButton.title = "One move forward";
  navForwardButton.setAttribute("aria-label", "One move forward");

  const forwardIcon = document.createElement("span");
  forwardIcon.className = "material-icons";
  forwardIcon.textContent = "keyboard_arrow_right";
  navForwardButton.appendChild(forwardIcon);

  const rotateBoardButton = document.createElement("button");
  rotateBoardButton.className = "navBtn";
  rotateBoardButton.id = "rotateBoard";
  rotateBoardButton.title = "Flip board";
  rotateBoardButton.setAttribute("aria-label", "Flip board");

  const rotateBoardIcon = document.createElement("span");
  rotateBoardIcon.className = "flipBoardIcon material-icons md-small";
  rotateBoardIcon.textContent = "sync";
  rotateBoardButton.appendChild(rotateBoardIcon);

  const lichessButton = document.createElement("button");
  lichessButton.className = "navBtn";
  lichessButton.id = "lichessAnalysis"
  lichessButton.title = "Open Lichess Analysis";
  lichessButton.setAttribute("aria-label", "Open Lichess Analysis");

  //const lichessIcon = document.createElement("img");
  //lichessIcon.src = "assets/images/lichess.svg";
  //lichessIcon.className = "lichess-icon";
  //lichessButton.appendChild(lichessIcon);

  fetch("assets/images/lichess.svg")
    .then((response) => response.text())
    .then((svgText) => {
      lichessButton.innerHTML = svgText;
      const svgEl = lichessButton.querySelector("svg");
        svgEl.classList.add("lichess-icon");
    })
    .catch((err) => console.error("Failed to load Lichess SVG:", err));

  const stockfishButton = document.createElement("button");
  stockfishButton.className = "navBtn";
  stockfishButton.id = "stockfishToggle";
  stockfishButton.title = "Computer Analysis";
  stockfishButton.setAttribute("aria-label", "Computer Analysis");

  fetch("assets/images/stockfish.svg")
    .then((response) => response.text())
    .then((svgText) => {
      stockfishButton.innerHTML = svgText;
      const svgEl = stockfishButton.querySelector("svg");
        svgEl.classList.add("stockfish-icon");
    })
    .catch((err) => console.error("Failed to load Stockfish SVG:", err));

  buttons.appendChild(resetBoardButton);
  buttons.appendChild(navBackwardButton);
  buttons.appendChild(navForwardButton);
  buttons.appendChild(lichessButton);
  //buttons.appendChild(stockfishButton);
  //buttons.appendChild(rotateBoardButton);

  resetBoardButton.addEventListener("click", resetBoard);
  navBackwardButton.addEventListener("click", moveBackward);
  navForwardButton.addEventListener("click", moveForward);
  lichessButton.addEventListener("click", openLichessAnalysis);
  stockfishButton.addEventListener("click", toggleAnalysis);
  rotateBoardButton.addEventListener("click", rotateBoard);
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
  const url = `https://lichess.org/analysis/standard/${encodeURIComponent(fen)}`;
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

export function getFen() {
  return chess.fen();
}

