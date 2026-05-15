import { PrismaClient } from '@prisma/client';
import { Argon2HashProvider } from '../src/shared/infrastructure/argon2-hash.provider';

const prisma = new PrismaClient();
const hashProvider = new Argon2HashProvider();

const permisosData = [
    { codigo: "VER_USUARIOS" },
    { codigo: "VER_USUARIOS_DETALLE" },
    { codigo: "CREAR_USUARIOS" },
    { codigo: "EDITAR_USUARIOS" },
    { codigo: "ELIMINAR_USUARIOS" },
    { codigo: "VER_ROLES" },
    { codigo: "VER_ROLES_DETALLE" },
    { codigo: "CREAR_ROLES" },
    { codigo: "EDITAR_ROLES" },
    { codigo: "ELIMINAR_ROLES" },
    { codigo: "VER_SUCURSALES" },
    { codigo: "VER_SUCURSALES_DETALLE" },
    { codigo: "CREAR_SUCURSALES" },
    { codigo: "EDITAR_SUCURSALES" },
    { codigo: "ELIMINAR_SUCURSALES" },
    //{ codigo: "VER_NEGOCIOS" },
    { codigo: "VER_NEGOCIOS_DETALLE" },
    //{ codigo: "CREAR_NEGOCIOS" },
    { codigo: "EDITAR_NEGOCIOS" },
    { codigo: "VER_PERMISOS" },
    { codigo: "EDITAR_PERMISOS" },
    { codigo: "ASIGNAR_PERMISOS_ROL" },
];

const modulosConPermisos = [
    {
        nombre: "USUARIOS",
        permisos: ["VER_USUARIOS", "VER_USUARIOS_DETALLE", "CREAR_USUARIOS", "EDITAR_USUARIOS", "ELIMINAR_USUARIOS"]
    },
    {
        nombre: "ROLES",
        permisos: ["VER_ROLES", "VER_ROLES_DETALLE", "CREAR_ROLES", "EDITAR_ROLES", "ELIMINAR_ROLES"]
    },
    {
        nombre: "SUCURSALES",
        permisos: ["VER_SUCURSALES", "VER_SUCURSALES_DETALLE", "CREAR_SUCURSALES", "EDITAR_SUCURSALES", "ELIMINAR_SUCURSALES"]
    },
    {
        nombre: "NEGOCIOS",
        permisos: ["VER_NEGOCIOS", "VER_NEGOCIOS_DETALLE", "CREAR_NEGOCIOS", "EDITAR_NEGOCIOS"]
    },
    {
        nombre: "PERMISOS",
        permisos: ["VER_PERMISOS", "EDITAR_PERMISOS", "ASIGNAR_PERMISOS_ROL"]
    }
];

async function main() {

    for (const m of modulosConPermisos) {
        await prisma.modulo.upsert({
            where: { nombre: m.nombre },
            update: {
                permisos: {
                    connectOrCreate: m.permisos.map(codigo => ({
                        where: { codigo },
                        create: { codigo }
                    }))
                }
            },
            create: {
                nombre: m.nombre,
                permisos: {
                    create: m.permisos.map(codigo => ({ codigo }))
                }
            }
        });
    }

    const negocio = await prisma.negocio.upsert({
        where: { wa_id: "50243850410" },
        update: {
            permisos: {
                connect: permisosData.map(p => ({ codigo: p.codigo }))
            },
            modulos: {
                connect: modulosConPermisos.map(m => ({ nombre: m.nombre }))
            }
        },
        create: {
            nombre: "MOTOSERVICIO VM",
            nombre_comercial: "MOTOSERVICIO VELASQUEZ MONZON",
            slug: "motoservicio-vm",
            wa_id: "50243850410",
            nit_rut: "388577951",
            slogan: "Todos juntos podemos",
            permisos: {
                connect: permisosData.map(p => ({ codigo: p.codigo }))
            },
            modulos: {
                connect: modulosConPermisos.map(m => ({ nombre: m.nombre }))
            }
        }
    });

    const rolAdmin = await prisma.rol.upsert({
        where: { 
            negocio_id_nombre: { 
                negocio_id: negocio.id, 
                nombre: "ADMIN" 
            } 
        },
        update: {
            permisos: {
                set: [],
                connect: permisosData.map(p => ({ codigo: p.codigo }))
            }
        },
        create: {
            nombre: "ADMIN",
            negocio_id: negocio.id,
            permisos: {
                connect: permisosData.map(p => ({ codigo: p.codigo }))
            }
        }
    });

    const passwordHash = await hashProvider.hash("12345678");
    const usuarioAdmin = await prisma.usuario.upsert({
        where: { 
            negocio_id_email: { 
                negocio_id: negocio.id, 
                email: "kimberly@gmail.com" 
            } 
        },
        update: {},
        create: {
            nombre: "Kimberly",
            email: "kimberly@gmail.com",
            telefono: "30108704",
            dpi: "3885779590104",
            password_hash: passwordHash,
            activo: true,
            verificado: false,
            negocio_id: negocio.id,
            roles: {
                connect: [{ id: rolAdmin.id }]
            }
        },
    });

}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        await prisma.$disconnect();
    });