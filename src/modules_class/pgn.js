import { parse } from "@mliebelt/pgn-parser";
import { Chess } from "chess.js";
import { mirrorPgnTree, mirrorGameCommentArrows, mirrorFen } from "./mirror";

export class PgnNavigator {
  constructor() {
    this.pgn = null;
    this.pgnPath = [];
  }

  getStartingSide(pgnString) {
    const parsedPgn = parse(pgnString, { startRule: "game" });
    const fen = parsedPgn.tags.FEN;
    if (fen) {
      return fen.split(" ")[1] === "w" ? "w" : "b";
    }
    return "w";
  }

  loadPgn(pgnstring, options = {}) {
    this.pgn = parse(pgnstring, { startRule: "game" });

    if (options.mirror) {
      mirrorPgnTree(this.pgn.moves, "invert_mirror");
      mirrorGameCommentArrows(this.pgn, "invert_mirror");
      if (this.pgn.tags.FEN) {
        this.pgn.tags.FEN = mirrorFen(this.pgn.tags.FEN, "invert_mirror");
      }
    }

    const restructuredMoves = this.restructureMoveTree(this.pgn.moves);
    this.pgn.moves = this.augmentMoveTree(restructuredMoves, this.pgn.tags.FEN);

    this.pgnPath.length = 0;

    return this.pgn;
  }

  restructureMoveTree(moves) {
    if (!moves?.length) {
      return [];
    }

    const buildLine = (line) => {
      if (!line?.length) {
        return null;
      }

      const [move, ...rest] = line;
      const { variations: _, ...data } = move;

      const node = {
        ...data,
        children: [],
      };

      if (rest.length > 0) {
        const nextMove = rest[0];
        node.children.push(buildLine(rest));

        for (const variation of nextMove.variations ?? []) {
          node.children.push(buildLine(variation));
        }
      }

      return node;
    };

    return [
      buildLine(moves),
      ...(moves[0].variations ?? []).map(buildLine),
    ];
  }

  augmentMoveTree(tree, fen) {
    const chess = fen ? new Chess(fen) : new Chess();

    for (const node of tree) {
      this.augmentNode(node, chess);
    }

    return tree;
  }

  augmentNode(node, parentChess) {
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
      this.augmentNode(child, chess);
    }
  }

  getNodeAtPath(path = this.pgnPath) {
    if (!path.length || !this.pgn) {
      return null;
    }

    let nodes = this.pgn.moves;
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

  getChildrenAtPath(path = this.pgnPath) {
    const node = this.getNodeAtPath(path);

    if (!node) {
      return this.pgn?.moves ?? [];
    }

    return node.children ?? [];
  }

  findMatchingChildIndex(orig, dest, promotion) {
    const children = this.getChildrenAtPath();

    const index = children.findIndex(node =>
      node.from === orig &&
      node.to === dest &&
      (promotion === undefined || node.promotion === promotion)
    );

    return index === -1 ? null : index;
  }

  setPath(path) {
    this.pgnPath.length = 0;
    this.pgnPath.push(...path);
  }

  getVariation() {
    const nodes = [];
    let children = this.pgn?.moves ?? [];

    for (const index of this.pgnPath) {
      const node = children?.[index];
      if (!node) break;
      nodes.push(node);
      children = node.children;
    }

    return nodes;
  }

  formatVariation(nodes) {
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

  addNodeToPath(node) {
    if (!this.pgn) return;

    if (this.pgnPath.length === 0) {
      this.pgn.moves.push(node);
      const index = this.pgn.moves.length - 1;
      this.pgnPath.push(index);
    } else {
      const currentNode = this.getNodeAtPath();

      if (!currentNode) {
        console.error("Could not find current PGN node");
        return;
      }

      if (!currentNode.children) {
        currentNode.children = [];
      }

      currentNode.children.push(node);
      const index = currentNode.children.length - 1;
      this.pgnPath.push(index);
    }
  }

  createNode(chess, orig, dest, promotion) {
    const fenBefore = chess.fen();
    const tempchess = new Chess(fenBefore);
    let move;

    try {
      move = tempchess.move({
        from: orig,
        to: dest,
        ...(promotion !== undefined ? { promotion: promotion } : {}),
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
      isThreefoldRepetition: tempchess.isThreefoldRepetition(),
      isInsufficientMaterial: tempchess.isInsufficientMaterial(),
      isOriginal: false,
      children: [],
    };
  }

  removeNodeAtPath() {
    if (!this.pgnPath.length) {
      return false;
    }

    const childIndex = this.pgnPath[this.pgnPath.length - 1];
    const parentPath = this.pgnPath.slice(0, -1);
    let children;

    if (!parentPath.length) {
      children = this.pgn?.moves;
    } else {
      const parentNode = this.getNodeAtPath(parentPath);
      children = parentNode?.children;
    }

    if (!children) {
      return false;
    }

    children.splice(childIndex, 1);
    this.pgnPath.pop();

    return true;
  }
}

