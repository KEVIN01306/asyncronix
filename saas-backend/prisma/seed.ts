import { PrismaClient } from '@prisma/client'
import { Argon2HashProvider } from '../src/shared/infrastructure/argon2-hash.provider'

const prisma = new PrismaClient();

const hashProvider = new Argon2HashProvider()

async function main() {

    const negocio = await prisma.negocio.upsert({
        where: { wa_id: "50230108703" },
        update: {},
        create: {
            nombre: "ASYNCRONIX",
            nombre_comercial: "ASYNCRONIX",
            slug:  "asyncronix",
            wa_id: "50230108703",
            nit_rut: "388577959",
            slogan: "Todos juntos podemos",
        }
    });


    const modulos = await prisma.modulo.createMany({
        data: [
            {nombre: "USUARIOS"},
            {nombre: "NEGOCIOS"},
            {nombre: "PRODUCTOS"}
        ]
    })

    const 

    const usuarioAdmin = await prisma.user.upsert({
        where: { telefono: "30108703" },
        update: {},
        create: {
            nombre: "Kevin Eduardo",
            email: "kevin@gmail.com",
            telefono: "30108703",
            tipo:     "EMPLEADO",
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