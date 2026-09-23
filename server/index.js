import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { abrirBase, resolverRutaBase } from "./db.js";
import { listarVentas, registrarVenta } from "./sales.js";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modo = process.env.WORKSHOP_MODE === "pilot" ? "pilot" : "development";
const puerto = Number(process.env.PORT) || (modo === "pilot" ? 4173 : 3001);
const host = modo === "pilot" ? "0.0.0.0" : "127.0.0.1";
const rutaBase = resolverRutaBase(raiz, modo);
const distDir = path.resolve(raiz, "dist");

const nombreBase = path.basename(rutaBase);
if (modo !== "pilot" && nombreBase === "workshop.sqlite") {
  console.error("El desarrollo no puede usar la base del piloto (data/workshop.sqlite).");
  process.exit(1);
}
if (modo === "pilot" && nombreBase === "workshop-dev.sqlite") {
  console.error("El piloto no puede usar la base de desarrollo (data/workshop-dev.sqlite).");
  process.exit(1);
}

const db = abrirBase(rutaBase);

const tipos = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function enviarJson(respuesta, status, cuerpo) {
  const payload = JSON.stringify(cuerpo);
  respuesta.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
  });
  respuesta.end(payload);
}

function leerCuerpo(peticion) {
  return new Promise((resolve, reject) => {
    const trozos = [];
    let tamano = 0;

    peticion.on("data", (trozo) => {
      tamano += trozo.length;
      if (tamano > 1_000_000) {
        reject(Object.assign(new Error("La petición es demasiado grande."), { status: 413 }));
        peticion.destroy();
        return;
      }
      trozos.push(trozo);
    });

    peticion.on("end", () => {
      if (trozos.length === 0) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(trozos).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("El cuerpo no es JSON válido."), { status: 400 }));
      }
    });

    peticion.on("error", reject);
  });
}

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

function servirEstatico(respuesta, pathname) {
  const relativo = pathname === "/" ? "index.html" : decodeURIComponent(pathname.replace(/^\/+/, ""));
  const absoluto = path.resolve(distDir, relativo);
  const dentro = absoluto === distDir || absoluto.startsWith(`${distDir}${path.sep}`);

  if (!dentro) {
    enviarJson(respuesta, 403, { error: "Ruta no permitida." });
    return;
  }

  let archivo = absoluto;
  if (!fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
    archivo = path.join(distDir, "index.html");
  }

  if (!fs.existsSync(archivo)) {
    enviarJson(respuesta, 503, {
      error: "La versión estable no está construida. Ejecuta npm run pilot:build.",
    });
    return;
  }

  const extension = path.extname(archivo).toLowerCase();
  respuesta.writeHead(200, {
    "Content-Type": tipos[extension] || "application/octet-stream",
  });
  fs.createReadStream(archivo).pipe(respuesta);
}

async function manejarApi(peticion, respuesta, pathname) {
  if (pathname === "/api/health" && peticion.method === "GET") {
    enviarJson(respuesta, 200, {
      ok: true,
      environment: modo,
      database: nombreBase,
    });
    return;
  }

  if (pathname === "/api/sales" && peticion.method === "GET") {
    enviarJson(respuesta, 200, { sales: listarVentas(db) });
    return;
  }

  if (pathname === "/api/sales" && peticion.method === "POST") {
    const cuerpo = await leerCuerpo(peticion);
    const resultado = registrarVenta(db, cuerpo);
    enviarJson(respuesta, resultado.status, { sale: resultado.sale });
    return;
  }

  if (
    (pathname === "/api/sales" || pathname.startsWith("/api/sales/")) &&
    (peticion.method === "DELETE" || peticion.method === "PUT" || peticion.method === "PATCH")
  ) {
    enviarJson(respuesta, 405, {
      error: "Las ventas confirmadas no se pueden modificar ni borrar.",
    });
    return;
  }

  enviarJson(respuesta, 404, { error: "No existe este recurso." });
}

const servidor = http.createServer(async (peticion, respuesta) => {
  const url = new URL(peticion.url || "/", "http://127.0.0.1");
  const pathname = url.pathname;

  try {
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      await manejarApi(peticion, respuesta, pathname);
      return;
    }

    if (modo !== "pilot") {
      enviarJson(respuesta, 404, { error: "Este proceso solo ofrece la API de desarrollo." });
      return;
    }

    servirEstatico(respuesta, pathname);
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) {
      console.error(error);
    }
    if (!respuesta.headersSent) {
      enviarJson(respuesta, status, {
        error: status === 500 ? "No se ha podido completar la operación." : error.message,
      });
    }
  }
});

servidor.listen(puerto, host, () => {
  const entorno = modo === "pilot" ? "piloto estable" : "desarrollo";
  console.log(`Yanlai Workshop — ${entorno}`);
  console.log(`Base de datos: ${rutaBase}`);
  console.log(`Local:   http://127.0.0.1:${puerto}/`);
  if (modo === "pilot") {
    for (const direccion of direccionesLan()) {
      console.log(`Network: http://${direccion}:${puerto}/`);
    }
    console.log("Sirve la carpeta dist. Editar src no cambia esta versión hasta npm run pilot:build.");
  } else {
    console.log("API de desarrollo. La interfaz se abre por Vite en el puerto 5173.");
  }
  console.log("Acceso previsto solo en la red local. No hay usuarios ni autenticación.");
});
