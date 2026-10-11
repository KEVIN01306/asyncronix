import { PrismaClient } from "@prisma/client";

export const monedasData = [
  {
    id: "1d3df6bf-781a-11f1-821e-1ce8d4b626a6",
    codigo: "GTQ",
    nombre: "Quetzal",
    simbolo: "Q",
    activo: true,
    created_at: new Date("2026-07-04T20:34:51.411Z"),
    updated_at: new Date("2026-07-05T02:34:58.027Z"),
  },
  {
    id: "1d7508e9-781a-11f1-821e-1ce8d4b626a6",
    codigo: "USD",
    nombre: "Dólar estadounidense",
    simbolo: "$",
    activo: true,
    created_at: new Date("2026-07-04T20:34:51.000Z"),
    updated_at: new Date("2026-07-05T02:34:58.388Z"),
  },
  {
    id: "1dab5c3e-781a-11f1-821e-1ce8d4b626a6",
    codigo: "HNL",
    nombre: "Lempira",
    simbolo: "L",
    activo: true,
    created_at: new Date("2026-07-04T20:34:51.000Z"),
    updated_at: new Date("2026-07-05T02:34:58.744Z"),
  },
  {
    id: "1de34acf-781a-11f1-821e-1ce8d4b626a6",
    codigo: "NIO",
    nombre: "Córdoba oro",
    simbolo: "C$",
    activo: true,
    created_at: new Date("2026-07-04T20:34:51.000Z"),
    updated_at: new Date("2026-07-05T02:34:59.111Z"),
  },
  {
    id: "1e1bcb6e-781a-11f1-821e-1ce8d4b626a6",
    codigo: "CRC",
    nombre: "Colón costarricense",
    simbolo: "₡",
    activo: true,
    created_at: new Date("2026-07-04T20:34:51.000Z"),
    updated_at: new Date("2026-07-05T02:34:59.481Z"),
  },
  {
    id: "1e536501-781a-11f1-821e-1ce8d4b626a6",
    codigo: "PAB",
    nombre: "Balboa",
    simbolo: "B/.",
    activo: true,
    created_at: new Date("2026-07-04T20:34:51.000Z"),
    updated_at: new Date("2026-07-05T02:34:59.845Z"),
  },
  {
    id: "e5fb52ab-781b-11f1-821e-1ce8d4b626a6",
    codigo: "MXN",
    nombre: "Peso mexicano",
    simbolo: "$",
    activo: true,
    created_at: new Date("2026-07-05T02:47:43.596Z"),
    updated_at: new Date("2026-07-05T02:47:43.596Z"),
  },
];

export async function seedMonedas(prisma: PrismaClient) {
  console.log("🪙 Iniciando seed de monedas...");

  for (const moneda of monedasData) {
    await prisma.moneda.upsert({
      where: { id: moneda.id },
      update: {
        codigo: moneda.codigo,
        nombre: moneda.nombre,
        simbolo: moneda.simbolo,
        activo: moneda.activo,
        updated_at: moneda.updated_at,
      },
      create: {
        id: moneda.id,
        codigo: moneda.codigo,
        nombre: moneda.nombre,
        simbolo: moneda.simbolo,
        activo: moneda.activo,
        created_at: moneda.created_at,
        updated_at: moneda.updated_at,
      },
    });
  }

  console.log(`✅ Seed de monedas completado (${monedasData.length} procesadas).`);
}
