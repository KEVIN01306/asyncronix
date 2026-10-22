import { PrismaClient } from "@prisma/client";

export const permisosData = [
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
  { codigo: "UNIFICAR_CLIENTES" },

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
  { codigo: "ADMIN_REPORTES" },

  { codigo: "VER_FACTURAS" },
  { codigo: "DESCARGAR_FACTURAS" },
  { codigo: "VER_RESUMEN_FISCAL" },
  { codigo: "VER_CONFIGURACION_FISCAL" },
  { codigo: "EDITAR_CONFIGURACION_FISCAL" },
];

export const modulosConPermisos = [
  {
    nombre: "USUARIOS",
    permisos: [
      "VER_USUARIOS",
      "VER_USUARIOS_DETALLE",
      "CREAR_USUARIOS",
      "EDITAR_USUARIOS",
      "ELIMINAR_USUARIOS",
      "ADMIN_USUARIOS",
    ],
  },
  {
    nombre: "ROLES",
    permisos: [
      "VER_ROLES",
      "VER_ROLES_DETALLE",
      "CREAR_ROLES",
      "EDITAR_ROLES",
      "ELIMINAR_ROLES",
    ],
  },
  {
    nombre: "SUCURSALES",
    permisos: [
      "VER_SUCURSALES",
      "VER_SUCURSALES_DETALLE",
      "CREAR_SUCURSALES",
      "EDITAR_SUCURSALES",
      "ELIMINAR_SUCURSALES",
      "ADMIN_SUCURSAL",
    ],
  },
  {
    nombre: "NEGOCIOS",
    permisos: [
      "VER_NEGOCIOS_DETALLE_ME",
      "EDITAR_NEGOCIOS",
      "NEGOCIOS_CAMBIAR_MONEDA",
    ],
  },
  {
    nombre: "PAISES",
    permisos: ["VER_PAISES", "VER_DETALLE_PAIS"],
  },
  {
    nombre: "MONEDAS",
    permisos: ["VER_MONEDAS", "VER_DETALLE_MONEDA"],
  },
  {
    nombre: "PERMISOS",
    permisos: ["VER_PERMISOS", "EDITAR_PERMISOS", "ASIGNAR_PERMISOS_ROL"],
  },
  {
    nombre: "CATEGORIAS PRODUCTOS",
    permisos: [
      "VER_CATEGORIAS_PRODUCTOS",
      "VER_CATEGORIAS_PRODUCTOS_DETALLE",
      "CREAR_CATEGORIAS_PRODUCTOS",
      "EDITAR_CATEGORIAS_PRODUCTOS",
      "ELIMINAR_CATEGORIAS_PRODUCTOS",
    ],
  },
  {
    nombre: "PRODUCTOS",
    permisos: [
      "VER_PRODUCTOS",
      "VER_PRODUCTOS_DETALLE",
      "CREAR_PRODUCTOS",
      "EDITAR_PRODUCTOS",
      "ELIMINAR_PRODUCTOS",
      "BUSCAR_PRODUCTOS",
    ],
  },
  {
    nombre: "LOTES",
    permisos: ["VER_LOTES", "VER_LOTES_DETALLE", "CREAR_LOTES"],
  },
  {
    nombre: "VENTAS",
    permisos: [
      "VER_VENTAS",
      "VER_VENTAS_DETALLE",
      "CREAR_VENTAS",
      "EDITAR_VENTAS",
      "ANULAR_VENTAS",
      "VENTAS_FORZAR_STOCK",
    ],
  },
  {
    nombre: "COTIZACIONES",
    permisos: [
      "VER_COTIZACIONES",
      "VER_COTIZACIONES_DETALLE",
      "CREAR_COTIZACIONES",
      "EDITAR_COTIZACIONES",
      "ELIMINAR_COTIZACIONES",
      "CONVERTIR_COTIZACIONES",
    ],
  },
  {
    nombre: "CLIENTES",
    permisos: [
      "VER_CLIENTES",
      "VER_CLIENTES_DETALLE",
      "CREAR_CLIENTES",
      "EDITAR_CLIENTES",
      "ELIMINAR_CLIENTES",
      "UNIFICAR_CLIENTES",
    ],
  },
  {
    nombre: "CILINDRADAS",
    permisos: ["VER_CILINDRADAS", "VER_CILINDRADAS_DETALLE"],
  },
  {
    nombre: "MARCAS",
    permisos: ["VER_MARCAS", "VER_MARCAS_DETALLE"],
  },
  {
    nombre: "LINEAS",
    permisos: ["VER_LINEAS", "VER_LINEAS_DETALLE"],
  },
  {
    nombre: "MODELOS",
    permisos: ["VER_MODELOS", "VER_MODELOS_DETALLE", "CREAR_MODELO", "ADMIN_MODELO"],
  },
  {
    nombre: "VEHICULOS",
    permisos: [
      "VER_VEHICULOS",
      "VER_VEHICULOS_DETALLE",
      "CREAR_VEHICULOS",
      "EDITAR_VEHICULOS",
    ],
  },
  {
    nombre: "TIPOS DE VEHICULOS",
    permisos: ["VER_VEHICULOS_TIPOS"],
  },
  {
    nombre: "OPCIONES SERVICIO",
    permisos: [
      "VER_OPCION_SERVICIO",
      "VER_OPCION_SERVICIO_DETALLE",
      "CREAR_OPCION_SERVICIO",
      "EDITAR_OPCION_SERVICIO",
      "ELIMINAR_OPCION_SERVICIO",
    ],
  },
  {
    nombre: "TIPOS SERVICIO",
    permisos: [
      "VER_TIPO_SERVICIO",
      "VER_TIPO_SERVICIO_DETALLE",
      "CREAR_TIPO_SERVICIO",
      "EDITAR_TIPO_SERVICIO",
      "ELIMINAR_TIPO_SERVICIO",
    ],
  },
  {
    nombre: "CHECKLIST ITEMS",
    permisos: [
      "VER_CHECKLIST",
      "VER_CHECKLIST_DETALLE",
      "CREAR_CHECKLIST",
      "EDITAR_CHECKLIST",
      "ELIMINAR_CHECKLIST",
    ],
  },
  {
    nombre: "SERVICIOS",
    permisos: [
      "VER_SERVICIOS",
      "VER_SERVICIOS_DETALLE",
      "CREAR_SERVICIOS",
      "EDITAR_SERVICIOS",
      "ELIMINAR_SERVICIOS",
      "ADMIN_SERVICIOS",
      "EDITAR_SERVICIOS_REPUESTOS",
      "SALIDA_SERVICIOS",
      "PROGRESO_SERVICIOS",
      "CONFIGURACION_SERVICIOS",
    ],
  },
  {
    nombre: "PROVEEDORES",
    permisos: [
      "VER_PROVEEDORES",
      "VER_PROVEEDORES_DETALLE",
      "CREAR_PROVEEDORES",
      "EDITAR_PROVEEDORES",
      "ELIMINAR_PROVEEDORES",
    ],
  },
  {
    nombre: "ATRIBUTOS",
    permisos: [
      "VER_ATRIBUTOS",
      "VER_ATRIBUTOS_DETALLE",
      "CREAR_ATRIBUTOS",
      "EDITAR_ATRIBUTOS",
      "ELIMINAR_ATRIBUTOS",
    ],
  },
  {
    nombre: "TRASLADOS",
    permisos: [
      "VER_TRASLADO",
      "VER_TRASLADO_DETALLE",
      "CREAR_TRASLADO",
      "CANCELAR_TRASLADO",
      "RECIBIR_TRASLADO",
    ],
  },
  {
    nombre: "CUENTAS BANCARIAS",
    permisos: [
      "VER_CUENTA_BANCARIA",
      "VER_CUENTA_BANCARIA_DETALLE",
      "CREAR_CUENTA_BANCARIA",
      "EDITAR_CUENTA_BANCARIA",
      "ELIMINAR_CUENTA_BANCARIA",
    ],
  },
  {
    nombre: "CAJAS",
    permisos: ["VER_CAJAS", "VER_CAJAS_DETALLE", "CREAR_CAJAS", "EDITAR_CAJAS", "ELIMINAR_CAJAS"],
  },
  {
    nombre: "BANCOS",
    permisos: ["VER_BANCOS", "VER_BANCOS_DETALLE"],
  },
  {
    nombre: "CATEGORIAS TRANSACCION",
    permisos: [
      "VER_CATEGORIAS_TRANSACCION",
      "VER_CATEGORIAS_TRANSACCION_DETALLE",
      "CREAR_CATEGORIAS_TRANSACCION",
      "EDITAR_CATEGORIAS_TRANSACCION",
      "ELIMINAR_CATEGORIAS_TRANSACCION",
    ],
  },
  {
    nombre: "INGRESOS_EGRESOS",
    permisos: ["VER_INGRESOS_EGRESOS", "VER_INGRESOS_EGRESOS_DETALLE", "CREAR_INGRESOS_EGRESOS"],
  },
  {
    nombre: "MOVIMIENTOS",
    permisos: ["VER_MOVIMIENTOS", "VER_MOVIMIENTOS_DETALLE", "CREAR_MOVIMIENTOS"],
  },
  {
    nombre: "REPORTES",
    permisos: ["REPORTES_FINANCIERO", "ADMIN_REPORTES"],
  },
  {
    nombre: "FACTURACION",
    permisos: [
      "VER_FACTURAS",
      "DESCARGAR_FACTURAS",
      "VER_RESUMEN_FISCAL",
      "VER_CONFIGURACION_FISCAL",
      "EDITAR_CONFIGURACION_FISCAL",
    ],
  },
];

export async function seedModulosYPermisos(prisma: PrismaClient) {
  console.log("📦 Asegurando módulos y permisos en la base de datos...");

  for (const m of modulosConPermisos) {
    await prisma.modulo.upsert({
      where: { nombre: m.nombre },
      update: {
        permisos: {
          connectOrCreate: m.permisos.map((codigo) => ({
            where: { codigo },
            create: { codigo },
          })),
        },
      },
      create: {
        nombre: m.nombre,
        permisos: {
          create: m.permisos.map((codigo) => ({ codigo })),
        },
      },
    });
  }

  console.log("✅ Módulos y permisos sincronizados correctamente.");
}
