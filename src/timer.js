export function createPuzzleTimer() {

  const preboard = document.getElementById("preboard");

  const timer = document.createElement("span");

  timer.id = "puzzle-timer";
  timer.textContent = "00:00";

  preboard.appendChild(timer);

  return timer;
}

export function formatTime(milliseconds) {

  const totalSeconds =
    Math.floor(milliseconds / 1000);

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function startPuzzleTimer(timerElement) {
  let start = Date.now();
  let elapsed = 0;
  let interval = null;
  let running = true;

  function update() {
    if (!running) return;

    elapsed = Date.now() - start + elapsed;
    start = Date.now();

    timerElement.textContent = formatTime(elapsed);
  }

  interval = setInterval(update, 1000);

  return {
    pause() {
      if (!running) return;

      // Save the time accumulated since the last start/resume.
      elapsed += Date.now() - start;

      running = false;
      clearInterval(interval);
      interval = null;

      timerElement.textContent = formatTime(elapsed);
    },

    resume() {
      if (running) return;

      start = Date.now();
      running = true;

      interval = setInterval(update, 1000);
    },

    stop() {
      if (running) {
        elapsed += Date.now() - start;
      }

      running = false;

      if (interval !== null) {
        clearInterval(interval);
        interval = null;
      }

      timerElement.textContent = formatTime(elapsed);

      return elapsed;
    }
  };
}

