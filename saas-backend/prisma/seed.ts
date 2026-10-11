import { PrismaClient } from "@prisma/client";
import {
    seedMonedas,
    seedPaises,
    seedDepartamentosGT,
    seedBancos,
    seedModulosYPermisos,
    seedNegocioYAdmin,
    seedVehiculoTipos,
} from "./seeds/index.js";

const prisma = new PrismaClient();

/**
 * Función auxiliar para asignar todos los permisos a un rol de un negocio específico identificado por NIT.
 */
export async function asignarTodosLosPermisosARol(nit: string, nombreRol: string) {
    console.log(`\n=============================================================`);
    console.log(`🔍 Buscando negocio con NIT: "${nit}" para asignar permisos al rol: "${nombreRol}"...`);
    console.log(`=============================================================`);

    await seedModulosYPermisos(prisma);

    const negocio = await prisma.negocio.findFirst({
        where: { nit_rut: nit },
    });

    if (!negocio) {
        console.error(`❌ ERROR: No se encontró ningún negocio con el NIT/RUT "${nit}".`);
        return null;
    }

    const todosLosPermisos = await prisma.permiso.findMany({
        select: { id: true, codigo: true },
    });

    // Vincular permisos al negocio
    await prisma.negocio.update({
        where: { id: negocio.id },
        data: {
            permisos: {
                connect: todosLosPermisos.map((p) => ({ id: p.id })),
            },
        },
    });

    // Upsert del rol
    const rolActualizado = await prisma.rol.upsert({
        where: {
            negocio_id_nombre: {
                negocio_id: negocio.id,
                nombre: nombreRol.trim(),
            },
        },
        update: {
            permisos: {
                set: [],
                connect: todosLosPermisos.map((p) => ({ id: p.id })),
            },
        },
        create: {
            nombre: nombreRol.trim(),
            negocio_id: negocio.id,
            permisos: {
                connect: todosLosPermisos.map((p) => ({ id: p.id })),
            },
        },
        include: {
            permisos: true,
        },
    });

    console.log(`🎉 Rol "${rolActualizado.nombre}" actualizado con ${rolActualizado.permisos.length} permisos para "${negocio.nombre}".\n`);
    return rolActualizado;
}

async function main() {
    console.log("🌱 Iniciando ejecución integral de Seeds en Base de Datos...");

    // 1. Catálogos base: Monedas y Países
    await seedMonedas(prisma);
    await seedPaises(prisma);

    // 2. Divisiones geográficas (Guatemala)
    await seedDepartamentosGT(prisma);

    // 3. Bancos y Catálogos vehiculares
    await seedBancos(prisma);
    await seedVehiculoTipos(prisma);

    // 4. Módulos y permisos del sistema
    await seedModulosYPermisos(prisma);

    // 5. Negocio inicial con Rol ADMIN y Usuario Administrador completo
    await seedNegocioYAdmin(prisma, {
        nombreNegocio: "Asyncronix SAAS",
        nombreComercial: "Asyncronix SAAS",
        slug: "asyncronix-saas",
        nitRut: "5888492",
        waId: "50230108703",
        slogan: "Software innovador para tu negocio",
        emailAdmin: "kevin60sanchez31@gmail.com",
        passwordAdmin: "12345678",
        nombreUsuario: "Kevin",
        apellidoUsuario: "Sanchez",
    });

    console.log("\n🚀 Todos los seeds han sido ejecutados exitosamente.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Error durante la ejecución del seed:", e);
        await prisma.$disconnect();
    });