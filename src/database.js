import initSqlJs from "sql.js";

let databasePromise;

const DB_NAME = "puzzle-database";
const STORE_NAME = "database";
const DB_KEY = "sqlite";

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = loadDatabase();
  }

  return databasePromise;
}

async function loadDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => `/assets/sql-wasm/${file}`,
  });

  // Try to load a previously saved database
  const savedDatabase = await loadFromIndexedDB();

  if (savedDatabase) {
    console.log("Loading database from index...");
    return new SQL.Database(savedDatabase);
  }

  // No saved database — load the original database
  const response = await fetch("/data/puzzle.sqlite");

  if (!response.ok) {
    throw new Error(
      `Failed to load database: ${response.status}`
    );
  }

  console.log("Loading database from file...");

  const buffer = await response.arrayBuffer();
  const database = new SQL.Database(new Uint8Array(buffer));

  // Save the initial database to IndexedDB
  await saveToIndexedDB(database);

  return database;
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function loadFromIndexedDB() {
  const db = await openIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(DB_KEY);

    request.onsuccess = () => {
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function saveToIndexedDB(database) {
  const data = database.export();
  const db = await openIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(data, DB_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function exportDatabase() {
  const db = await getDatabase();

  const data = db.export();

  const blob = new Blob([data], {
    type: "application/x-sqlite3",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "puzzle.sqlite.bak";

  document.body.appendChild(link);
  link.click();
  link.remove();

  // timeout wrapper to help with potential mobile browser issues
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}


export async function dbQuery(sql, { params = [], jsonColumns = [] } = {}) {
  const db = await getDatabase();
  const preparedStatement = db.prepare(sql);

  try {
    preparedStatement.bind(params);

    const rows = [];

    while (preparedStatement.step()) {
      const row = preparedStatement.getAsObject();

      for (const column of jsonColumns) {
        if (typeof row[column] === "string") {
          try {
            row[column] = JSON.parse(row[column]);
          } catch {
            // leave invalid JSON string
          }
        }
      }

      rows.push(row);
    }

    return rows;

  } finally {
    preparedStatement.free();
  }
}

export async function dbInsert(tablename, data, { jsonColumns = [] } = {}) {
  const db = await getDatabase();
  const columns = Object.keys(data);

  const values = columns.map((column) =>
    serializeValue(data[column], column, jsonColumns)
  );

  const placeholders = columns.map(() => "?").join(", ");

  const sql = `
    INSERT INTO ${tablename} (${columns.join(", ")})
    VALUES (${placeholders})
  `;

  db.run(sql, values);

  const id = db.exec("SELECT last_insert_rowid()")[0].values[0][0];
  await saveToIndexedDB(db);
  return id;
}

export async function dbUpdate(
  tablename,
  data,
  where,
  { jsonColumns = [] } = {}
) {
  const db = await getDatabase();

  const columns = Object.keys(data);

  if (columns.length === 0) {
    throw new Error("No data provided for update");
  }

  const whereColumns = Object.keys(where);

  if (whereColumns.length === 0) {
    throw new Error("WHERE clause is required");
  }

  const values = columns.map((column) =>
    serializeValue(data[column], column, jsonColumns)
  );

  const whereValues = whereColumns.map((column) =>
    serializeValue(where[column], column, jsonColumns)
  );

  const setClause = columns
    .map((column) => `${column} = ?`)
    .join(", ");

  const whereClause = whereColumns
    .map((column) => `${column} = ?`)
    .join(" AND ");

  const sql = `
    UPDATE ${tablename}
    SET ${setClause}
    WHERE ${whereClause}
  `;

  db.run(sql, [...values, ...whereValues]);

  const changes = db.exec("SELECT changes()")[0].values[0][0];
  await saveToIndexedDB(db);
  return changes;
}

function serializeValue(value, column, jsonColumns) {
  if (
    jsonColumns.includes(column) &&
    typeof value === "object" &&
    value !== null
  ) {
    return JSON.stringify(value);
  }

  return value;
}

export async function dbRun(sql, params = []) {
  const db = await getDatabase();
  db.run(sql, params);
  await saveToIndexedDB(db);
}

