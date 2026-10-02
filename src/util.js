import { Chess, SQUARES } from "chess.js";

const promotion = document.getElementById("promotion");

export function handleClickMoveWithPromotion(chess, cg, dest, onMove) {
  const orig = getUniqueOrigForDest(chess, dest);

  if (!orig) {
    return;
  }

  cg.move(orig, dest);
  handleMoveWithPromotion(chess, orig, dest, onMove);
}

export function isPromotion(chess, orig, dest) {
  const piece = chess.get(orig);

  if (!piece || piece.type !== "p") {
    return false;
  }

  return dest[1] === "1" || dest[1] === "8";
}

export function handleMoveWithPromotion(chess, orig, dest, onMove) {
  if (isPromotion(chess, orig, dest)) {
    showPromotionPopup(
      orig,
      dest,
      chess,
      promotion => onMove(orig, dest, promotion)
    );
  } else {
    onMove(orig, dest);
  }
}

export function showPromotionPopup(orig, dest, chess, onSelect) {
  const color = chess.get(orig).color;

  for (const piece of ["q", "r", "b", "n"]) {
    const button = promotion.querySelector(
      `[data-piece="${piece}"]`
    );

    const image = document.createElement("img");

    image.src =
      `assets/images/pieces/merida/${color}${piece.toUpperCase()}.svg`;

    button.replaceChildren(image);

    button.onclick = () => {
      hidePromotionPopup();
      onSelect(piece);
    };
  }

  promotion.classList.add("visible");
}

export function hidePromotionPopup() {
  promotion.classList.remove("visible");
}

export function legalDests(chess) {
  const dests = new Map();
  SQUARES.forEach((s) => {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length)
      dests.set(
        s,
        ms.map((m) => m.to),
      );
  });
  return dests;
}

export function cgTurnColor(chess) {
  return chess.turn() === "w" ? "white" : "black";
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getUniqueOrigForDest(chess, dest) {
  const dests = legalDests(chess);
  const origins = [];

  for (const [orig, destinations] of dests.entries()) {
    if (destinations.includes(dest)) {
      origins.push(orig);
    }
  }

  return origins.length === 1 ? origins[0] : null;
}

export function createViewSolutionButton(callback, finish) {

  const preboardMiddle = document.querySelector(".preboard-middle");

  const button = document.createElement("button");

  button.type = "button";
  button.textContent = "View the solution";
  button.className = "continueBtn";

  button.addEventListener("click", () => {
    button.disabled = true;
    callback();
    button.remove();
    finish();
  });

  preboardMiddle.appendChild(button);

  return button;
}

