
export function createStockfish({
  workerPath = "/assets/stockfish/stockfish-19-lite-single.js",
  engineOptions = {},
} = {}) {
  let worker = null;
  let initPromise = null;
  let activeSearch = null;
  let destroyed = false;

  let currentEngineOptions = { ...engineOptions };

  function send(command) {
    if (!worker || destroyed) {
      throw new Error("Stockfish worker is not available");
    }

    worker.postMessage(command);
  }

  function setOptions(options = {}) {
    if (destroyed) {
      throw new Error("Stockfish has been destroyed");
    }

    if (activeSearch) {
      throw new Error(
        "Cannot change engine options while a search is running"
      );
    }

    Object.assign(currentEngineOptions, options);

    // Options are stored now and sent during initialization.
    if (!worker || !initPromise) return;

    for (const [name, value] of Object.entries(options)) {
      send(`setoption name ${name} value ${value}`);
    }
  }

  function getOptions() {
    return { ...currentEngineOptions };
  }

  function parseBestMove(uci) {
    if (!uci || uci === "(none)" || uci === "0000") {
      return null;
    }

    const match = uci.match(
      /^([a-h][1-8])([a-h][1-8])([qrbn])?$/
    );

    if (!match) return null;

    return {
      from: match[1],
      to: match[2],
      ...(match[3] ? { promotion: match[3] } : {}),
      uci,
    };
  }

  function parseEvaluation(type, rawValue, fen) {
    const value = Number(rawValue);

    // UCI scores are from the root side-to-move perspective.
    // Normalize them to White's perspective.
    const whiteToMove = fen.trim().split(/\s+/)[1] === "w";
    const whiteSign = whiteToMove ? 1 : -1;

    if (type === "cp") {
      return {
        cp: value * whiteSign,
        mate: null,
        perspective: "white",
      };
    }

    return {
      cp: null,
      mate: value * whiteSign,
      perspective: "white",
    };
  }

  function parseInfo(message, fen) {
    // Bound scores are not exact evaluations.
    if (/\b(?:lowerbound|upperbound)\b/.test(message)) {
      return null;
    }

    const depthMatch = message.match(/\bdepth\s+(\d+)/);
    const multipvMatch = message.match(/\bmultipv\s+(\d+)/);

    const scoreMatches = [
      ...message.matchAll(
        /\bscore\s+(cp|mate)\s+(-?\d+)\b/g
      ),
    ];

    const pvMatch = message.match(/\bpv\s+(.+)$/);

    if (!depthMatch || !scoreMatches.length || !pvMatch) {
      return null;
    }

    const depth = Number(depthMatch[1]);
    const multipv = multipvMatch
      ? Number(multipvMatch[1])
      : 1;

    const [, type, rawValue] =
      scoreMatches[scoreMatches.length - 1];

    const evaluation = parseEvaluation(
      type,
      rawValue,
      fen
    );

    // Extract only valid UCI moves, ignoring trailing statistics.
    const pv = [];

    for (const token of pvMatch[1].trim().split(/\s+/)) {
      if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(token)) {
        break;
      }

      pv.push(token);
    }

    if (pv.length === 0) return null;

    const bestMove = parseBestMove(pv[0]);

    if (!bestMove) return null;

    return {
      multipv,
      depth,
      evaluation,
      pv,
      bestMove,
    };
  }

  function handleMessage(event) {
    const message = String(event.data).trim();

    if (message === "uciok") {
      initPromise?.uciResolve();
      return;
    }

    if (message === "readyok") {
      initPromise?.readyResolve();
      return;
    }

    const search = activeSearch;
    if (!search) return;

    if (message.startsWith("info ")) {
      const line = parseInfo(message, search.fen);

      if (!line) return;

      if (line.depth < search.currentDepth) {
        return;
      }

      // A new depth starts with multipv 1.
      if (
        line.depth > search.currentDepth ||
        (
          line.depth === search.currentDepth &&
          line.multipv === 1 &&
          search.currentLines.has(1)
        )
      ) {
        // Preserve the previous iteration's candidates.
        if (
          search.currentDepth >= 0 &&
          search.currentLines.size > 0
        ) {
          search.completedLines = [
            ...search.currentLines.values(),
          ];

          search.completedDepth = search.currentDepth;
        }

        search.currentDepth = line.depth;
        search.currentLines = new Map();
      }

      search.currentLines.set(line.multipv, line);

      return;
    }

    if (message.startsWith("bestmove ")) {
      activeSearch = null;

      // Use the final iteration when available.
      const lines = search.currentLines.size
        ? [...search.currentLines.values()].sort(
            (a, b) => a.multipv - b.multipv
          )
        : search.completedLines.sort(
            (a, b) => a.multipv - b.multipv
          );

      // The final bestmove message is authoritative.
      const bestMoveMatch = message.match(
        /^bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/
      );

      const bestMove = bestMoveMatch
        ? parseBestMove(bestMoveMatch[1])
        : null;

      // Evaluation comes from the first MultiPV candidate.
      const bestLine = lines.find(
        line => line.multipv === 1
      ) ?? null;

      search.resolve({
        bestMove,
        evaluation: bestLine?.evaluation ?? null,
        lines,
        depth: lines[0]?.depth ?? null,
        stopped: search.stopped,
      });
    }
  }

  function init() {
    if (destroyed) {
      return Promise.reject(
        new Error("Stockfish has been destroyed")
      );
    }

    if (initPromise) return initPromise.promise;

    worker = new Worker(workerPath);

    initPromise = {};

    initPromise.promise = new Promise((resolve, reject) => {
      initPromise.uciResolve = () => {
        try {
          for (const [name, value] of Object.entries(currentEngineOptions)) {
            send(`setoption name ${name} value ${value}`);
          }

          send("isready");
        } catch (error) {
          reject(error);
        }

        initPromise.readyResolve = () => resolve();
      };

      worker.onmessage = handleMessage;

      worker.onerror = (event) => {
        const error = new Error(
          event.message || "Stockfish worker error"
        );

        initPromise?.reject?.(error);

        if (activeSearch) {
          activeSearch.reject(error);
          activeSearch = null;
        }
      };

      initPromise.reject = reject;

      send("uci");
    });

    return initPromise.promise;
  }

  async function search(fen, {
    depth = 12,
    movetime = null,
  } = {}) {
    await init();

    if (destroyed) {
      throw new Error("Stockfish has been destroyed");
    }

    if (activeSearch) {
      throw new Error("A Stockfish search is already running");
    }

    return new Promise((resolve, reject) => {
      activeSearch = {
        fen,
        resolve,
        reject,
        currentDepth: -1,
        currentLines: new Map(),
        completedLines: [],
        completedDepth: -1,
        stopped: false,
      };

      try {
        send(`position fen ${fen}`);

        if (movetime != null) {
          send(`go movetime ${Math.max(1, movetime)}`);
        } else {
          send(`go depth ${Math.max(1, depth)}`);
        }
      } catch (error) {
        activeSearch = null;
        reject(error);
      }
    });
  }

  async function getBestMove(fen, options = {}) {
    const result = await search(fen, options);
    return result.bestMove;
  }

  async function evaluate(fen, options = {}) {
    const result = await search(fen, options);
    return result.evaluation;
  }

  function stop() {
    if (!activeSearch || destroyed) return;

    activeSearch.stopped = true;
    send("stop");
  }

  function destroy() {
    if (destroyed) return;

    destroyed = true;

    if (activeSearch) {
      activeSearch.reject(
        new Error("Stockfish worker was destroyed")
      );

      activeSearch = null;
    }

    worker?.terminate();
    worker = null;
    initPromise = null;
  }

  return {
    init,
    search,
    getBestMove,
    evaluate,
    stop,
    destroy,
    setOptions,
    getOptions,
  };
}

