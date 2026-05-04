import { PrismaClient } from '@prisma/client'
import { Argon2HashProvider } from '../src/shared/infrastructure/argon2-hash.provider'

const prisma = new PrismaClient();

const hashProvider = new Argon2HashProvider()

const permisosData = [
    { codigo: "VER_USUARIOS"},
    { codigo: "CREAR_USUARIOS"},
    { codigo: "EDITAR_USUARIOS"},
    { codigo: "ELIMINAR_USUARIOS"},
    { codigo: "VER_ROLES"},
    { codigo: "CREAR_ROLES"},
    { codigo: "EDITAR_ROLES"},
    { codigo: "ELIMINAR_ROLES"},
    { codigo: "VER_SUCURSALES"},
    { codigo: "CREAR_SUCURSALES"},
    { codigo: "EDITAR_SUCURSALES"},
    { codigo: "ELIMINAR_SUCURSALES"},
    { codigo: "VER_NEGOCIOS"},
    { codigo: "CREAR_NEGOCIOS"},
    { codigo: "EDITAR_NEGOCIOS"},
    { codigo: "VER_PERMISOS"},
    { codigo: "EDITAR_PERMISOS"},
]

const modulosData = [
    { nombre: "USUARIOS" },
    { nombre: "ROLES" },
    { nombre: "SUCURSALES" },
    { nombre: "NEGOCIOS" },
    { nombre: "PERMISOS" }
]

async function main() {

    await prisma.$transaction([
        prisma.modulo.create({
            data: {
                nombre: "USUARIOS",
                permisos: {
                    create: [
                        { codigo: "VER_USUARIOS"},
                        { codigo: "CREAR_USUARIOS"},
                        { codigo: "EDITAR_USUARIOS"},
                        { codigo: "ELIMINAR_USUARIOS"}
                    ]
                }
            }
        }),
        prisma.modulo.create({
            data: {
                nombre: "ROLES",
                permisos: {
                    create: [
                        { codigo: "VER_ROLES"},
                        { codigo: "CREAR_ROLES"},
                        { codigo: "EDITAR_ROLES"},
                        { codigo: "ELIMINAR_ROLES"}
                    ]
                }
            }
        }),
        prisma.modulo.create({
            data: {
                nombre: "SUCURSALES",
                permisos: {
                    create: [
                        { codigo: "VER_SUCURSALES"},
                        { codigo: "CREAR_SUCURSALES"},
                        { codigo: "EDITAR_SUCURSALES"},
                        { codigo: "ELIMINAR_SUCURSALES"}
                    ]
                }
            }
        }),
        prisma.modulo.create({
            data: {
                nombre: "NEGOCIOS",
                permisos: {
                    create: [
                        { codigo: "VER_NEGOCIOS"},
                        { codigo: "CREAR_NEGOCIOS"},
                        { codigo: "EDITAR_NEGOCIOS"},
                    ]
                }
            }
        }),
        prisma.modulo.create({
            data: {
                nombre: "PERMISOS",
                permisos: {
                    create: [
                        { codigo: "VER_PERMISOS"},
                        { codigo: "EDITAR_PERMISOS"},
                    ]
                }
            }
        })
    ])


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
            permisos: {
                connect: permisosData
            },
            modulos: {
                connect: modulosData
            }
        }
    });

    const rolAdmin = await prisma.rol.upsert({
        where: { negocio_id_nombre: { negocio_id: negocio.id, nombre: "ADMIN" } },
        update: {},
        create: {
            nombre: "ADMIN",
            negocio_id: negocio.id,
            permisos: {
                connect: permisosData
            }
        }
    })


    const usuarioAdmin = await prisma.usuario.upsert({
        where: { negocio_id_email: { negocio_id: negocio.id, email: "kevin@gmail.com" } },
        update: {},
        create: {
            nombre: "Kevin Eduardo",
            email: "kevin@gmail.com",
            telefono: "30108703",
            dpi: "3885779590101",
            password_hash: await hashProvider.hash("12345678"),
            activo: true,
            verificado: false,
            negocio_id: negocio.id,
            
            roles: {
                connect: [
                    { id: rolAdmin.id }
                ]
            }
        },
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