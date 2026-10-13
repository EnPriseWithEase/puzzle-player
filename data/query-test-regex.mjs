import initSqlJs from "sql.js";
import fs from "node:fs";
import { registerSqliteFunctions } from "../src/database.js";

const SQL = await initSqlJs();
const bytes = fs.readFileSync("./puzzle.sqlite");
const db = registerSqliteFunctions(
  new SQL.Database(bytes)
);

try {
  const stmt = db.prepare(`
    SELECT *
    FROM puzzle
    WHERE pgn REGEXP ?
    LIMIT 20
  `);

  try {
    stmt.bind([String.raw`1\.\.\. \S+ 2. \S+`]);

    while (stmt.step()) {
      console.log(stmt.getAsObject());
    }
  } finally {
    stmt.free();
  }
} finally {
  db.close();
}

