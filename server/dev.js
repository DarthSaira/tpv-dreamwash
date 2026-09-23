import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;
const viteBin = path.join(raiz, "node_modules", "vite", "bin", "vite.js");

function direccionesLan() {
  const direcciones = [];
  for (const lista of Object.values(os.networkInterfaces())) {
    for (const red of lista || []) {
      if (red.family === "IPv4" && !red.internal) {
        direcciones.push(red.address);
      }
    }
  }
  return direcciones;
}

console.log("Yanlai Workshop — desarrollo");
console.log("Base de datos: data/workshop-dev.sqlite");
console.log("Local:   http://localhost:5173/");
for (const direccion of direccionesLan()) {
  console.log(`Network: http://${direccion}:5173/`);
}
console.log("La API interna escucha en 127.0.0.1:3001 y no usa la base del piloto.");

const api = spawn(node, ["server/index.js"], {
  cwd: raiz,
  stdio: "inherit",
  env: {
    ...process.env,
    WORKSHOP_MODE: "development",
    WORKSHOP_DB_PATH: "data/workshop-dev.sqlite",
    PORT: "3001",
  },
});

const web = spawn(node, [viteBin, "--host", "--port", "5173"], {
  cwd: raiz,
  stdio: "inherit",
  env: process.env,
});

let cerrado = false;

function cerrar() {
  if (cerrado) {
    return;
  }
  cerrado = true;
  api.kill();
  web.kill();
}

process.on("SIGINT", () => {
  cerrar();
  process.exit(0);
});

process.on("SIGTERM", () => {
  cerrar();
  process.exit(0);
});

api.on("exit", (codigo) => {
  if (!cerrado && codigo) {
    web.kill();
    process.exit(codigo);
  }
});

web.on("exit", (codigo) => {
  if (!cerrado && codigo) {
    api.kill();
    process.exit(codigo);
  }
});
