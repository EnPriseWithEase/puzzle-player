import initSqlJs from "sql.js";
import fs from "node:fs";

const SQL = await initSqlJs();

const bytes = fs.readFileSync("./puzzle.sqlite");
const db = new SQL.Database(bytes);

db.create_function("regexp", (pattern, str) => {
  if (pattern == null || str == null) {
    return null;
  }

  return new RegExp(pattern).test(str) ? 1 : 0;
});

// Replace "puzzles" and "answer" with your actual table/column names.
const stmt = db.prepare(`
  SELECT *
  FROM puzzles
  WHERE answer REGEXP ?
  LIMIT 20
`);

try {
  stmt.bind(["^CAT"]);

  while (stmt.step()) {
    console.log(stmt.getAsObject());
  }
} finally {
  stmt.free();
  db.close();
}

