import { PrismaClient } from "@prisma/client";
import { Argon2HashProvider } from "../../src/shared/infrastructure/argon2-hash.provider.js";
import { modulosConPermisos, seedModulosYPermisos } from "./modulos-permisos.seed.js";

const hashProvider = new Argon2HashProvider();

export interface NegocioAdminSeedConfig {
  nombreNegocio?: string;
  nombreComercial?: string;
  slug?: string;
  nitRut?: string;
  waId?: string;
  slogan?: string;
  nombreUsuario?: string;
  apellidoUsuario?: string;
  emailAdmin?: string;
  passwordAdmin?: string;
  telefonoAdmin?: string;
}

export async function seedNegocioYAdmin(
  prisma: PrismaClient,
  config: NegocioAdminSeedConfig = {}
) {
  console.log("🏢 Iniciando seed de negocio y usuario administrador...");

  // 1. Asegurar módulos y permisos
  await seedModulosYPermisos(prisma);

  const todosLosPermisos = await prisma.permiso.findMany({
    select: { id: true, codigo: true },
  });

  // 2. Obtener país y moneda predeterminados (Guatemala y GTQ) si existen
  const paisGt = await prisma.pais.findUnique({ where: { codigo_iso: "GT" } });
  const monedaGtq = await prisma.moneda.findUnique({ where: { codigo: "GTQ" } });

  const nombreNegocio = config.nombreNegocio || "Motoservicio VM";
  const nombreComercial = config.nombreComercial || "MOTOSERVICIO VM";
  const slug = config.slug || "motoservicio-vm";
  const nitRut = config.nitRut || "50295769927";
  const waId = config.waId || "50230108703";
  const slogan = config.slogan || "Todos juntos podemos";

  // 3. Crear o actualizar Negocio con todos los módulos y permisos
  const negocio = await prisma.negocio.upsert({
    where: { wa_id: waId },
    update: {
      nombre: nombreNegocio,
      nombre_comercial: nombreComercial,
      nit_rut: nitRut,
      pais_id: paisGt?.id,
      moneda_id: monedaGtq?.id,
      permisos: {
        set: [],
        connect: todosLosPermisos.map((p) => ({ id: p.id })),
      },
      modulos: {
        connect: modulosConPermisos.map((m) => ({ nombre: m.nombre })),
      },
    },
    create: {
      nombre: nombreNegocio,
      nombre_comercial: nombreComercial,
      slug,
      wa_id: waId,
      nit_rut: nitRut,
      slogan,
      pais_id: paisGt?.id,
      moneda_id: monedaGtq?.id,
      permisos: {
        connect: todosLosPermisos.map((p) => ({ id: p.id })),
      },
      modulos: {
        connect: modulosConPermisos.map((m) => ({ nombre: m.nombre })),
      },
    },
  });

  console.log(`✅ Negocio "${negocio.nombre}" (ID: ${negocio.id}) vinculado a todos los módulos y permisos.`);

  // 4. Asegurar límites del negocio con los valores por defecto del modelo
  await prisma.negocioLimite.upsert({
    where: { negocio_id: negocio.id },
    update: {},
    create: {
      negocio_id: negocio.id,
    },
  });
  console.log(`✅ Límites del negocio asegurados con valores por defecto.`);

  // 5. Crear o actualizar el Rol ADMIN con todos los permisos
  const rolAdmin = await prisma.rol.upsert({
    where: {
      negocio_id_nombre: {
        negocio_id: negocio.id,
        nombre: "ADMIN",
      },
    },
    update: {
      descripcion: "Rol Administrador con acceso total",
      permisos: {
        set: [],
        connect: todosLosPermisos.map((p) => ({ id: p.id })),
      },
    },
    create: {
      nombre: "ADMIN",
      descripcion: "Rol Administrador con acceso total",
      negocio_id: negocio.id,
      permisos: {
        connect: todosLosPermisos.map((p) => ({ id: p.id })),
      },
    },
  });

  console.log(`✅ Rol "${rolAdmin.nombre}" configurado con ${todosLosPermisos.length} permisos.`);

  // 5. Crear o actualizar Usuario Admin
  const emailAdmin = config.emailAdmin || "admin@asyncronix.com";
  const passwordPlano = config.passwordAdmin || "Admin123*";
  const telefonoAdmin = config.telefonoAdmin || waId;
  const nombreAdmin = config.nombreUsuario || "Administrador";
  const apellidoAdmin = config.apellidoUsuario || "Principal";

  const passwordHash = await hashProvider.hash(passwordPlano);

  // Buscar usuario existente en este negocio por email
  const usuarioExistente = await prisma.usuario.findFirst({
    where: {
      negocio_id: negocio.id,
      email: emailAdmin,
    },
  });

  let usuarioAdmin;
  if (usuarioExistente) {
    usuarioAdmin = await prisma.usuario.update({
      where: { id: usuarioExistente.id },
      data: {
        nombre: nombreAdmin,
        apellido: apellidoAdmin,
        telefono: telefonoAdmin,
        password_hash: passwordHash,
        verificado: true,
        activo: true,
        roles: {
          connect: { id: rolAdmin.id },
        },
      },
    });
  } else {
    usuarioAdmin = await prisma.usuario.create({
      data: {
        negocio_id: negocio.id,
        email: emailAdmin,
        nombre: nombreAdmin,
        apellido: apellidoAdmin,
        telefono: telefonoAdmin,
        password_hash: passwordHash,
        verificado: true,
        activo: true,
        roles: {
          connect: { id: rolAdmin.id },
        },
      },
    });
  }

  console.log(`✅ Usuario Admin configurado exitosamente:`);
  console.log(`   - Email: ${usuarioAdmin.email}`);
  console.log(`   - Contraseña: ${passwordPlano}`);
  console.log(`   - Rol asignado: ${rolAdmin.nombre}`);

  return {
    negocio,
    rolAdmin,
    usuarioAdmin,
  };
}
