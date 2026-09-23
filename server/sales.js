const ID_PRUEBA = /^TEST-[A-Z0-9-]{8,80}$/i;
const PRECIO_MAXIMO_CENTIMOS = 1_000_000_00;
const CANTIDAD_MAXIMA = 999;

function rechazar(mensaje) {
  const error = new Error(mensaje);
  error.status = 400;
  return error;
}

function textoOpcional(valor, maximo, etiqueta) {
  if (valor == null || valor === "") {
    return null;
  }

  if (typeof valor !== "string") {
    throw rechazar(`${etiqueta} no es válido.`);
  }

  const limpio = valor.trim();
  if (limpio.length === 0) {
    return null;
  }

  if (limpio.length > maximo) {
    throw rechazar(`${etiqueta} es demasiado largo.`);
  }

  return limpio;
}

function exigirEntero(valor, mensaje) {
  if (typeof valor !== "number" || !Number.isInteger(valor)) {
    throw rechazar(mensaje);
  }

  return valor;
}

function exigirBooleanoVerdadero(valor, mensaje) {
  if (valor !== true) {
    throw rechazar(mensaje);
  }
}

export function normalizarVenta(entrada) {
  if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) {
    throw rechazar("La venta no es válida.");
  }

  if (typeof entrada.id !== "string" || !ID_PRUEBA.test(entrada.id)) {
    throw rechazar("La referencia debe ser una referencia de prueba TEST-.");
  }

  if (typeof entrada.createdAt !== "string" || Number.isNaN(Date.parse(entrada.createdAt))) {
    throw rechazar("La fecha de la venta no es válida.");
  }

  exigirBooleanoVerdadero(
    entrada.isTest,
    "Solo se pueden registrar ventas de prueba."
  );
  exigirBooleanoVerdadero(
    entrada.noFiscalValidity,
    "La venta debe indicar que no tiene validez fiscal."
  );

  if (entrada.paymentMethod !== "cash" && entrada.paymentMethod !== "card") {
    throw rechazar("El método de pago debe ser efectivo o tarjeta.");
  }

  if (!Array.isArray(entrada.items) || entrada.items.length === 0) {
    throw rechazar("La venta debe incluir al menos un servicio.");
  }

  const items = entrada.items.map((item, indice) => {
    if (!item || typeof item !== "object") {
      throw rechazar("Hay una línea de venta no válida.");
    }

    if (typeof item.description !== "string" || item.description.trim() === "") {
      throw rechazar("Cada servicio necesita una descripción.");
    }

    const description = item.description.trim();
    if (description.length > 200) {
      throw rechazar("La descripción de un servicio es demasiado larga.");
    }

    const quantity = exigirEntero(
      item.quantity,
      "La cantidad de un servicio no es válida."
    );
    if (quantity < 1 || quantity > CANTIDAD_MAXIMA) {
      throw rechazar("La cantidad de un servicio no es válida.");
    }

    const unitPriceCents = exigirEntero(
      item.unitPriceCents,
      "El precio de un servicio no es válido."
    );
    if (unitPriceCents < 1 || unitPriceCents > PRECIO_MAXIMO_CENTIMOS) {
      throw rechazar("El precio de un servicio no es válido.");
    }

    const lineTotalCents = quantity * unitPriceCents;
    if (!Number.isSafeInteger(lineTotalCents)) {
      throw rechazar("El importe de una línea no es válido.");
    }

    return {
      position: indice + 1,
      description,
      quantity,
      unitPriceCents,
      lineTotalCents,
    };
  });

  const totalCents = items.reduce((suma, item) => suma + item.lineTotalCents, 0);
  if (!Number.isSafeInteger(totalCents) || totalCents < 1) {
    throw rechazar("El total de la venta no es válido.");
  }

  const receivedCents = exigirEntero(
    entrada.receivedCents,
    "El importe recibido no es válido."
  );

  let changeCents = 0;
  if (entrada.paymentMethod === "cash") {
    if (receivedCents < totalCents) {
      throw rechazar("El importe recibido no puede ser menor que el total.");
    }
    changeCents = receivedCents - totalCents;
  } else if (receivedCents !== totalCents) {
    throw rechazar("En tarjeta el importe cobrado debe coincidir con el total.");
  }

  return {
    id: entrada.id,
    createdAt: entrada.createdAt,
    licensePlate: textoOpcional(entrada.licensePlate, 20, "La matrícula"),
    vehicleModel: textoOpcional(entrada.vehicleModel, 80, "El modelo"),
    paymentMethod: entrada.paymentMethod,
    totalCents,
    receivedCents,
    changeCents,
    isTest: true,
    noFiscalValidity: true,
    items,
  };
}

function firmaVenta(venta) {
  return JSON.stringify({
    id: venta.id,
    createdAt: venta.createdAt,
    licensePlate: venta.licensePlate,
    vehicleModel: venta.vehicleModel,
    paymentMethod: venta.paymentMethod,
    totalCents: venta.totalCents,
    receivedCents: venta.receivedCents,
    changeCents: venta.changeCents,
    items: venta.items.map((item) => ({
      position: item.position,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      lineTotalCents: item.lineTotalCents,
    })),
  });
}

function filaAVenta(fila, items) {
  return {
    id: fila.id,
    createdAt: fila.created_at,
    licensePlate: fila.license_plate,
    vehicleModel: fila.vehicle_model,
    paymentMethod: fila.payment_method,
    totalCents: fila.total_cents,
    receivedCents: fila.received_cents,
    changeCents: fila.change_cents,
    isTest: fila.is_test === 1,
    noFiscalValidity: fila.no_fiscal_validity === 1,
    items: items.map((item) => ({
      position: item.position,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
      lineTotalCents: item.line_total_cents,
    })),
  };
}

function leerItems(db, saleId) {
  return db
    .prepare(
      `SELECT position, description, quantity, unit_price_cents, line_total_cents
       FROM sale_items
       WHERE sale_id = ?
       ORDER BY position ASC`
    )
    .all(saleId);
}

export function obtenerVenta(db, id) {
  const fila = db.prepare("SELECT * FROM sales WHERE id = ?").get(id);
  if (!fila) {
    return null;
  }

  return filaAVenta(fila, leerItems(db, id));
}

export function listarVentas(db) {
  const filas = db
    .prepare("SELECT * FROM sales ORDER BY created_at DESC, id DESC")
    .all();
  const items = db
    .prepare(
      `SELECT sale_id, position, description, quantity, unit_price_cents, line_total_cents
       FROM sale_items
       ORDER BY sale_id ASC, position ASC`
    )
    .all();
  const porVenta = new Map();

  for (const item of items) {
    const lista = porVenta.get(item.sale_id) || [];
    lista.push(item);
    porVenta.set(item.sale_id, lista);
  }

  return filas.map((fila) => filaAVenta(fila, porVenta.get(fila.id) || []));
}

export function registrarVenta(db, entrada) {
  const venta = normalizarVenta(entrada);
  const existente = obtenerVenta(db, venta.id);

  if (existente) {
    if (firmaVenta(existente) === firmaVenta(venta)) {
      return { status: 200, sale: existente };
    }

    const conflicto = new Error(
      "Ya existe una venta con esta referencia y los datos no coinciden. No se ha modificado."
    );
    conflicto.status = 409;
    throw conflicto;
  }

  const insertar = db.transaction((datos) => {
    db.prepare(
      `INSERT INTO sales (
        id, created_at, license_plate, vehicle_model, payment_method,
        total_cents, received_cents, change_cents, is_test, no_fiscal_validity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`
    ).run(
      datos.id,
      datos.createdAt,
      datos.licensePlate,
      datos.vehicleModel,
      datos.paymentMethod,
      datos.totalCents,
      datos.receivedCents,
      datos.changeCents
    );

    const insertarLinea = db.prepare(
      `INSERT INTO sale_items (
        sale_id, position, description, quantity, unit_price_cents, line_total_cents
      ) VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const item of datos.items) {
      insertarLinea.run(
        datos.id,
        item.position,
        item.description,
        item.quantity,
        item.unitPriceCents,
        item.lineTotalCents
      );
    }
  });

  try {
    insertar(venta);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      const guardada = obtenerVenta(db, venta.id);
      if (guardada && firmaVenta(guardada) === firmaVenta(venta)) {
        return { status: 200, sale: guardada };
      }

      const conflicto = new Error(
        "Ya existe una venta con esta referencia y los datos no coinciden. No se ha modificado."
      );
      conflicto.status = 409;
      throw conflicto;
    }

    throw error;
  }

  return { status: 201, sale: obtenerVenta(db, venta.id) };
}
