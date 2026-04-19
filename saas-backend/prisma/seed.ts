import { PrismaClient } from '@prisma/client'
import { Argon2HashProvider } from '../src/shared/infrastructure/argon2-hash.provider'

const prisma = new PrismaClient();

const hashProvider = new Argon2HashProvider()

async function main() {

    const negocio = await prisma.negocios.upsert({
        where: { wa_id: "50230108703" },
        update: {},
        create: {
            nombre_comercial: "Foxtin",
            wa_id: "50230108703",
            nit_rut: "388577959",
            slogan: "Todos juntos podemos",
        }
    });

    const usuarioAdmin = await prisma.usuarios.upsert({
        where: { telefono: "30108703" },
        update: {},
        create: {
            nombre: "Kevin Eduardo",
            email: "email"
            telefono: "30108703",
            password_hash: await hashProvider.hash("12345678"),
            activo: true,
            verificado: false,
            negocio_id: negocio.id
        }
    })
}


main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
    })