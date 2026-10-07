import { exportDatabase, dbQuery } from "./database";
import { getDeckPuzzles, getDecks, writeReview, updateDeckPuzzleStatus, } from "./database-usage";
import { loadPgn } from "./pgn";
import { runPuzzle, getFen as getStandardFen } from "./puzzle-standard";
import { runCandidatePuzzle, getFen as getCandidatesFen } from "./puzzle-candidates";
import { runViewer, getFen as getViewerFen } from "./puzzle-viewer";
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
let puzzleID = null;
let getCurrentFen = null;
let timer;

export async function run(element) {
  initAudio(false);

  createMenu(element);

  puzzleID = Number( new URLSearchParams(window.location.search).get("puzzle"));

  if (puzzleID) {
    puzzles = await dbQuery(
      `SELECT id, pgn FROM puzzle WHERE id = ?`,
      { params: [puzzleID] }
    );

    currentDeckConfig = { puzzle_type: "standard", retain: "all" };

    puzzleIndex = 0;
    const session = ++puzzleSession;

    await startPuzzles(element, session);
    return;
  }

  await showDeckPicker(element, startDeck, suspendPuzzle);
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

  if (session === puzzleSession && !document.getElementById("deck-picker")) {
    await showDeckPicker(element, startDeck, suspendPuzzle);
  }
}

async function suspendPuzzle() {
  await updateDeckPuzzleStatus(
    currentDeckId,
    puzzles[puzzleIndex].id,
    "suspended"
  );

  // debug
  const suspendedPuzzles = await dbQuery(`
    SELECT * FROM deck_puzzle
    WHERE json_extract(config, '$.status') = ? `, { params: ["suspended"] }
  ); 
  console.log("SUSPENDED PUZZLES:", suspendedPuzzles);
  

  currentAbortController?.abort();
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

    //// handle timer
    const timerElement = createPuzzleTimer();
    timer = startPuzzleTimer(timerElement);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        timer.pause();
      } else {
        timer.resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const cleanupTimer = () => {
      document.removeEventListener( "visibilitychange", handleVisibilityChange);
      if (timer) {
        timer.stop();
        timer = null;
      }
    };

    //// create puzzle element
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
      cleanupTimer();
      reviewSession.markIncorrect();
    };

    if (currentDeckConfig.puzzle_type === "candidates") {
      getCurrentFen = getCandidatesFen;
      await runCandidatePuzzle(cgWrap, pgn, {onViewSolution, abortSignal});

    } else if (currentDeckConfig.puzzle_type === "standard") {
      getCurrentFen = getStandardFen;
      await runPuzzle(cgWrap, pgn, {onViewSolution,abortSignal});

    }

    // User may have switched decks while the puzzle was running.
    if (session !== puzzleSession || abortSignal.aborted) {
      cleanupTimer();
      return;
    }

    cleanupTimer();

    const review = reviewSession.getResult();

    console.log("REVIEW:", review);

    getCurrentFen = getViewerFen;

    await writeReview(review);

    await updatePuzzleStatus(puzzle.id, review);

    if (session !== puzzleSession || abortSignal.aborted) return;

    await runViewer(cgWrap, pgn, {abortSignal, reviewResult: review.result});

    if (session !== puzzleSession || abortSignal.aborted) return;

    //wrapper for debugging
    if (!puzzleID) {
    puzzleIndex++;
    }
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
  //decksButton.textContent = "\u{265F}";
  //decksButton.textContent = "\u{1F0A0}";
  //decksButton.textContent = "♟";
  decksButton.setAttribute("aria-label", "Decks");
  decksButton.title = "Decks";
  const decksButtonIcon = document.createElement("span");
  decksButtonIcon.className = "material-icons md-small material-icons-menu-icon";
  decksButtonIcon.textContent = "playing_cards";
  decksButton.appendChild(decksButtonIcon);

  decksButton.addEventListener("click", async () => {
    timer?.pause();
    await showDeckPicker(element, startDeck, suspendPuzzle);
    if (!document.hidden) { timer?.resume(); }
  });

  const audioButton = document.createElement("button");
  audioButton.type = "button";
  audioButton.className = "menu-item";

  //const audioButtonIcon = document.createElement("span");
  //audioButtonIcon.className = "material-icons md-small material-icons-menu-icon";
  //audioButton.appendChild(audioButtonIcon);

  function updateAudioButton() {
    const muted = isAudioMuted();

    audioButton.textContent = muted ? "\u{1F507}" : "\u{1F50A}";
    //audioButton.textContent = muted ? "🔇" : "🔊";
    //audioButtonIcon.textContent = muted ? "volume_off" : "volume_up";

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
  //exportButton.textContent = "\u{1F4BE}";
  //exportButton.textContent = "💾";
  exportButton.setAttribute("aria-label", "Export database");
  exportButton.title = "Export database";
  const exportButtonIcon = document.createElement("span");
  exportButtonIcon.className = "material-icons md-small material-icons-menu-icon";
  exportButtonIcon.textContent = "download";
  exportButton.appendChild(exportButtonIcon);

  exportButton.addEventListener("click", async () => {
    await exportDatabase();
  });

  menu.appendChild(decksButton);
  menu.appendChild(audioButton);
  menu.appendChild(exportButton);

  preboardLeft.appendChild(menu);
}

