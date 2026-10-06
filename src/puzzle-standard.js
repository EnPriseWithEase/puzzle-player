import { Chess } from "chess.js";
import { Chessground } from "chessground";

import { pgnPath, findMatchingChildIndex, getChildrenAtPath, getNodeAtPath, setPath } from "./pgn";
import { reviewSession } from "./review";
import { cgTurnColor, legalDests, handleMoveWithPromotion, handleClickMoveWithPromotion, createViewSolutionButton } from "./util"
import { changeAudio, playSound } from "./audio";

let cg;
let chess;
let promotion;
let pgn;
let resolvePuzzle;
let viewSolutionButtonClicked;
let advanceButton;
let currentAbortSignal = null;
let onAbortListener = null;
let isProcessingMove = false;

export function runPuzzle(el, loadedPgn, options = {}) {
  return new Promise(resolve => {

    console.log("IN PUZZLE-STANDARD");

    const {
	abortSignal = null,
        opponentMovesFirst = false,
        onViewSolution = null,
    } = options;

    currentAbortSignal = abortSignal;
    viewSolutionButtonClicked = false;

    if (currentAbortSignal?.aborted) {
      resolve();
      return;
    }

    resolvePuzzle = resolve;

    pgn = loadedPgn;

    setPath([]);

    chess = new Chess(pgn.tags.FEN);
    window.chess = chess;

    if (currentAbortSignal) {
      onAbortListener = onAbort;
      currentAbortSignal.addEventListener("abort", onAbortListener, { once: true });
    }

    cg = Chessground(el, {
      fen: chess.fen(),
      turnColor: cgTurnColor(chess),

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

    // test
    //window.addEventListener("resize", () => {
    //  cg.redraw();
    //});


    const boardSection = document.querySelector("#board section"); 
    boardSection.classList.remove("border-white", "border-black");
    boardSection.classList.add(`border-${cgTurnColor(chess)}`);
    //const board = el.querySelector("cg-board");
    //board.classList.add(`border-${cgTurnColor(chess)}`);

    advanceButton = createViewSolutionButton(
      onViewSolution,
      () => {
        viewSolutionButtonClicked = true;
	cleanup();
        resolvePuzzle();
      }
    );

    //// this is untested
    // if (opponentMovesFirst) {
    //   makeOpponentMove();
    //   updateBoard();
    // }
	  
    window.cg = cg;

  });
}

async function handleMove(orig, dest, promotion = undefined) {
  if (currentAbortSignal?.aborted) {
    return;
  }

  const moveIsCorrect = makePlayerMove(orig, dest, promotion);

  if (!moveIsCorrect) {
    reviewSession.logAttempt(false, chess, orig, dest, promotion);
    playSound("error");
 
    resetBoard();
    return;
  }

  
  if (isSolved()) {
    reviewSession.logAttempt(true);
    finishPuzzle();
    return;
  }

  // delay to separate sounds
  await new Promise(resolve => setTimeout(resolve, 400));

  if (viewSolutionButtonClicked || currentAbortSignal?.aborted) {
    return;
  }

  makeOpponentMove();
  updateBoard();

  if (isSolved()) {
    reviewSession.logAttempt(true);
    finishPuzzle();
    return;
  }
}

function makePlayerMove(orig, dest, promotion) {
  
  const index = findMatchingChildIndex(orig, dest, promotion);

  // wrong move
  if (index === null) {
    return false;
  }

  // correct move
  pgnPath.push(index);

  const move = chess.move({
    from: orig,
    to: dest,
    promotion,
  });

  changeAudio(move);

  if (promotion !== undefined) {
    cg.set({
      fen: chess.fen(),
    });
  }

  return true;

}

function makeOpponentMove() {
  // choose randomly among variations
  const children = getChildrenAtPath();

  if (children.length === 0) {
    return false;
  }

  const index = Math.floor(Math.random() * children.length);
  const node = children[index];

  pgnPath.push(index);

  const move = chess.move({
    from: node.from,
    to: node.to,
  });

  changeAudio(move);

  cg.move(node.from, node.to);

  return true;

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

  const playerColor = cgTurnColor(chess);
  const playerDests = legalDests(chess);

  cg.set({
    fen: chess.fen(),
    turnColor: playerColor,
    movable: {
      color: playerColor,
      free: false,
      dests: playerDests,
    },
  });
}

function isSolved() {
  const node = getNodeAtPath();
  return !!node && node.children?.length === 0;
}

async function finishPuzzle() {
  if (advanceButton) {
    advanceButton.disabled = true;
  }
  // pause for visual and audio effect
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (currentAbortSignal?.aborted) return;

  cleanup();
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
  console.log("STANDARD ABORTED");
  cleanup();
  if (resolvePuzzle) {
    resolvePuzzle();
  }
}

export function getFen() {
  return chess.fen();
}

