import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  license_plate TEXT,
  vehicle_model TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card')),
  total_cents INTEGER NOT NULL CHECK (total_cents > 0),
  received_cents INTEGER,
  change_cents INTEGER NOT NULL CHECK (change_cents >= 0),
  is_test INTEGER NOT NULL CHECK (is_test = 1),
  no_fiscal_validity INTEGER NOT NULL CHECK (no_fiscal_validity = 1)
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id TEXT NOT NULL REFERENCES sales(id),
  position INTEGER NOT NULL CHECK (position > 0),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents > 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents > 0),
  UNIQUE (sale_id, position)
);
`;

export function resolverRutaBase(raiz, modo) {
  const relativaPorDefecto =
    modo === "pilot" ? "data/workshop.sqlite" : "data/workshop-dev.sqlite";
  const indicada = process.env.WORKSHOP_DB_PATH || relativaPorDefecto;
  return path.isAbsolute(indicada) ? indicada : path.resolve(raiz, indicada);
}

export function abrirBase(rutaAbsoluta) {
  fs.mkdirSync(path.dirname(rutaAbsoluta), { recursive: true });
  const db = new Database(rutaAbsoluta);
  db.pragma("foreign_keys = ON");
  db.exec(ESQUEMA);
  return db;
}
