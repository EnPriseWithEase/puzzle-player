export function createPuzzleTimer() {

  const preboard = document.getElementById("preboard");

  const timer = document.createElement("span");

  timer.id = "puzzle-timer";
  timer.textContent = "00:00";

  preboard.appendChild(timer);

  return timer;
}

export function startPuzzleTimer(timerElement) {

  const start = Date.now();

  const interval = setInterval(() => {

    const elapsed = Date.now() - start;

    timerElement.textContent =
      formatTime(elapsed);

  }, 1000);

  return {
    stop() {
      clearInterval(interval);

      const elapsed = Date.now() - start;

      timerElement.textContent =
        formatTime(elapsed);

      return elapsed;
    }
  };
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

