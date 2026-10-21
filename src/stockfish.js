export function createStockfish({
  workerPath = "/assets/stockfish/stockfish-19-lite-single.js",
  engineOptions = {},
} = {}) {
  let worker = null;
  let initPromise = null;
  let activeSearch = null;
  let destroyed = false;

  function send(command) {
    if (!worker || destroyed) {
      throw new Error("Stockfish worker is not available");
    }

    worker.postMessage(command);
  }

  function parseBestMove(message) {
    const match = message.match(
      /^bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/
    );

    if (!match) return null;

    const uci = match[1];

    if (uci === "(none)" || uci === "0000") {
      return null;
    }

    const moveMatch = uci.match(
      /^([a-h][1-8])([a-h][1-8])([qrbn])?$/
    );

    if (!moveMatch) return null;

    return {
      from: moveMatch[1],
      to: moveMatch[2],
      ...(moveMatch[3]
        ? { promotion: moveMatch[3] }
        : {}),
      uci,
    };
  }

  function parseEvaluation(message, fen) {
    // Use the most recent score in the current search.
    const matches = [
      ...message.matchAll(
        /\bscore\s+(cp|mate)\s+(-?\d+)\b/g
      ),
    ];

    if (!matches.length) return null;

    const [, type, rawValue] = matches[matches.length - 1];
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
      // Keep the latest usable score, preferring deeper searches.
      const evaluation = parseEvaluation(message, search.fen);

      if (evaluation) {
        const depthMatch = message.match(/\bdepth\s+(\d+)/);
        const depth = depthMatch ? Number(depthMatch[1]) : 0;

        if (depth >= search.latestDepth) {
          search.latestDepth = depth;
          search.evaluation = evaluation;
        }
      }

      return;
    }

    if (message.startsWith("bestmove ")) {
      activeSearch = null;

      search.resolve({
        bestMove: parseBestMove(message),
        evaluation: search.evaluation,
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
          for (const [name, value] of Object.entries(engineOptions)) {
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

        if (initPromise) {
          initPromise.reject?.(error);
        }

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
        evaluation: null,
        latestDepth: -1,
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
  };
}

