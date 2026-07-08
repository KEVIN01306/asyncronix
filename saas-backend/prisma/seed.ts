import { PrismaClient } from '@prisma/client';
import { Argon2HashProvider } from '../src/shared/infrastructure/argon2-hash.provider';

const prisma = new PrismaClient();
const hashProvider = new Argon2HashProvider();

const permisosData = [
    { codigo: "ADMIN_USUARIOS" },
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
    { codigo: "ADMIN_SUCURSAL" },
    //{ codigo: "VER_NEGOCIOS" },
    //{ codigo: "VER_NEGOCIOS_DETALLE" },
    //{ codigo: "CREAR_NEGOCIOS" },
    { codigo: "VER_NEGOCIOS_DETALLE_ME" },
    { codigo: "EDITAR_NEGOCIOS" },
    { codigo: "NEGOCIOS_CAMBIAR_MONEDA" },

    { codigo: "VER_PERMISOS" },
    { codigo: "EDITAR_PERMISOS" },
    { codigo: "ASIGNAR_PERMISOS_ROL" },

    { codigo: "VER_CATEGORIAS_PRODUCTOS" },
    { codigo: "VER_CATEGORIAS_PRODUCTOS_DETALLE" },
    { codigo: "CREAR_CATEGORIAS_PRODUCTOS" },
    { codigo: "EDITAR_CATEGORIAS_PRODUCTOS" },
    { codigo: "ELIMINAR_CATEGORIAS_PRODUCTOS" },

    { codigo: "VER_PRODUCTOS" },
    { codigo: "VER_PRODUCTOS_DETALLE" },
    { codigo: "CREAR_PRODUCTOS" },
    { codigo: "EDITAR_PRODUCTOS" },
    { codigo: "ELIMINAR_PRODUCTOS" },
    { codigo: "BUSCAR_PRODUCTOS" },

    { codigo: "VER_LOTES" },
    { codigo: "VER_LOTES_DETALLE" },
    { codigo: "CREAR_LOTES" },

    { codigo: "VER_VENTAS" },
    { codigo: "VER_VENTAS_DETALLE" },
    { codigo: "CREAR_VENTAS" },
    { codigo: "EDITAR_VENTAS" },
    { codigo: "ANULAR_VENTAS" },
    { codigo: "VENTAS_FORZAR_STOCK" },

    { codigo: "VER_CLIENTES" },
    { codigo: "VER_CLIENTES_DETALLE" },
    { codigo: "CREAR_CLIENTES" },
    { codigo: "EDITAR_CLIENTES" },
    { codigo: "ELIMINAR_CLIENTES" },

    { codigo: "VER_CILINDRADAS" },
    { codigo: "VER_CILINDRADAS_DETALLE" },

    { codigo: "VER_MARCAS" },
    { codigo: "VER_MARCAS_DETALLE" },

    { codigo: "VER_LINEAS" },
    { codigo: "VER_LINEAS_DETALLE" },

    { codigo: "VER_MODELOS" },
    { codigo: "VER_MODELOS_DETALLE" },
    { codigo: "CREAR_MODELO" },
    { codigo: "ADMIN_MODELO" },

    { codigo: "VER_VEHICULOS" },
    { codigo: "VER_VEHICULOS_DETALLE" },
    { codigo: "CREAR_VEHICULOS" },
    { codigo: "EDITAR_VEHICULOS" },

    { codigo: "VER_VEHICULOS_TIPOS" },
    { codigo: "VER_OPCION_SERVICIO" },
    { codigo: "VER_OPCION_SERVICIO_DETALLE" },
    { codigo: "CREAR_OPCION_SERVICIO" },
    { codigo: "EDITAR_OPCION_SERVICIO" },
    { codigo: "ELIMINAR_OPCION_SERVICIO" },
    { codigo: "VER_TIPO_SERVICIO" },
    { codigo: "VER_TIPO_SERVICIO_DETALLE" },
    { codigo: "CREAR_TIPO_SERVICIO" },
    { codigo: "EDITAR_TIPO_SERVICIO" },
    { codigo: "ELIMINAR_TIPO_SERVICIO" },
    { codigo: "VER_CHECKLIST" },
    { codigo: "VER_CHECKLIST_DETALLE" },
    { codigo: "CREAR_CHECKLIST" },
    { codigo: "EDITAR_CHECKLIST" },
    { codigo: "ELIMINAR_CHECKLIST" },
    { codigo: "VER_SERVICIOS" },
    { codigo: "VER_SERVICIOS_DETALLE" },
    { codigo: "CREAR_SERVICIOS" },
    { codigo: "EDITAR_SERVICIOS" },
    { codigo: "ELIMINAR_SERVICIOS" },
    { codigo: "ADMIN_SERVICIOS" },
    { codigo: "CONFIGURACION_SERVICIOS" },
    { codigo: "SALIDA_SERVICIOS" },
    { codigo: "PROGRESO_SERVICIOS" },
    { codigo: "EDITAR_SERVICIOS_REPUESTOS" },

    { codigo: "VER_PROVEEDORES" },
    { codigo: "VER_PROVEEDORES_DETALLE" },
    { codigo: "CREAR_PROVEEDORES" },
    { codigo: "EDITAR_PROVEEDORES" },
    { codigo: "ELIMINAR_PROVEEDORES" },

    { codigo: "VER_ATRIBUTOS" },
    { codigo: "VER_ATRIBUTOS_DETALLE" },
    { codigo: "CREAR_ATRIBUTOS" },
    { codigo: "EDITAR_ATRIBUTOS" },
    { codigo: "ELIMINAR_ATRIBUTOS" },

    { codigo: "VER_TRASLADO" },
    { codigo: "VER_TRASLADO_DETALLE" },
    { codigo: "CREAR_TRASLADO" },
    { codigo: "CANCELAR_TRASLADO" },
    { codigo: "RECIBIR_TRASLADO" },

    { codigo: "VER_PAISES" },
    { codigo: "VER_DETALLE_PAIS" },

    { codigo: "VER_MONEDAS" },
    { codigo: "VER_DETALLE_MONEDA" },

    { codigo: "VER_CUENTA_BANCARIA" },
    { codigo: "VER_CUENTA_BANCARIA_DETALLE" },
    { codigo: "CREAR_CUENTA_BANCARIA" },
    { codigo: "EDITAR_CUENTA_BANCARIA" },
    { codigo: "ELIMINAR_CUENTA_BANCARIA" },

    { codigo: "VER_CAJAS" },
    { codigo: "VER_CAJAS_DETALLE" },
    { codigo: "CREAR_CAJAS" },
    { codigo: "EDITAR_CAJAS" },
    { codigo: "ELIMINAR_CAJAS" },

    { codigo: "VER_BANCOS" },
    { codigo: "VER_BANCOS_DETALLE" },


    { codigo: "VER_CATEGORIAS_TRANSACCION" },
    { codigo: "VER_CATEGORIAS_TRANSACCION_DETALLE" },
    { codigo: "CREAR_CATEGORIAS_TRANSACCION" },
    { codigo: "EDITAR_CATEGORIAS_TRANSACCION" },
    { codigo: "ELIMINAR_CATEGORIAS_TRANSACCION" },

    { codigo: "VER_MOVIMIENTOS" },
    { codigo: "VER_MOVIMIENTOS_DETALLE" },
    { codigo: "CREAR_MOVIMIENTOS" }

];

const modulosConPermisos = [
    {
        nombre: "USUARIOS",
        permisos: ["VER_USUARIOS", "VER_USUARIOS_DETALLE", "CREAR_USUARIOS", "EDITAR_USUARIOS", "ELIMINAR_USUARIOS", "ADMIN_USUARIOS"]
    },
    {
        nombre: "ROLES",
        permisos: ["VER_ROLES", "VER_ROLES_DETALLE", "CREAR_ROLES", "EDITAR_ROLES", "ELIMINAR_ROLES"]
    },
    {
        nombre: "SUCURSALES",
        permisos: ["VER_SUCURSALES", "VER_SUCURSALES_DETALLE", "CREAR_SUCURSALES", "EDITAR_SUCURSALES", "ELIMINAR_SUCURSALES", "ADMIN_SUCURSAL"]
    },
    {
        nombre: "NEGOCIOS",
        permisos: [/*"VER_NEGOCIOS", "VER_NEGOCIOS_DETALLE",*/ "VER_NEGOCIOS_DETALLE_ME",/* "CREAR_NEGOCIOS",*/ "EDITAR_NEGOCIOS", "NEGOCIOS_CAMBIAR_MONEDA"]
    },
    {
        nombre: "PAISES",
        permisos: ["VER_PAISES", "VER_DETALLE_PAIS"]
    },
    {
        nombre: "MONEDAS",
        permisos: ["VER_MONEDAS", "VER_DETALLE_MONEDA"]
    },
    {
        nombre: "PERMISOS",
        permisos: ["VER_PERMISOS", "EDITAR_PERMISOS", "ASIGNAR_PERMISOS_ROL"]
    },
    {
        nombre: "CATEGORIAS PRODUCTOS",
        permisos: ["VER_CATEGORIAS_PRODUCTOS", "VER_CATEGORIAS_PRODUCTOS_DETALLE", "CREAR_CATEGORIAS_PRODUCTOS", "EDITAR_CATEGORIAS_PRODUCTOS", "ELIMINAR_CATEGORIAS_PRODUCTOS"]
    },
    {
        nombre: "PRODUCTOS",
        permisos: ["VER_PRODUCTOS", "VER_PRODUCTOS_DETALLE", "CREAR_PRODUCTOS", "EDITAR_PRODUCTOS", "ELIMINAR_PRODUCTOS", "BUSCAR_PRODUCTOS"]
    },
    {
        nombre: "LOTES",
        permisos: ["VER_LOTES", "VER_LOTES_DETALLE", "CREAR_LOTES"]
    },
    {
        nombre: "VENTAS",
        permisos: ["VER_VENTAS", "VER_VENTAS_DETALLE", "CREAR_VENTAS", "EDITAR_VENTAS", "ANULAR_VENTAS", "VENTAS_FORZAR_STOCK"]
    },
    {
        nombre: "CLIENTES",
        permisos: ["VER_CLIENTES", "VER_CLIENTES_DETALLE", "CREAR_CLIENTES", "EDITAR_CLIENTES", "ELIMINAR_CLIENTES"]
    },
    {
        nombre: "CILINDRADAS",
        permisos: ["VER_CILINDRADAS", "VER_CILINDRADAS_DETALLE"]
    },
    {
        nombre: "MARCAS",
        permisos: ["VER_MARCAS", "VER_MARCAS_DETALLE"]
    },
    {
        nombre: "LINEAS",
        permisos: ["VER_LINEAS", "VER_LINEAS_DETALLE"]
    },
    {
        nombre: "MODELOS",
        permisos: ["VER_MODELOS", "VER_MODELOS_DETALLE", "CREAR_MODELO", "ADMIN_MODELO"]
    },
    {
        nombre: "VEHICULOS",
        permisos: ["VER_VEHICULOS", "VER_VEHICULOS_DETALLE", "CREAR_VEHICULOS", "EDITAR_VEHICULOS"]
    },
    {
        nombre: "TIPOS DE VEHICULOS",
        permisos: ["VER_VEHICULOS_TIPOS"]
    },
    {
        nombre: "OPCIONES SERVICIO",
        permisos: ["VER_OPCION_SERVICIO", "VER_OPCION_SERVICIO_DETALLE", "CREAR_OPCION_SERVICIO", "EDITAR_OPCION_SERVICIO", "ELIMINAR_OPCION_SERVICIO"]
    },
    {
        nombre: "TIPOS SERVICIO",
        permisos: ["VER_TIPO_SERVICIO", "VER_TIPO_SERVICIO_DETALLE", "CREAR_TIPO_SERVICIO", "EDITAR_TIPO_SERVICIO", "ELIMINAR_TIPO_SERVICIO"]
    },
    {
        nombre: "CHECKLIST ITEMS",
        permisos: ["VER_CHECKLIST", "VER_CHECKLIST_DETALLE", "CREAR_CHECKLIST", "EDITAR_CHECKLIST", "ELIMINAR_CHECKLIST"]
    },
    {
        nombre: "SERVICIOS",
        permisos: ["VER_SERVICIOS", "VER_SERVICIOS_DETALLE", "CREAR_SERVICIOS", "EDITAR_SERVICIOS", "ELIMINAR_SERVICIOS", "ADMIN_SERVICIOS", "EDITAR_SERVICIOS_REPUESTOS", "SALIDA_SERVICIOS", "PROGRESO_SERVICIOS", "CONFIGURACION_SERVICIOS"]
    },
    {
        nombre: "PROVEEDORES",
        permisos: ["VER_PROVEEDORES", "VER_PROVEEDORES_DETALLE", "CREAR_PROVEEDORES", "EDITAR_PROVEEDORES", "ELIMINAR_PROVEEDORES"]
    },
    {
        nombre: "ATRIBUTOS",
        permisos: ["VER_ATRIBUTOS", "VER_ATRIBUTOS_DETALLE", "CREAR_ATRIBUTOS", "EDITAR_ATRIBUTOS", "ELIMINAR_ATRIBUTOS"]
    },
    {
        nombre: "TRASLADOS",
        permisos: ["VER_TRASLADO", "VER_TRASLADO_DETALLE", "CREAR_TRASLADO", "CANCELAR_TRASLADO", "RECIBIR_TRASLADO"]
    },
    {
        nombre: "CUENTAS BANCARIAS",
        permisos: ["VER_CUENTA_BANCARIA", "VER_CUENTA_BANCARIA_DETALLE", "CREAR_CUENTA_BANCARIA", "EDITAR_CUENTA_BANCARIA", "ELIMINAR_CUENTA_BANCARIA"]
    },
    {
        nombre: "CAJAS",
        permisos: ["VER_CAJAS", "VER_CAJAS_DETALLE", "CREAR_CAJAS", "EDITAR_CAJAS", "ELIMINAR_CAJAS"]
    },
    {
        nombre: "BANCOS",
        permisos: ["VER_BANCOS", "VER_BANCOS_DETALLE"]
    },
    {
        nombre: "CATEGORIAS TRANSACCION",
        permisos: ["VER_CATEGORIAS_TRANSACCION", "VER_CATEGORIAS_TRANSACCION_DETALLE", "CREAR_CATEGORIAS_TRANSACCION", "EDITAR_CATEGORIAS_TRANSACCION", "ELIMINAR_CATEGORIAS_TRANSACCION"]
    },
    {
        nombre: "MOVIMIENTOS",
        permisos: ["VER_MOVIMIENTOS", "VER_MOVIMIENTOS_DETALLE", "CREAR_MOVIMIENTOS"]
    }
];
async function main() {

    // 0. Crear monedas y países iniciales
    /*
    console.log("Seeding Monedas...");
    const quetzal = await prisma.moneda.upsert({
        where: { codigo: 'GTQ' },
        update: {},
        create: {
            codigo: 'GTQ',
            nombre: 'Quetzal',
            simbolo: 'Q',
            activo: true
        }
    });

    const dollar = await prisma.moneda.upsert({
        where: { codigo: 'USD' },
        update: {},
        create: {
            codigo: 'USD',
            nombre: 'Dólar estadounidense',
            simbolo: '$',
            activo: true
        }
    });

    const peso = await prisma.moneda.upsert({
        where: { codigo: 'MXN' },
        update: {},
        create: {
            codigo: 'MXN',
            nombre: 'Peso mexicano',
            simbolo: '$',
            activo: true
        }
    });

    console.log("Seeding Países...");
    const guatemala = await prisma.pais.upsert({
        where: { codigo_iso: 'GT' },
        update: {},
        create: {
            codigo_iso: 'GT',
            nombre: 'Guatemala',
            codigo_tel: '+502',
            moneda_id: quetzal.id,
            activo: true
        }
    });

    const mexico = await prisma.pais.upsert({
        where: { codigo_iso: 'MX' },
        update: {},
        create: {
            codigo_iso: 'MX',
            nombre: 'México',
            codigo_tel: '+52',
            moneda_id: peso.id,
            activo: true
        }
    });

    const usa = await prisma.pais.upsert({
        where: { codigo_iso: 'US' },
        update: {},
        create: {
            codigo_iso: 'US',
            nombre: 'Estados Unidos',
            codigo_tel: '+1',
            moneda_id: dollar.id,
            activo: true
        }
    });
    */

    // 1. Asegurar la creación de módulos y sus permisos
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

    // 2. CORRECCIÓN: wa_id idénticos en where y create
    const whatsappId = "50230108703"; // Asegúrate de que este valor sea único para evitar conflictos en el upsert

    const negocio = await prisma.negocio.upsert({
        where: { wa_id: whatsappId },
        update: {
            permisos: {
                connect: permisosData.map(p => ({ codigo: p.codigo }))
            },
            modulos: {
                connect: modulosConPermisos.map(m => ({ nombre: m.nombre }))
            },
            /*
            pais_id: guatemala.id,
            moneda_id: quetzal.id
            */
        },
        create: {
            nombre: "Motoservicio VM",
            nombre_comercial: "MOTOSERVICIO VM",
            slug: "motoservicio-vm",
            wa_id: whatsappId, // Mismo valor que el where
            nit_rut: "50295769927",
            slogan: "Todos juntos podemos",
            permisos: {
                connect: permisosData.map(p => ({ codigo: p.codigo }))
            },
            modulos: {
                connect: modulosConPermisos.map(m => ({ nombre: m.nombre }))
            },
            /*
            pais_id: guatemala.id,
            moneda_id: quetzal.id
            */
        }
    });
    /*
    const negocio = await prisma.negocio.upsert({
        where: { wa_id: whatsappId }, 
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
            wa_id: whatsappId, // Mismo valor que el where
            nit_rut: "388577951",
            slogan: "Todos juntos podemos",
            permisos: {
                connect: permisosData.map(p => ({ codigo: p.codigo }))
            },
            modulos: {
                connect: modulosConPermisos.map(m => ({ nombre: m.nombre }))
            }
        }
    });*/

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
    /*
    const passwordHash = await hashProvider.hash("12345678");
    
    const usuarioAdmin = await prisma.usuario.upsert({
        where: { 
            negocio_id_email: { 
                negocio_id: negocio.id, 
                email: "kevin@gmail.com" 
            }
        },
        update: {},
        create: {
            nombre: "Kevin Eduardo",
            email: "kevin@gmail.com",
            telefono: "30108703",
            dpi: "3885779590101",
            password_hash: passwordHash,
            activo: true,
            verificado: false,
            negocio_id: negocio.id,
            roles: {
                connect: [{ id: rolAdmin.id }]
            }
        },
    });
    /*
    const usuarioAdmin = await prisma.usuario.upsert({
        where: {
            negocio_id_email: {
                negocio_id: negocio.id,
                email: " Motoserviciovm9793@gmail.com"
            }
        },
        update: {},
        create: {
            nombre: "Motoservicio VM",
            email: "Motoserviciovm9793@gmail.com",
            telefono: "43850429",
            dpi: "3018641870101",
            password_hash: passwordHash,
            activo: true,
            verificado: false,
            negocio_id: negocio.id,
            roles: {
                connect: [{ id: rolAdmin.id }]
            }
        },
    });
    /*
    // 4. Crear categorías default del sistema
    const categoriasDefault = [
        {
            categoria: "Vehículos",
            codigo: "VEH",
            subcategorias: [
                { categoria: "Autos", codigo: "AUT" },
                { categoria: "Motos", codigo: "MOT" },
                { categoria: "Camiones", codigo: "CAM" },
                { categoria: "Camionetas", codigo: "CMNTA" }
            ]
        },
        {
            categoria: "Repuestos",
            codigo: "REP",
            subcategorias: [
                { categoria: "Motor", codigo: "MOT-RP" },
                { categoria: "Suspensión", codigo: "SUS" },
                { categoria: "Frenos", codigo: "FRE" },
                { categoria: "Electricidad", codigo: "ELE" }
            ]
        },
        {
            categoria: "Servicios",
            codigo: "SER",
            subcategorias: [
                { categoria: "Mantenimiento", codigo: "MAN" },
                { categoria: "Reparación", codigo: "REP-SER" },
                { categoria: "Inspección", codigo: "INS" }
            ]
        },
        {
            categoria: "Accesorios",
            codigo: "ACC",
            subcategorias: [
                { categoria: "Interiores", codigo: "INT" },
                { categoria: "Exteriores", codigo: "EXT" },
                { categoria: "Protección", codigo: "PRO" }
            ]
        }
    ];

    for (const catPrincipal of categoriasDefault) {
        // Crear categoría principal
        let categoriaPrincipal = await prisma.categoriaProducto.findFirst({
            where: {
                categoria: catPrincipal.categoria,
                default_categoria: true,
                negocio_id: null
            }
        });

        if (!categoriaPrincipal) {
            categoriaPrincipal = await prisma.categoriaProducto.create({
                data: {
                    categoria: catPrincipal.categoria,
                    codigo: catPrincipal.codigo,
                    default_categoria: true,
                    activo: true,
                    negocio_id: null
                }
            });
        }

        // Crear subcategorías
        for (const subcat of catPrincipal.subcategorias) {
            let subcategoriaExiste = await prisma.categoriaProducto.findFirst({
                where: {
                    categoria: subcat.categoria,
                    default_categoria: true,
                    negocio_id: null,
                    categoria_padre_id: categoriaPrincipal.id
                }
            });

            if (!subcategoriaExiste) {
                await prisma.categoriaProducto.create({
                    data: {
                        categoria: subcat.categoria,
                        codigo: subcat.codigo,
                        default_categoria: true,
                        activo: true,
                        negocio_id: null,
                        categoria_padre_id: categoriaPrincipal.id
                    }
                });
            }
        }
    }   
    */
    console.log("✅ Categorías default creadas exitosamente");
    console.log("¡Seed ejecutado con éxito!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Error durante la ejecución del seed:", e); // IMPRESCINDIBLE para ver qué falla
        await prisma.$disconnect();
        //process.exit(1);
    });