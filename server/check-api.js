import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const puerto = 3199;
const base = path.join(os.tmpdir(), `yanlai-workshop-api-check-${process.pid}.sqlite`);

function borrarBase(ruta) {
  for (const sufijo of ["", "-journal", "-wal", "-shm"]) {
    fs.rmSync(`${ruta}${sufijo}`, { force: true });
  }
}

function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function arrancar(rutaBase) {
  const proceso = spawn(process.execPath, ["server/index.js"], {
    cwd: raiz,
    env: {
      ...process.env,
      WORKSHOP_MODE: "development",
      WORKSHOP_DB_PATH: rutaBase,
      PORT: String(puerto),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  return proceso;
}

async function esperarSalud(proceso) {
  const inicio = Date.now();
  let ultimoError = "";

  while (Date.now() - inicio < 8000) {
    if (proceso.exitCode != null) {
      throw new Error(`El servidor se cerró antes de responder. ${ultimoError}`);
    }

    try {
      const respuesta = await fetch(`http://127.0.0.1:${puerto}/api/health`);
      if (respuesta.ok) {
        return respuesta.json();
      }
    } catch (error) {
      ultimoError = error.message;
    }

    await esperar(100);
  }

  throw new Error("El servidor no respondió a /api/health.");
}

function cerrar(proceso) {
  return new Promise((resolve) => {
    if (proceso.exitCode != null) {
      resolve();
      return;
    }
    proceso.once("exit", () => resolve());
    proceso.kill();
  });
}

function ventaValida(cambios = {}) {
  return {
    id: "TEST-API-CHECK-0001",
    createdAt: "2026-09-22T18:00:00.000Z",
    licensePlate: "1234ABC",
    vehicleModel: "Golf",
    paymentMethod: "cash",
    receivedCents: 1000,
    isTest: true,
    noFiscalValidity: true,
    items: [
      {
        description: "Lavado básico",
        quantity: 1,
        unitPriceCents: 800,
      },
    ],
    ...cambios,
  };
}

async function comprobar(condicion, mensaje) {
  if (!condicion) {
    throw new Error(mensaje);
  }
}

borrarBase(base);

const servidor = arrancar(base);

try {
  const salud = await esperarSalud(servidor);
  await comprobar(salud.ok === true, "health no indica ok.");
  await comprobar(salud.environment === "development", "health no indica desarrollo.");
  await comprobar(salud.database.endsWith(".sqlite"), "health no indica la base.");

  const creada = await fetch(`http://127.0.0.1:${puerto}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaValida()),
  });
  const creadaJson = await creada.json();
  await comprobar(creada.status === 201, `La venta válida debía responder 201 y respondió ${creada.status}.`);
  await comprobar(creadaJson.sale?.totalCents === 800, "El servidor no recalculó el total.");
  await comprobar(creadaJson.sale?.changeCents === 200, "El servidor no calculó el cambio.");
  await comprobar(creadaJson.sale?.items?.[0]?.lineTotalCents === 800, "Falta el total de línea.");
  await comprobar(creadaJson.sale?.isTest === true, "La venta no quedó marcada como prueba.");
  await comprobar(creadaJson.sale?.noFiscalValidity === true, "La venta no quedó sin validez fiscal.");

  const listado = await fetch(`http://127.0.0.1:${puerto}/api/sales`);
  const listadoJson = await listado.json();
  await comprobar(listado.status === 200, "GET /api/sales falló.");
  await comprobar(listadoJson.sales?.length === 1, "El listado no contiene la venta.");
  await comprobar(listadoJson.sales[0].items.length === 1, "El listado no incluye las líneas.");

  const repetida = await fetch(`http://127.0.0.1:${puerto}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaValida()),
  });
  const repetidaJson = await repetida.json();
  await comprobar(repetida.status === 200, "La misma venta debía ser idempotente.");
  const trasRepetir = await fetch(`http://127.0.0.1:${puerto}/api/sales`);
  const trasRepetirJson = await trasRepetir.json();
  await comprobar(trasRepetirJson.sales.length === 1, "La repetición creó un duplicado.");
  await comprobar(repetidaJson.sale.id === "TEST-API-CHECK-0001", "La repetición no devolvió la misma venta.");

  const conflicto = await fetch(`http://127.0.0.1:${puerto}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaValida({ receivedCents: 2000 })),
  });
  await comprobar(conflicto.status === 409, "Un mismo id con datos distintos debía responder 409.");
  const trasConflicto = await (await fetch(`http://127.0.0.1:${puerto}/api/sales`)).json();
  await comprobar(trasConflicto.sales[0].receivedCents === 1000, "El conflicto modificó la venta existente.");

  const efectivoCorto = await fetch(`http://127.0.0.1:${puerto}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaValida({ id: "TEST-API-CHECK-0002", receivedCents: 100 })),
  });
  await comprobar(efectivoCorto.status === 400, "El efectivo insuficiente debía rechazarse.");

  const metodoInvalido = await fetch(`http://127.0.0.1:${puerto}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaValida({ id: "TEST-API-CHECK-0003", paymentMethod: "bizum" })),
  });
  await comprobar(metodoInvalido.status === 400, "El método inválido debía rechazarse.");

  const sinLineas = await fetch(`http://127.0.0.1:${puerto}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaValida({ id: "TEST-API-CHECK-0004", items: [] })),
  });
  await comprobar(sinLineas.status === 400, "Una venta sin líneas debía rechazarse.");

  const borrado = await fetch(`http://127.0.0.1:${puerto}/api/sales`, { method: "DELETE" });
  await comprobar(borrado.status === 405, "DELETE no debía borrar ventas.");
  const trasBorrado = await (await fetch(`http://127.0.0.1:${puerto}/api/sales`)).json();
  await comprobar(trasBorrado.sales.length === 1, "DELETE eliminó una venta.");

  await cerrar(servidor);
  await esperar(300);

  const servidorReinicio = arrancar(base);
  try {
    await esperarSalud(servidorReinicio);
    const trasReinicio = await (await fetch(`http://127.0.0.1:${puerto}/api/sales`)).json();
    await comprobar(trasReinicio.sales.length === 1, "Reiniciar el servidor perdió la venta.");
    await comprobar(
      trasReinicio.sales[0].id === "TEST-API-CHECK-0001",
      "Tras reiniciar no se conservó la misma venta."
    );
  } finally {
    await cerrar(servidorReinicio);
  }

  console.log("Pruebas de API correctas.");
} catch (error) {
  console.error(error.message);
  await cerrar(servidor);
  process.exitCode = 1;
} finally {
  borrarBase(base);
}
