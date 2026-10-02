import { exportDatabase } from "./database";
import {
  getDeckPuzzles,
  getDecks,
  writeReview,
  updateDeckPuzzleStatus,
} from "./database-usage";
import { loadPgn } from "./pgn";
import { runPuzzle } from "./puzzle-standard";
import { runCandidatePuzzle } from "./puzzle-candidates";
import { runViewer } from "./puzzle-viewer";
import { createPuzzleTimer, startPuzzleTimer } from "./timer";
import { initAudio, setAudioMuted, isAudioMuted } from "./audio";
import { showDeckPicker } from "./deck-selection";
import { reviewSession } from "./review";

let puzzles = [];
let puzzleIndex = 0;
let currentDeckId = null;
let currentDeckConfig = null;
let puzzleSession = 0;
let currentAbortController = null;

export async function run(element) {
  initAudio(false);

  createMenu(element);

  await showDeckPicker(element, startDeck);
}

async function startDeck(deckId, element) {

  // Cancel any running puzzle immediately
  if (currentAbortController) {
    currentAbortController.abort();
  }

  const session = ++puzzleSession;

  currentDeckId = deckId;

  const decks = await getDecks();
  const deck = decks.find(deck => deck.id === deckId);

  currentDeckConfig = deck.config ?? {};

  puzzles = await getDeckPuzzles(deckId);

  window.puzzles = puzzles;

  if (session !== puzzleSession) {
    return;
  }

  if (puzzles.length === 0) {
    return;
  }

  if (currentDeckConfig.review_order === "random") {
    shuffle(puzzles);
  }

  puzzleIndex = 0;

  await startPuzzles(element, session);

  if (session === puzzleSession) {
    await showDeckPicker(element, startDeck);
  }
}

async function startPuzzles(element, session) {
  while ( puzzleIndex < puzzles.length && session === puzzleSession) {

    currentAbortController = new AbortController();
    const abortSignal = currentAbortController.signal;

    const section = document.createElement("section");
    section.className = "blue merida";

    const cgWrap = document.createElement("div");
    cgWrap.className = "cg-wrap";

    section.appendChild(cgWrap);
    element.replaceChildren(section);

    //document.getElementById("preboard")?.replaceChildren();
    //document.getElementById("buttons-container")?.replaceChildren();

    const puzzle = puzzles[puzzleIndex];

    console.log("STARTPUZZLES", puzzleIndex, puzzles.length);
    console.log("PGN", puzzle.pgn);

    const pgn = loadPgn(puzzle.pgn);

    window.pgn = pgn;

    const timerElement = createPuzzleTimer();
    const timer = startPuzzleTimer(timerElement);
    const puzzleIdElement = document.createElement("span");

    puzzleIdElement.id = "puzzle-id";
    puzzleIdElement.textContent = `#${puzzle.id}`;

    const preboardRight = document.querySelector(".preboard-right");
    preboardRight.replaceChildren(timerElement, puzzleIdElement);
    reviewSession.initialize(
      puzzle.id,
      currentDeckConfig.puzzle_type
    );

    let solutionRequested = false;

    const onViewSolution = () => {
      if (solutionRequested) return;
      solutionRequested = true;
      timer.stop();
      reviewSession.markIncorrect();
    };

    if (currentDeckConfig.puzzle_type === "candidates") {
      await runCandidatePuzzle(cgWrap, pgn, {onViewSolution, abortSignal});

    } else if (currentDeckConfig.puzzle_type === "standard") {
      await runPuzzle(cgWrap, pgn, {onViewSolution,abortSignal});

    }

    // User may have switched decks while the puzzle was running.
    if (session !== puzzleSession || abortSignal.aborted) {
      timer.stop();
      return;
    }

    timer.stop();

    const review = reviewSession.getResult();

    console.log("REVIEW:", review);

    await writeReview(review);

    await updatePuzzleStatus(puzzle.id, review);

    if (session !== puzzleSession || abortSignal.aborted) return;

    await runViewer(cgWrap, pgn, {abortSignal});

    if (session !== puzzleSession || abortSignal.aborted) return;

    puzzleIndex++;
  }

  if (session === puzzleSession) {
    console.log("DECK COMPLETE");
  }
}

async function updatePuzzleStatus(puzzleId, review) {
  const retain = currentDeckConfig.retain;

  if (retain === "all") {
    return;
  }

  if (retain === "none") {
    await updateDeckPuzzleStatus(
      currentDeckId,
      puzzleId,
      "reviewed"
    );
    return;
  }

  if (retain === "incorrect") {
    if (review.result === 1) {
      await updateDeckPuzzleStatus(
        currentDeckId,
        puzzleId,
        "reviewed"
      );
    }

    return;
  }

  throw new Error(`Unknown retain setting: ${retain}`);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createMenu(element) {
  const preboardLeft = document.querySelector(".preboard-left");

  const menu = document.createElement("div");
  menu.id = "menu";

  const decksButton = document.createElement("button");
  decksButton.type = "button";
  decksButton.className = "menu-item";
  decksButton.textContent = "♟";
  decksButton.setAttribute("aria-label", "Decks");
  decksButton.title = "Decks";

  decksButton.addEventListener("click", async () => {
    await showDeckPicker(element, startDeck);
  });

  const audioButton = document.createElement("button");
  audioButton.type = "button";
  audioButton.className = "menu-item";

  function updateAudioButton() {
    const muted = isAudioMuted();

    audioButton.textContent = muted ? "🔇" : "🔊";
    audioButton.setAttribute(
      "aria-label",
      muted ? "Unmute audio" : "Mute audio"
    );
    audioButton.title = muted ? "Unmute audio" : "Mute audio";
  }

  updateAudioButton();

  audioButton.addEventListener("click", () => {
    setAudioMuted(!isAudioMuted());
    updateAudioButton();
  });

  const exportButton = document.createElement("button");
  exportButton.type = "button";
  exportButton.className = "menu-item";
  exportButton.textContent = "💾";
  exportButton.setAttribute("aria-label", "Export database");
  exportButton.title = "Export database";

  exportButton.addEventListener("click", async () => {
    await exportDatabase();
  });

  menu.appendChild(decksButton);
  menu.appendChild(audioButton);
  menu.appendChild(exportButton);

  preboardLeft.appendChild(menu);
}

