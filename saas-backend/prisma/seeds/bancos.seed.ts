import { PrismaClient } from "@prisma/client";

export const bancosData = [
  {
    id: "612b6c74-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Banco Industrial (BI)",
    razon_social: "Banco Industrial, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.170Z"),
    updated_at: new Date("2026-07-03T19:35:42.841Z"),
  },
  {
    id: "616085a9-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Banrural",
    razon_social: "Banco de Desarrollo Rural, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:43.189Z"),
  },
  {
    id: "61945a10-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "G&T Continental",
    razon_social: "Banco G&T Continental, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:43.529Z"),
  },
  {
    id: "61c7e0ff-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "BAC Credomatic",
    razon_social: "Banco de América Central, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:43.866Z"),
  },
  {
    id: "61fab7fc-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Bantrab",
    razon_social: "Banco de los Trabajadores",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:44.200Z"),
  },
  {
    id: "622e354b-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "BAM (Banco Agromercantil)",
    razon_social: "Banco Agromercantil de Guatemala, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:44.537Z"),
  },
  {
    id: "62614ea3-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Banco Promerica",
    razon_social: "Banco Promerica, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:44.872Z"),
  },
  {
    id: "629495cb-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Banco Cuscatlán",
    razon_social: "Banco Cuscatlán Guatemala, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:45.208Z"),
  },
  {
    id: "62c78034-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Interbanco",
    razon_social: "Banco Internacional, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:45.542Z"),
  },
  {
    id: "62fa937f-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "CHN (Crédito Hipotecario Nacional)",
    razon_social: "El Crédito Hipotecario Nacional de Guatemala",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:45.876Z"),
  },
  {
    id: "632da9bc-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Banco Ficohsa",
    razon_social: "Banco Ficohsa Guatemala, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:46.211Z"),
  },
  {
    id: "63607c33-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Banco Azteca",
    razon_social: "Banco Azteca de Guatemala, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:46.544Z"),
  },
  {
    id: "6393addf-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Banco Inmobiliario",
    razon_social: "Banco Inmobiliario, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:46.880Z"),
  },
  {
    id: "63c6b7bd-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Banco de Antigua",
    razon_social: "Banco de Antigua, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:47.214Z"),
  },
  {
    id: "63fa224e-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Vivibanco",
    razon_social: "Vivibanco, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:47.551Z"),
  },
  {
    id: "642d19a1-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Nexa Banco",
    razon_social: "Banco Nexa, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:47.885Z"),
  },
  {
    id: "64607689-7716-11f1-821e-1ce8d4b626a6",
    nombre_comercial: "Multimoney",
    razon_social: "Banco Multimoney, S. A.",
    activo: true,
    created_at: new Date("2026-07-03T13:35:31.000Z"),
    updated_at: new Date("2026-07-03T19:35:48.222Z"),
  },
];

export async function seedBancos(prisma: PrismaClient) {
  console.log("🏦 Iniciando seed de bancos...");

  for (const banco of bancosData) {
    await prisma.banco.upsert({
      where: { id: banco.id },
      update: {
        nombre_comercial: banco.nombre_comercial,
        razon_social: banco.razon_social,
        activo: banco.activo,
        updated_at: banco.updated_at,
      },
      create: {
        id: banco.id,
        nombre_comercial: banco.nombre_comercial,
        razon_social: banco.razon_social,
        activo: banco.activo,
        created_at: banco.created_at,
        updated_at: banco.updated_at,
      },
    });
  }

  console.log(`✅ Seed de bancos completado (${bancosData.length} procesados).`);
}
