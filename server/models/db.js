import sqlite3 from "sqlite3";
import { open } from "sqlite";


const dbPromise = open({
  filename: "./server/models/vereadores.db",
  driver: sqlite3.Database,
});


(async () => {
const db = await dbPromise;
await db.exec(`CREATE TABLE IF NOT EXISTS vereadores (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT,
partido TEXT,
foto TEXT
);`);
await db.exec(`CREATE TABLE IF NOT EXISTS sorteios (
id INTEGER PRIMARY KEY AUTOINCREMENT,
data DATETIME DEFAULT CURRENT_TIMESTAMP,
resultado TEXT
);`);
await db.exec(`CREATE TABLE IF NOT EXISTS inscricoes (
id INTEGER PRIMARY KEY AUTOINCREMENT,
vereador_id INTEGER,
data DATETIME DEFAULT CURRENT_TIMESTAMP
);`);
})();


export default dbPromise;