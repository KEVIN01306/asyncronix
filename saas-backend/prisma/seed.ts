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

    { codigo: "VER_COTIZACIONES" },
    { codigo: "VER_COTIZACIONES_DETALLE" },
    { codigo: "CREAR_COTIZACIONES" },
    { codigo: "EDITAR_COTIZACIONES" },
    { codigo: "ELIMINAR_COTIZACIONES" },
    { codigo: "CONVERTIR_COTIZACIONES" },

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

    { codigo: "VER_INGRESOS_EGRESOS" },
    { codigo: "VER_INGRESOS_EGRESOS_DETALLE" },
    { codigo: "CREAR_INGRESOS_EGRESOS" },

    { codigo: "VER_MOVIMIENTOS" },
    { codigo: "VER_MOVIMIENTOS_DETALLE" },
    { codigo: "CREAR_MOVIMIENTOS" },

    { codigo: "REPORTES_FINANCIERO" },
    { codigo: "ADMIN_REPORTES" }
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
        nombre: "COTIZACIONES",
        permisos: ["VER_COTIZACIONES", "VER_COTIZACIONES_DETALLE", "CREAR_COTIZACIONES", "EDITAR_COTIZACIONES", "ELIMINAR_COTIZACIONES", "CONVERTIR_COTIZACIONES"]
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
        nombre: "INGRESOS_EGRESOS",
        permisos: ["VER_INGRESOS_EGRESOS", "VER_INGRESOS_EGRESOS_DETALLE", "CREAR_INGRESOS_EGRESOS"]
    },
    {
        nombre: "MOVIMIENTOS",
        permisos: ["VER_MOVIMIENTOS", "VER_MOVIMIENTOS_DETALLE", "CREAR_MOVIMIENTOS"]
    },
    {
        nombre: "REPORTES",
        permisos: ["REPORTES_FINANCIERO", "ADMIN_REPORTES"]
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


interface MunicipioSeed {
    nombre: string;
    codigo_postal: string;
}

interface DepartamentoSeed {
    nombre: string;
    codigo_iso: string;
    municipios: MunicipioSeed[];
}

const guatemalaData: DepartamentoSeed[] = [
    {
        nombre: "Guatemala",
        codigo_iso: "GT-GU",
        municipios: [
            { nombre: "Guatemala", codigo_postal: "01001" },
            { nombre: "Santa Catarina Pinula", codigo_postal: "01051" },
            { nombre: "San José Pinula", codigo_postal: "01052" },
            { nombre: "San José del Golfo", codigo_postal: "01053" },
            { nombre: "Palencia", codigo_postal: "01054" },
            { nombre: "Chinautla", codigo_postal: "01055" },
            { nombre: "San Pedro Ayampuc", codigo_postal: "01056" },
            { nombre: "Mixco", codigo_postal: "01057" },
            { nombre: "San Pedro Sacatepéquez", codigo_postal: "01058" },
            { nombre: "San Juan Sacatepéquez", codigo_postal: "01059" },
            { nombre: "San Raymundo", codigo_postal: "01060" },
            { nombre: "Chuarrancho", codigo_postal: "01061" },
            { nombre: "Fraijanes", codigo_postal: "01062" },
            { nombre: "Amatitlán", codigo_postal: "01063" },
            { nombre: "Villa Nueva", codigo_postal: "01064" },
            { nombre: "Villa Canales", codigo_postal: "01065" },
            { nombre: "San Miguel Petapa", codigo_postal: "01066" },
        ],
    },
    {
        nombre: "Sacatepéquez",
        codigo_iso: "GT-SA",
        municipios: [
            { nombre: "Antigua Guatemala", codigo_postal: "03001" },
            { nombre: "Jocotenango", codigo_postal: "03002" },
            { nombre: "Pastores", codigo_postal: "03003" },
            { nombre: "Sumpango", codigo_postal: "03004" },
            { nombre: "Santo Domingo Xenacoj", codigo_postal: "03005" },
            { nombre: "Santiago Sacatepéquez", codigo_postal: "03006" },
            { nombre: "San Bartolomé Milpas Altas", codigo_postal: "03007" },
            { nombre: "San Lucas Sacatepéquez", codigo_postal: "03008" },
            { nombre: "Santa Lucía Milpas Altas", codigo_postal: "03009" },
            { nombre: "Magdalena Milpas Altas", codigo_postal: "03010" },
            { nombre: "Santa María de Jesús", codigo_postal: "03011" },
            { nombre: "Ciudad Vieja", codigo_postal: "03012" },
            { nombre: "San Miguel Dueñas", codigo_postal: "03013" },
            { nombre: "Alotenango", codigo_postal: "03014" },
            { nombre: "San Antonio Aguas Calientes", codigo_postal: "03015" },
            { nombre: "Santa Catarina Barahona", codigo_postal: "03016" },
        ],
    },
    {
        nombre: "Chimaltenango",
        codigo_iso: "GT-CM",
        municipios: [
            { nombre: "Chimaltenango", codigo_postal: "04001" },
            { nombre: "San José Poaquil", codigo_postal: "04002" },
            { nombre: "San Martín Jilotepeque", codigo_postal: "04003" },
            { nombre: "San Juan Comalapa", codigo_postal: "04004" },
            { nombre: "Santa Apolonia", codigo_postal: "04005" },
            { nombre: "Tecpán Guatemala", codigo_postal: "04006" },
            { nombre: "Patzún", codigo_postal: "04007" },
            { nombre: "San Miguel Pochuta", codigo_postal: "04008" },
            { nombre: "Patzicía", codigo_postal: "04009" },
            { nombre: "Santa Cruz Balanyá", codigo_postal: "04010" },
            { nombre: "Acatenango", codigo_postal: "04011" },
            { nombre: "San Pedro Yepocapa", codigo_postal: "04012" },
            { nombre: "San Andrés Itzapa", codigo_postal: "04013" },
            { nombre: "Parramos", codigo_postal: "04014" },
            { nombre: "Zaragoza", codigo_postal: "04015" },
            { nombre: "El Tejar", codigo_postal: "04016" },
        ],
    },
    {
        nombre: "El Progreso",
        codigo_iso: "GT-PR",
        municipios: [
            { nombre: "Guastatoya", codigo_postal: "02001" },
            { nombre: "Morazán", codigo_postal: "02002" },
            { nombre: "San Agustín Acasaguastlán", codigo_postal: "02003" },
            { nombre: "San Cristóbal Acasaguastlán", codigo_postal: "02004" },
            { nombre: "El Jícaro", codigo_postal: "02005" },
            { nombre: "Sansare", codigo_postal: "02006" },
            { nombre: "Sanarate", codigo_postal: "02007" },
            { nombre: "San Antonio La Paz", codigo_postal: "02008" },
        ],
    },
    {
        nombre: "Escuintla",
        codigo_iso: "GT-ES",
        municipios: [
            { nombre: "Escuintla", codigo_postal: "05001" },
            { nombre: "Santa Lucía Cotzumalguapa", codigo_postal: "05002" },
            { nombre: "La Democracia", codigo_postal: "05003" },
            { nombre: "Siquinalá", codigo_postal: "05004" },
            { nombre: "Masagua", codigo_postal: "05005" },
            { nombre: "Tiquisate", codigo_postal: "05006" },
            { nombre: "La Gomera", codigo_postal: "05007" },
            { nombre: "Guanagazapa", codigo_postal: "05008" },
            { nombre: "San José", codigo_postal: "05009" },
            { nombre: "Iztapa", codigo_postal: "05010" },
            { nombre: "Palín", codigo_postal: "05011" },
            { nombre: "San Vicente Pacaya", codigo_postal: "05012" },
            { nombre: "Nueva Concepción", codigo_postal: "05013" },
            { nombre: "Sipacate", codigo_postal: "05014" },
        ],
    },
    {
        nombre: "Santa Rosa",
        codigo_iso: "GT-SR",
        municipios: [
            { nombre: "Cuilapa", codigo_postal: "06001" },
            { nombre: "Barberena", codigo_postal: "06002" },
            { nombre: "Santa Rosa de Lima", codigo_postal: "06003" },
            { nombre: "Casillas", codigo_postal: "06004" },
            { nombre: "San Rafael Las Flores", codigo_postal: "06005" },
            { nombre: "Oratorio", codigo_postal: "06006" },
            { nombre: "San Juan Tecuaco", codigo_postal: "06007" },
            { nombre: "Chiquimulilla", codigo_postal: "06008" },
            { nombre: "Taxisco", codigo_postal: "06009" },
            { nombre: "Santa María Ixhuatán", codigo_postal: "06010" },
            { nombre: "Guazacapán", codigo_postal: "06011" },
            { nombre: "Santa Cruz Naranjo", codigo_postal: "06012" },
            { nombre: "Pueblo Nuevo Viñas", codigo_postal: "06013" },
            { nombre: "Nueva Santa Rosa", codigo_postal: "06014" },
        ],
    },
    {
        nombre: "Sololá",
        codigo_iso: "GT-SO",
        municipios: [
            { nombre: "Sololá", codigo_postal: "07001" },
            { nombre: "San José Chacayá", codigo_postal: "07002" },
            { nombre: "Santa María Visitación", codigo_postal: "07003" },
            { nombre: "Santa Lucía Utatlán", codigo_postal: "07004" },
            { nombre: "Nahualá", codigo_postal: "07005" },
            { nombre: "Santa Catarina Ixtahuacán", codigo_postal: "07006" },
            { nombre: "Santa Clara La Laguna", codigo_postal: "07007" },
            { nombre: "Concepción", codigo_postal: "07008" },
            { nombre: "San Andrés Semetabaj", codigo_postal: "07009" },
            { nombre: "Panajachel", codigo_postal: "07010" },
            { nombre: "Santa Catarina Palopó", codigo_postal: "07011" },
            { nombre: "San Antonio Palopó", codigo_postal: "07012" },
            { nombre: "San Lucas Tolimán", codigo_postal: "07013" },
            { nombre: "Santa Cruz La Laguna", codigo_postal: "07014" },
            { nombre: "San Pablo La Laguna", codigo_postal: "07015" },
            { nombre: "San Marcos La Laguna", codigo_postal: "07016" },
            { nombre: "San Juan La Laguna", codigo_postal: "07017" },
            { nombre: "San Pedro La Laguna", codigo_postal: "07018" },
            { nombre: "Santiago Atitlán", codigo_postal: "07019" },
        ],
    },
    {
        nombre: "Totonicapán",
        codigo_iso: "GT-TO",
        municipios: [
            { nombre: "Totonicapán", codigo_postal: "08001" },
            { nombre: "San Cristóbal Totonicapán", codigo_postal: "08002" },
            { nombre: "San Francisco El Alto", codigo_postal: "08003" },
            { nombre: "San Andrés Xecul", codigo_postal: "08004" },
            { nombre: "Momostenango", codigo_postal: "08005" },
            { nombre: "Santa María Chiquimula", codigo_postal: "08006" },
            { nombre: "Santa Lucía La Reforma", codigo_postal: "08007" },
            { nombre: "San Bartolo", codigo_postal: "08008" },
        ],
    },
    {
        nombre: "Quetzaltenango",
        codigo_iso: "GT-QZ",
        municipios: [
            { nombre: "Quetzaltenango", codigo_postal: "09001" },
            { nombre: "Salcajá", codigo_postal: "09002" },
            { nombre: "Olintepeque", codigo_postal: "09003" },
            { nombre: "San Carlos Sija", codigo_postal: "09004" },
            { nombre: "Sibilia", codigo_postal: "09005" },
            { nombre: "Cabricán", codigo_postal: "09006" },
            { nombre: "Cajolá", codigo_postal: "09007" },
            { nombre: "San Miguel Siguilá", codigo_postal: "09008" },
            { nombre: "Ostuncalco", codigo_postal: "09009" },
            { nombre: "San Mateo", codigo_postal: "09010" },
            { nombre: "Concepción Chiquirichapa", codigo_postal: "09011" },
            { nombre: "San Martín Sacatepéquez", codigo_postal: "09012" },
            { nombre: "Almolonga", codigo_postal: "09013" },
            { nombre: "Cantel", codigo_postal: "09014" },
            { nombre: "Huitán", codigo_postal: "09015" },
            { nombre: "Zunil", codigo_postal: "09016" },
            { nombre: "Colomba", codigo_postal: "09017" },
            { nombre: "San Francisco La Unión", codigo_postal: "09018" },
            { nombre: "El Palmar", codigo_postal: "09019" },
            { nombre: "Coatepeque", codigo_postal: "09020" },
            { nombre: "Génova", codigo_postal: "09021" },
            { nombre: "Flores Costa Cuca", codigo_postal: "09022" },
            { nombre: "La Esperanza", codigo_postal: "09023" },
            { nombre: "Palestina de Los Altos", codigo_postal: "09024" },
        ],
    },
    {
        nombre: "Suchitepéquez",
        codigo_iso: "GT-SU",
        municipios: [
            { nombre: "Mazatenango", codigo_postal: "10001" },
            { nombre: "Cuyotenango", codigo_postal: "10002" },
            { nombre: "San Francisco Zapotitlán", codigo_postal: "10003" },
            { nombre: "San Bernardino", codigo_postal: "10004" },
            { nombre: "San José El Idolo", codigo_postal: "10005" },
            { nombre: "Santo Domingo Suchitepéquez", codigo_postal: "10006" },
            { nombre: "San Lorenzo", codigo_postal: "10007" },
            { nombre: "Samayac", codigo_postal: "10008" },
            { nombre: "San Pablo Jocopilas", codigo_postal: "10009" },
            { nombre: "San Antonio Suchitepéquez", codigo_postal: "10010" },
            { nombre: "San Miguel Panán", codigo_postal: "10011" },
            { nombre: "San Gabriel", codigo_postal: "10012" },
            { nombre: "Chicacao", codigo_postal: "10013" },
            { nombre: "Patulul", codigo_postal: "10014" },
            { nombre: "Santa Bárbara", codigo_postal: "10015" },
            { nombre: "San Juan Bautista", codigo_postal: "10016" },
            { nombre: "Santo Tomás La Unión", codigo_postal: "10017" },
            { nombre: "Zunilito", codigo_postal: "10018" },
            { nombre: "Pueblo Nuevo", codigo_postal: "10019" },
            { nombre: "Río Bravo", codigo_postal: "10020" },
            { nombre: "San José La Máquina", codigo_postal: "10021" },
        ],
    },
    {
        nombre: "Retalhuleu",
        codigo_iso: "GT-RE",
        municipios: [
            { nombre: "Retalhuleu", codigo_postal: "11001" },
            { nombre: "San Sebastián", codigo_postal: "11002" },
            { nombre: "Santa Cruz Muluá", codigo_postal: "11003" },
            { nombre: "San Martín Zapotitlán", codigo_postal: "11004" },
            { nombre: "San Felipe", codigo_postal: "11005" },
            { nombre: "San Andrés Villa Seca", codigo_postal: "11006" },
            { nombre: "Champerico", codigo_postal: "11007" },
            { nombre: "Nuevo San Carlos", codigo_postal: "11008" },
            { nombre: "El Asintal", codigo_postal: "11009" },
        ],
    },
    {
        nombre: "San Marcos",
        codigo_iso: "GT-SM",
        municipios: [
            { nombre: "San Marcos", codigo_postal: "12001" },
            { nombre: "San Pedro Sacatepéquez", codigo_postal: "12002" },
            { nombre: "San Antonio Sacatepéquez", codigo_postal: "12003" },
            { nombre: "Comitancillo", codigo_postal: "12004" },
            { nombre: "San Miguel Ixtahuacán", codigo_postal: "12005" },
            { nombre: "Concepción Tutuapa", codigo_postal: "12006" },
            { nombre: "Tacaná", codigo_postal: "12007" },
            { nombre: "Sibinal", codigo_postal: "12008" },
            { nombre: "Tajumulco", codigo_postal: "12009" },
            { nombre: "Tejutla", codigo_postal: "12010" },
            { nombre: "San Rafael Pie de la Cuesta", codigo_postal: "12011" },
            { nombre: "Nuevo Progreso", codigo_postal: "12012" },
            { nombre: "El Tumbador", codigo_postal: "12013" },
            { nombre: "El Rodeo", codigo_postal: "12014" },
            { nombre: "Malacatán", codigo_postal: "12015" },
            { nombre: "Catarina", codigo_postal: "12016" },
            { nombre: "Ayutla", codigo_postal: "12017" },
            { nombre: "Ocós", codigo_postal: "12018" },
            { nombre: "San Pablo", codigo_postal: "12019" },
            { nombre: "El Quetzal", codigo_postal: "12020" },
            { nombre: "La Reforma", codigo_postal: "12021" },
            { nombre: "Pajapita", codigo_postal: "12022" },
            { nombre: "Ixchiguán", codigo_postal: "12023" },
            { nombre: "San José Ojetenam", codigo_postal: "12024" },
            { nombre: "San Cristóbal Cucho", codigo_postal: "12025" },
            { nombre: "Sipacapa", codigo_postal: "12026" },
            { nombre: "Esquipulas Palo Gordo", codigo_postal: "12027" },
            { nombre: "Río Blanco", codigo_postal: "12028" },
            { nombre: "San Lorenzo", codigo_postal: "12029" },
            { nombre: "La Blanca", codigo_postal: "12030" },
        ],
    },
    {
        nombre: "Huehuetenango",
        codigo_iso: "GT-HU",
        municipios: [
            { nombre: "Huehuetenango", codigo_postal: "13001" },
            { nombre: "Chiantla", codigo_postal: "13002" },
            { nombre: "Malacatancito", codigo_postal: "13003" },
            { nombre: "Cuilco", codigo_postal: "13004" },
            { nombre: "Nentón", codigo_postal: "13005" },
            { nombre: "San Pedro Necta", codigo_postal: "13006" },
            { nombre: "Jacaltenango", codigo_postal: "13007" },
            { nombre: "Soloma", codigo_postal: "13008" },
            { nombre: "Ixtahuacán", codigo_postal: "13009" },
            { nombre: "Santa Bárbara", codigo_postal: "13010" },
            { nombre: "La Libertad", codigo_postal: "13011" },
            { nombre: "La Democracia", codigo_postal: "13012" },
            { nombre: "San Miguel Acatán", codigo_postal: "13013" },
            { nombre: "San Rafael La Independencia", codigo_postal: "13014" },
            { nombre: "Todos Santos Cuchumatán", codigo_postal: "13015" },
            { nombre: "San Juan Atitán", codigo_postal: "13016" },
            { nombre: "Santa Eulalia", codigo_postal: "13017" },
            { nombre: "San Mateo Ixtatán", codigo_postal: "13018" },
            { nombre: "Colotenango", codigo_postal: "13019" },
            { nombre: "San Sebastián Huehuetenango", codigo_postal: "13020" },
            { nombre: "Tectitán", codigo_postal: "13021" },
            { nombre: "Concepción Huista", codigo_postal: "13022" },
            { nombre: "San Juan Ixcoy", codigo_postal: "13023" },
            { nombre: "San Antonio Huista", codigo_postal: "13024" },
            { nombre: "San Sebastián Coatán", codigo_postal: "13025" },
            { nombre: "Barillas", codigo_postal: "13026" },
            { nombre: "Aguacatán", codigo_postal: "13027" },
            { nombre: "San Rafael Petzal", codigo_postal: "13028" },
            { nombre: "San Gaspar Ixchil", codigo_postal: "13029" },
            { nombre: "Santiago Chimaltenango", codigo_postal: "13030" },
            { nombre: "Santa Ana Huista", codigo_postal: "13031" },
            { nombre: "Unión Cantinil", codigo_postal: "13032" },
            { nombre: "Petatán", codigo_postal: "13033" },
        ],
    },
    {
        nombre: "Quiché",
        codigo_iso: "GT-QC",
        municipios: [
            { nombre: "Santa Cruz del Quiché", codigo_postal: "14001" },
            { nombre: "Chiché", codigo_postal: "14002" },
            { nombre: "Chinique", codigo_postal: "14003" },
            { nombre: "Zacualpa", codigo_postal: "14004" },
            { nombre: "Chajul", codigo_postal: "14005" },
            { nombre: "Chichicastenango", codigo_postal: "14006" },
            { nombre: "Patzité", codigo_postal: "14007" },
            { nombre: "San Antonio Ilotenango", codigo_postal: "14008" },
            { nombre: "San Pedro Jocopilas", codigo_postal: "14009" },
            { nombre: "Cunén", codigo_postal: "14010" },
            { nombre: "San Juan Cotzal", codigo_postal: "14011" },
            { nombre: "Joyabaj", codigo_postal: "14012" },
            { nombre: "Nebaj", codigo_postal: "14013" },
            { nombre: "San Andrés Sajcabajá", codigo_postal: "14014" },
            { nombre: "Uspantán", codigo_postal: "14015" },
            { nombre: "Sacapulas", codigo_postal: "14016" },
            { nombre: "San Bartolomé Jocotenango", codigo_postal: "14017" },
            { nombre: "Canillá", codigo_postal: "14018" },
            { nombre: "Chicamán", codigo_postal: "14019" },
            { nombre: "Ixcán", codigo_postal: "14020" },
            { nombre: "Pachalum", codigo_postal: "14021" },
        ],
    },
    {
        nombre: "Baja Verapaz",
        codigo_iso: "GT-BV",
        municipios: [
            { nombre: "Salamá", codigo_postal: "15001" },
            { nombre: "San Miguel Chicaj", codigo_postal: "15002" },
            { nombre: "Rabinal", codigo_postal: "15003" },
            { nombre: "Cubulco", codigo_postal: "15004" },
            { nombre: "Granados", codigo_postal: "15005" },
            { nombre: "Santa Cruz El Chol", codigo_postal: "15006" },
            { nombre: "San Jerónimo", codigo_postal: "15007" },
            { nombre: "Purulhá", codigo_postal: "15008" },
        ],
    },
    {
        nombre: "Alta Verapaz",
        codigo_iso: "GT-AV",
        municipios: [
            { nombre: "Cobán", codigo_postal: "16001" },
            { nombre: "Santa Cruz Verapaz", codigo_postal: "16002" },
            { nombre: "San Cristóbal Verapaz", codigo_postal: "16003" },
            { nombre: "Tactic", codigo_postal: "16004" },
            { nombre: "Tamahú", codigo_postal: "16005" },
            { nombre: "Tucurú", codigo_postal: "16006" },
            { nombre: "Panzós", codigo_postal: "16007" },
            { nombre: "Senahú", codigo_postal: "16008" },
            { nombre: "San Pedro Carchá", codigo_postal: "16009" },
            { nombre: "San Juan Chamelco", codigo_postal: "16010" },
            { nombre: "Lanquín", codigo_postal: "16011" },
            { nombre: "Cahabón", codigo_postal: "16012" },
            { nombre: "Chisec", codigo_postal: "16013" },
            { nombre: "Chahal", codigo_postal: "16014" },
            { nombre: "Fray Bartolomé de las Casas", codigo_postal: "16015" },
            { nombre: "Santa Catarina La Tinta", codigo_postal: "16016" },
            { nombre: "Raxruhá", codigo_postal: "16017" },
        ],
    },
    {
        nombre: "Petén",
        codigo_iso: "GT-PE",
        municipios: [
            { nombre: "Flores", codigo_postal: "17001" },
            { nombre: "San José", codigo_postal: "17002" },
            { nombre: "San Benito", codigo_postal: "17003" },
            { nombre: "San Andrés", codigo_postal: "17004" },
            { nombre: "La Libertad", codigo_postal: "17005" },
            { nombre: "San Francisco", codigo_postal: "17006" },
            { nombre: "Santa Ana", codigo_postal: "17007" },
            { nombre: "Dolores", codigo_postal: "17008" },
            { nombre: "San Luis", codigo_postal: "17009" },
            { nombre: "Sayaxché", codigo_postal: "17010" },
            { nombre: "Melchor de Mencos", codigo_postal: "17011" },
            { nombre: "Poptún", codigo_postal: "17012" },
            { nombre: "Las Cruces", codigo_postal: "17013" },
            { nombre: "El Chal", codigo_postal: "17014" },
        ],
    },
    {
        nombre: "Izabal",
        codigo_iso: "GT-IZ",
        municipios: [
            { nombre: "Puerto Barrios", codigo_postal: "18001" },
            { nombre: "Livingston", codigo_postal: "18002" },
            { nombre: "El Estor", codigo_postal: "18003" },
            { nombre: "Morales", codigo_postal: "18004" },
            { nombre: "Los Amates", codigo_postal: "18005" },
        ],
    },
    {
        nombre: "Zacapa",
        codigo_iso: "GT-ZA",
        municipios: [
            { nombre: "Zacapa", codigo_postal: "19001" },
            { nombre: "Estanzuela", codigo_postal: "19002" },
            { nombre: "Río Hondo", codigo_postal: "19003" },
            { nombre: "Gualán", codigo_postal: "19004" },
            { nombre: "Teculután", codigo_postal: "19005" },
            { nombre: "Usumatlán", codigo_postal: "19006" },
            { nombre: "Cabañas", codigo_postal: "19007" },
            { nombre: "San Diego", codigo_postal: "19008" },
            { nombre: "La Unión", codigo_postal: "19009" },
            { nombre: "Huité", codigo_postal: "19010" },
            { nombre: "San Jorge", codigo_postal: "19011" },
        ],
    },
    {
        nombre: "Chiquimula",
        codigo_iso: "GT-CQ",
        municipios: [
            { nombre: "Chiquimula", codigo_postal: "20001" },
            { nombre: "San José La Arada", codigo_postal: "20002" },
            { nombre: "San Juan Ermita", codigo_postal: "20003" },
            { nombre: "Jocotán", codigo_postal: "20004" },
            { nombre: "Camotán", codigo_postal: "20005" },
            { nombre: "Olopa", codigo_postal: "20006" },
            { nombre: "Esquipulas", codigo_postal: "20007" },
            { nombre: "Concepción Las Minas", codigo_postal: "20008" },
            { nombre: "Quetzaltepeque", codigo_postal: "20009" },
            { nombre: "San Jacinto", codigo_postal: "20010" },
            { nombre: "Ipala", codigo_postal: "20011" },
        ],
    },
    {
        nombre: "Jalapa",
        codigo_iso: "GT-JA",
        municipios: [
            { nombre: "Jalapa", codigo_postal: "21001" },
            { nombre: "San Pedro Pinula", codigo_postal: "21002" },
            { nombre: "San Luis Jilotepeque", codigo_postal: "21003" },
            { nombre: "San Manuel Chaparrón", codigo_postal: "21004" },
            { nombre: "San Carlos Alzatate", codigo_postal: "21005" },
            { nombre: "Monjas", codigo_postal: "21006" },
            { nombre: "Mataquescuintla", codigo_postal: "21007" },
        ],
    },
    {
        nombre: "Jutiapa",
        codigo_iso: "GT-JU",
        municipios: [
            { nombre: "Jutiapa", codigo_postal: "22001" },
            { nombre: "El Progreso", codigo_postal: "22002" },
            { nombre: "Santa Catarina Mita", codigo_postal: "22003" },
            { nombre: "Agua Blanca", codigo_postal: "22004" },
            { nombre: "Asunción Mita", codigo_postal: "22005" },
            { nombre: "Yupiltepeque", codigo_postal: "22006" },
            { nombre: "Atescatempa", codigo_postal: "22007" },
            { nombre: "Jerez", codigo_postal: "22008" },
            { nombre: "El Adelanto", codigo_postal: "22009" },
            { nombre: "Zapotitlán", codigo_postal: "22010" },
            { nombre: "Comapa", codigo_postal: "22011" },
            { nombre: "Jalpatagua", codigo_postal: "22012" },
            { nombre: "Conguaco", codigo_postal: "22013" },
            { nombre: "Moyuta", codigo_postal: "22014" },
            { nombre: "Pasaco", codigo_postal: "22015" },
            { nombre: "San José Acatempa", codigo_postal: "22016" },
            { nombre: "Quesada", codigo_postal: "22017" },
        ],
    },
];

export async function createDiviciones() {
    console.log("Iniciando seed de divisiones geográficas para Guatemala...");

    // 1. Obtener o crear el registro del país Guatemala
    const pais = await prisma.pais.findUnique({
        where: { codigo_iso: "GT" },
    });

    if (!pais) {
        throw new Error(
            "El país 'Guatemala' con código ISO 'GT' no existe en la base de datos. Por favor crea primero el país y su moneda."
        );
    }

    // 2. Iterar departamentos y municipios
    for (const depto of guatemalaData) {
        const divisionNivel1 = await prisma.divisionNivel1.upsert({
            where: {
                pais_id_nombre: {
                    pais_id: pais.id,
                    nombre: depto.nombre,
                },
            },
            update: {
                codigo_iso: depto.codigo_iso,
                activo: true,
            },
            create: {
                pais_id: pais.id,
                nombre: depto.nombre,
                codigo_iso: depto.codigo_iso,
                activo: true,
            },
        });

        for (const muni of depto.municipios) {
            await prisma.divisionNivel2.upsert({
                where: {
                    division_nivel1_id_nombre: {
                        division_nivel1_id: divisionNivel1.id,
                        nombre: muni.nombre,
                    },
                },
                update: {
                    codigo_postal: muni.codigo_postal,
                    activo: true,
                },
                create: {
                    division_nivel1_id: divisionNivel1.id,
                    nombre: muni.nombre,
                    codigo_postal: muni.codigo_postal,
                    activo: true,
                },
            });
        }
    }

    console.log("Seed de divisiones geográficas de Guatemala completado con éxito.");
}


createDiviciones()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Error durante la ejecución del seed:", e); // IMPRESCINDIBLE para ver qué falla
        await prisma.$disconnect();
        //process.exit(1);
    });