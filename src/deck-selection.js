import { getDecks, resetDeck } from "./database-usage";

export async function showDeckPicker(element, onDeckSelected) {
  const overlay = document.createElement("div");
  overlay.id = "deck-picker";

  const panel = document.createElement("div");
  panel.className = "deck-picker-panel";

  const header = document.createElement("div");
  header.className = "deck-picker-header";

  const title = document.createElement("div");
  title.textContent = "Decks";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "deck-picker-close";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Close");

  header.appendChild(title);
  header.appendChild(closeButton);

  const list = document.createElement("div");
  list.className = "deck-list";

  panel.appendChild(header);
  panel.appendChild(list);
  overlay.appendChild(panel);

  document.getElementById("puzzlebox").appendChild(overlay);

  closeButton.addEventListener("click", () => {
    overlay.remove();
  });

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      overlay.remove();
    }
  });

  await refreshDeckList(
    list,
    element,
    overlay,
    onDeckSelected
  );
}

async function refreshDeckList(
  list,
  element,
  overlay,
  onDeckSelected
) {
  const decks = await getDecks();

  list.replaceChildren();

  const folders = new Map();
  const topLevelDecks = [];

  for (const deck of decks) {
    if (deck.folder == null || deck.folder.trim() === "") {
      topLevelDecks.push(deck);
      continue;
    }

    if (!folders.has(deck.folder)) {
      folders.set(deck.folder, []);
    }

    folders.get(deck.folder).push(deck);
  }

  const sortedFolders = [...folders.entries()].sort(
    ([a], [b]) => a.localeCompare(b)
  );

  for (const [folderName, folderDecks] of sortedFolders) {
    addFolder(
      list,
      folderName,
      folderDecks,
      element,
      overlay,
      onDeckSelected,
      list
    );
  }

  topLevelDecks.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  for (const deck of topLevelDecks) {
    addDeck(
      list,
      deck,
      element,
      overlay,
      onDeckSelected,
      list
    );
  }
}

function addFolder(
  container,
  folderName,
  decks,
  element,
  overlay,
  onDeckSelected,
  list
) {
  const section = document.createElement("div");
  section.className = "folder-section";

  const folderButton = document.createElement("button");
  folderButton.type = "button";
  folderButton.className = "folder-button";
  folderButton.textContent = `▾  ${folderName}`;

  const contents = document.createElement("div");
  contents.className = "folder-contents";

  folderButton.addEventListener("click", () => {
    contents.hidden = !contents.hidden;

    folderButton.textContent = contents.hidden
      ? `▸  ${folderName}`
      : `▾  ${folderName}`;
  });

  section.appendChild(folderButton);
  section.appendChild(contents);

  decks.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  for (const deck of decks) {
    addDeck(
      contents,
      deck,
      element,
      overlay,
      onDeckSelected,
      list
    );
  }

  container.appendChild(section);
}

function addDeck(
  container,
  deck,
  element,
  overlay,
  onDeckSelected,
  list
) {
  const row = document.createElement("div");
  row.className = "deck-row";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "deck-button";
  button.textContent = deck.name;

  // Wrapper for stacked right controls
  const controlStack = document.createElement("div");
  controlStack.className = "deck-control-stack";

  const count = document.createElement("span");
  count.className = "deck-count";
  count.textContent =
    `${deck.unreviewed_puzzles}/${deck.total_puzzles}`;

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "deck-reset-button";
  resetButton.textContent = "Reset";
  resetButton.setAttribute(
    "aria-label",
    `Reset ${deck.name}`
  );

  button.addEventListener("click", async () => {

    if (deck.unreviewed_puzzles === 0) {
      return;
    }

    overlay.remove();

    await onDeckSelected(deck.id, element);
  });

  resetButton.addEventListener("click", async event => {
    event.stopPropagation();

    resetButton.disabled = true;

    try {
      await resetDeck(deck.id);

      await refreshDeckList(
        list,
        element,
        overlay,
        onDeckSelected
      );
    } finally {
      resetButton.disabled = false;
    }
  });

  // Append controls to stack container
  controlStack.appendChild(count);
  controlStack.appendChild(resetButton);

  // Append button and stack container to row
  row.appendChild(button);
  row.appendChild(controlStack);

  container.appendChild(row);
}

