import { PrismaClient } from "@prisma/client";

export const vehiculoTiposData = [
  {
    tipo: "Motocicleta",
    activo: true,
  },
  {
    tipo: "Automovil",
    activo: true,
  },
];

export async function seedVehiculoTipos(prisma: PrismaClient) {
  console.log("🏍️🚗 Iniciando seed de tipos de vehículo...");

  for (const item of vehiculoTiposData) {
    await prisma.vehiculoTipo.upsert({
      where: { tipo: item.tipo },
      update: {
        activo: item.activo,
      },
      create: {
        tipo: item.tipo,
        activo: item.activo,
      },
    });
  }

  console.log(
    `✅ Seed de tipos de vehículo completado (${vehiculoTiposData.length} procesados).`
  );
}
