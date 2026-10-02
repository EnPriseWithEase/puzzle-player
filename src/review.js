import { getVariation, formatVariation, createNode } from "./pgn";

export const reviewSession = {
  puzzle: null,
  type: null,
  inittime: null,
  result: null,
  numright: 0,
  numwrong: 0,
  elapsed: null,
  attempts: [],

  initialize(puzzle, type) {
    this.puzzle = puzzle;
    this.type = type;
    this.inittime = Date.now();
    this.result = null;
    this.numright = 0;
    this.numwrong = 0;
    this.elapsed = null;
    this.attempts = [];
  },

  logAttempt(correct, chess, orig, dest, promotion) {
    const nodes = getVariation();
    const node = chess ? createNode(chess, orig, dest, promotion) : null;

    if (node) { nodes.push(node) }

    const attempt = formatVariation(nodes);

    const elapsed = Date.now() - this.inittime;

    this.attempts.push({ attempt, correct, elapsed });

    if (correct) {
      this.numright++;
    } else {
      this.numwrong++;
    }
  },

  markIncorrect() {
    this.result = 0;
  },

  // Finish and prepare data for the database
  getResult() {
    if (this.result === null) {
      this.result = this.numwrong ? 0 : 1;
    }
    return {
      puzzle: this.puzzle,
      type: this.type,
      inittime: this.inittime,
      result: this.result,
      numright: this.numright,
      numwrong: this.numwrong,
      elapsed: Date.now() - this.inittime,
      attempts: this.attempts,
    };
  }
};

