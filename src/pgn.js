import { parse } from "@mliebelt/pgn-parser";
import { Chess } from "chess.js";

export let pgn = null;
export let pgnPath = [];

export function loadPgn(pgnstring) {
  pgn = parse(pgnstring, {
    startRule: "game",
  });

  const restructuredMoves = restructureMoveTree(pgn.moves);

  pgn.moves = augmentMoveTree(
    restructuredMoves,
    pgn.tags.FEN
  );

  pgnPath.length = 0;

  return pgn;
}

function restructureMoveTree(moves) {
  if (!moves?.length) {
    return [];
  }

  function buildLine(line) {
    if (!line?.length) {
      return null;
    }

    const [move, ...rest] = line;

    const { variations: _, ...data } = move;

    const node = {
      ...data,
      children: [],
    };

    // The next move is the mainline child.
    if (rest.length > 0) {
      const nextMove = rest[0];

      // children[0] = mainline
      node.children.push(buildLine(rest));

      // children[1...] = variations that are alternatives to nextMove
      for (const variation of nextMove.variations ?? []) {
        node.children.push(buildLine(variation));
      }
    }

    return node;
  }

  return [
    buildLine(moves),
    ...(moves[0].variations ?? []).map(buildLine),
  ];

}

function augmentMoveTree(tree, fen) {
  const chess = fen ? new Chess(fen) : new Chess();

  for (const node of tree) {
    augmentNode(node, chess);
  }

  return tree;
}

function augmentNode(node, parentChess) {
  
  const chess = new Chess(parentChess.fen());

  const fenBefore = chess.fen();

  const move = chess.move(node.notation.notation);

  if (!move) {
    throw new Error(`Could not make move: ${node.notation.notation}`);
  }

  const fenAfter = chess.fen();

  Object.assign(node, {
    ...move,
    fenBefore,
    fenAfter,
    isCheck: chess.isCheck(),
    isCheckmate: chess.isCheckmate(),
    isStalemate: chess.isStalemate(),
    isDraw: chess.isDraw(),
    isThreefoldRepetition: chess.isThreefoldRepetition(),
    isInsufficientMaterial: chess.isInsufficientMaterial(),
    isOriginal: true,
  });

  for (const child of node.children ?? []) {
    augmentNode(child, chess);
  }
}

export function getNodeAtPath(path = pgnPath) {
  if (!path.length) {
    return null;
  }

  let nodes = pgn.moves;
  let node = null;

  for (const index of path) {
    node = nodes?.[index];

    if (!node) {
      return null;
    }

    nodes = node.children;
  }

  return node;
}

export function getChildrenAtPath(path = pgnPath) {
  const node = getNodeAtPath(path);

  if (!node) {
    return pgn.moves;
  }

  return node.children ?? [];
}

export function findMatchingChildIndex(orig, dest, promotion) {
  const children = getChildrenAtPath();

  const index = children.findIndex(node =>
    node.from === orig &&
    node.to === dest &&
    (promotion === undefined || node.promotion === promotion)
  );

  return index === -1 ? null : index;
}

export function setPath(path) {
  pgnPath.length = 0;
  pgnPath.push(...path);
}

export function getVariation() {
  const nodes = [];
  let children = pgn.moves;

  for (const index of pgnPath) {
    const node = children?.[index];

    nodes.push(node);
    children = node.children;
  }

  return nodes;
}

// keeping this separate from getVariation
// allows adding a created but unattached node
// to format incorrect responses
export function formatVariation(nodes) {
  const moves = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    let moveNum;
    if (node.moveNumber !== undefined) {
      moveNum = node.moveNumber;
    } else if (node.fenBefore) {
      const fenParts = node.fenBefore.split(" ");
      moveNum = fenParts[5]; 
    }

    if (node.color === "w") {
      moves.push(`${moveNum}.`);
    } else if (i === 0 && moveNum) {
      moves.push(`${moveNum}...`);
    }

    moves.push(node.san);
  }

  return moves.join(" ");
}


export function addNodeToPath(node) {

  if (pgnPath.length === 0) {

    pgn.moves.push(node);

    const index = pgn.moves.length - 1;

    pgnPath.push(index);

  } else {

    const currentNode = getNodeAtPath();

    if (!currentNode) {
      console.error("Could not find current PGN node");
      return;
    }

    if (!currentNode.children) {
      currentNode.children = [];
    }

    currentNode.children.push(node);

    const index = currentNode.children.length - 1;

    pgnPath.push(index);
  }
}

export function createNode(chess, orig, dest, promotion) {

  const fenBefore = chess.fen();
  // we don't want to update chess
  // we just want the metadata to create the node
  const tempchess = new Chess(fenBefore);

  let move;

  try {
    move = tempchess.move({
      from: orig,
      to: dest,
      ...(promotion !== undefined
        ? { promotion: promotion }
        : {}),
    });

  } catch (error) {
    console.error("Illegal move:", error);
    return null;
  }

  if (!move) {
    return null;
  }

  const fenAfter = tempchess.fen();

  return {
    ...move,

    fenBefore: fenBefore,
    fenAfter: fenAfter,

    isCheck: tempchess.isCheck(),
    isCheckmate: tempchess.isCheckmate(),
    isStalemate: tempchess.isStalemate(),
    isDraw: tempchess.isDraw(),
    isThreefoldRepetition:
      tempchess.isThreefoldRepetition(),
    isInsufficientMaterial:
      tempchess.isInsufficientMaterial(),

    isOriginal: false,

    children: [],
  };
}

export function removeNodeAtPath() {

  if (!pgnPath.length) {
    return false;
  }

  const childIndex = pgnPath[pgnPath.length - 1];

  const parentPath = pgnPath.slice(0, -1);

  let children;

  if (!parentPath.length) {
    children = pgn.moves;
  } else {
    const parentNode = getNodeAtPath(parentPath);
    children = parentNode.children;
  }

  if (!children) {
    return false;
  }

  children.splice(childIndex, 1);

  pgnPath.pop();

  return true;
}

