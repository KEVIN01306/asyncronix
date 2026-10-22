import test from "node:test";
import assert from "node:assert/strict";
import { RegistrarClienteUseCase } from "../application/registrar-cliente.usecase.js";
import { normalizarDpi, validarFormatoDpi } from "../domain/utils/normalizar-dpi.js";
import { generarPasswordSegura } from "../domain/utils/generar-password.js";

test("normalizarDpi y validarFormatoDpi - Limpieza y validación de 13 dígitos", () => {
    assert.strictEqual(normalizarDpi(null), null);
    assert.strictEqual(normalizarDpi(undefined), null);
    assert.strictEqual(normalizarDpi(""), null);
    assert.strictEqual(normalizarDpi("   "), null);

    // Con espacios o guiones
    assert.strictEqual(normalizarDpi("2450 12345 0101"), "2450123450101");
    assert.strictEqual(normalizarDpi("2450-12345-0101"), "2450123450101");

    // Validación de 13 dígitos
    assert.strictEqual(validarFormatoDpi("2450 12345 0101"), true);
    assert.strictEqual(validarFormatoDpi("12345"), false);
    assert.strictEqual(validarFormatoDpi("12345678901234"), false);
    assert.strictEqual(validarFormatoDpi(null), false);
});

test("generarPasswordSegura - Longitud y entropía suficiente", () => {
    const p1 = generarPasswordSegura();
    const p2 = generarPasswordSegura();
    assert.strictEqual(p1.length, 14);
    assert.strictEqual(p2.length, 14);
    assert.notStrictEqual(p1, p2);
});

test("RegistrarClienteUseCase - Caso A: Cliente nuevo global", async () => {
    let clienteGuardado: any = null;
    let asociacionCreada: any = null;
    let emailEnviado: any = null;

    const mockRepo: any = {
        buscarPorDpi: async () => null,
        registrar: async (data: any, passwordHash: string | null, negocioId: string) => {
            clienteGuardado = { id: "cliente-nuevo-1", ...data, password_hash: passwordHash };
            asociacionCreada = { clienteId: "cliente-nuevo-1", negocioId };
            return clienteGuardado;
        },
    };

    const mockHashProvider: any = {
        hash: async (plain: string) => `hashed_${plain}`,
    };

    const mockEmailProvider: any = {
        sendEmail: async (params: any) => {
            emailEnviado = params;
            return { id: "email-123" };
        },
    };

    const useCase = new RegistrarClienteUseCase(mockRepo, mockHashProvider, mockEmailProvider);

    const resultado = await useCase.execute(
        {
            nombre: "Carlos",
            apellido: "Mendoza",
            dpi: "2450 12345 0101",
            email: "carlos@example.com",
            telefono: "55551234",
        },
        "negocio-1"
    );

    assert.strictEqual(resultado.reutilizado, false);
    assert.strictEqual(resultado.id, "cliente-nuevo-1");
    assert.strictEqual(clienteGuardado.dpi, "2450123450101");
    assert.ok(clienteGuardado.password_hash.startsWith("hashed_"));
    assert.strictEqual(asociacionCreada.negocioId, "negocio-1");
    assert.ok(emailEnviado !== null);
    assert.strictEqual(emailEnviado.to, "carlos@example.com");
    assert.ok(emailEnviado.html.includes("2450123450101"));
});

test("RegistrarClienteUseCase - Caso B: Cliente ya existente en otro negocio (Reutilización)", async () => {
    const clienteExistente: any = {
        id: "cliente-global-existente",
        nombre: "Maria",
        apellido: "Lopez",
        dpi: "3000123450101",
        password_hash: "existing_hash",
        email: "maria@example.com",
    };

    let asociacionLlamada = false;
    let emailEnviado = false;

    const mockRepo: any = {
        buscarPorDpi: async (dpi: string) => (dpi === "3000123450101" ? clienteExistente : null),
        estaAsociadoANegocio: async () => false,
        asociarNegocio: async (clienteId: string, negocioId: string) => {
            asociacionLlamada = true;
            assert.strictEqual(clienteId, "cliente-global-existente");
            assert.strictEqual(negocioId, "negocio-2");
        },
        obtenerPorId: async (id: string) => (id === "cliente-global-existente" ? clienteExistente : null),
    };

    const mockHashProvider: any = {
        hash: async () => { throw new Error("No debe llamarse a hash si el cliente ya existe"); },
    };

    const mockEmailProvider: any = {
        sendEmail: async () => { emailEnviado = true; },
    };

    const useCase = new RegistrarClienteUseCase(mockRepo, mockHashProvider, mockEmailProvider);

    const resultado = await useCase.execute(
        {
            nombre: "Maria",
            dpi: "3000-12345-0101",
        },
        "negocio-2"
    );

    assert.strictEqual(resultado.reutilizado, true);
    assert.strictEqual(resultado.id, "cliente-global-existente");
    assert.strictEqual(asociacionLlamada, true);
    assert.strictEqual(emailEnviado, false, "No debe reenviar credenciales si el cliente ya existe");
});

test("RegistrarClienteUseCase - Caso C: Cliente ya asociado al mismo negocio (Idempotente)", async () => {
    const clienteExistente: any = {
        id: "cliente-ya-asociado",
        nombre: "Pedro",
        dpi: "4000123450101",
        password_hash: "existing_pwd_hash",
    };

    let asociarLlamado = false;

    const mockRepo: any = {
        buscarPorDpi: async () => clienteExistente,
        estaAsociadoANegocio: async () => true, // Ya asociado
        asociarNegocio: async () => { asociarLlamado = true; },
        obtenerPorId: async () => clienteExistente,
    };

    const useCase = new RegistrarClienteUseCase(mockRepo, {} as any, {} as any);

    const resultado = await useCase.execute(
        {
            nombre: "Pedro",
            dpi: "4000123450101",
        },
        "negocio-1"
    );

    assert.strictEqual(resultado.reutilizado, true);
    assert.strictEqual(resultado.id, "cliente-ya-asociado");
    assert.strictEqual(asociarLlamado, false, "No debe duplicar la asociación");
});

test("RegistrarClienteUseCase - Fallo en envío de correo no rompe la creación", async () => {
    const mockRepo: any = {
        buscarPorDpi: async () => null,
        buscarPorNit: async () => null,
        registrar: async (data: any) => ({ id: "cliente-sin-email-fallido", ...data }),
    };

    const mockHashProvider: any = {
        hash: async (p: string) => `hash_${p}`,
    };

    const mockEmailProvider: any = {
        sendEmail: async () => {
            throw new Error("Resend SMTP Timeout");
        },
    };

    const useCase = new RegistrarClienteUseCase(mockRepo, mockHashProvider, mockEmailProvider);

    // No debe lanzar excepción
    const resultado = await useCase.execute(
        {
            nombre: "Sofia",
            dpi: "5000123450101",
            email: "sofia@fail.com",
        },
        "negocio-1"
    );

    assert.strictEqual(resultado.id, "cliente-sin-email-fallido");
    assert.strictEqual(resultado.reutilizado, false);
});

test("RegistrarClienteUseCase - Cliente ya existente por NIT (ej. venta previa) se reutiliza y completa con DPI", async () => {
    const clienteExistentePorVenta: any = {
        id: "cliente-venta-previa",
        nombre: "Empresa o Persona",
        apellido: null,
        nit: "7894561-2",
        dpi: null,
        password_hash: null, // No tenía credenciales porque venía de venta en POS
        email: null,
    };

    let actualizacionData: any = null;
    let asociarNegocioLlamado = false;
    let emailEnviado: any = null;

    const mockRepo: any = {
        buscarPorDpi: async () => null, // No existía por DPI
        buscarPorNit: async (nit: string) => (nit === "7894561-2" ? clienteExistentePorVenta : null),
        actualizar: async (id: string, data: any) => {
            actualizacionData = data;
            return { ...clienteExistentePorVenta, ...data };
        },
        estaAsociadoANegocio: async () => false,
        asociarNegocio: async (id: string, negId: string) => {
            asociarNegocioLlamado = true;
            assert.strictEqual(id, "cliente-venta-previa");
            assert.strictEqual(negId, "negocio-taller-1");
        },
        obtenerPorId: async () => ({ ...clienteExistentePorVenta, ...actualizacionData }),
    };

    const mockHashProvider: any = {
        hash: async (p: string) => `hash_nuevo_${p}`,
    };

    const mockEmailProvider: any = {
        sendEmail: async (params: any) => {
            emailEnviado = params;
            return { id: "msg-welcome" };
        },
    };

    const useCase = new RegistrarClienteUseCase(mockRepo, mockHashProvider, mockEmailProvider);

    const resultado = await useCase.execute(
        {
            nombre: "Empresa o Persona",
            apellido: "García",
            nit: "7894561-2",
            dpi: "3333444450101",
            email: "contacto@empresa.com",
        },
        "negocio-taller-1"
    );

    assert.strictEqual(resultado.reutilizado, true);
    assert.strictEqual(resultado.id, "cliente-venta-previa");
    assert.strictEqual(asociarNegocioLlamado, true);

    // Debe haber actualizado el DPI y generado credenciales
    assert.strictEqual(actualizacionData.dpi, "3333444450101");
    assert.strictEqual(actualizacionData.apellido, "García");
    assert.strictEqual(actualizacionData.email, "contacto@empresa.com");
    assert.ok(actualizacionData.password_hash.startsWith("hash_nuevo_"));

    // Debe haber enviado el correo de bienvenida con el DPI
    assert.ok(emailEnviado !== null);
    assert.strictEqual(emailEnviado.to, "contacto@empresa.com");
    assert.ok(emailEnviado.html.includes("3333444450101"));
});

test("Plantillas de correo - Estilo OTP consistente y separación de código", async () => {
    const { ClienteBienvenidaTemplate } = await import("../../../shared/infrastructure/email/templates/cliente-bienvenida.template.js");
    const { ClienteUnificacionTemplate } = await import("../../../shared/infrastructure/email/templates/cliente-unificacion.template.js");

    const htmlBienvenida = ClienteBienvenidaTemplate({
        nombre: "Test User",
        dpi: "1234567890101",
        password: "SecretPassword!1",
    });

    assert.ok(htmlBienvenida.includes("Asyncronix"));
    assert.ok(htmlBienvenida.includes("1234567890101"));
    assert.ok(htmlBienvenida.includes("SecretPassword!1"));
    assert.ok(htmlBienvenida.includes("code-box"));
    assert.ok(htmlBienvenida.includes("btn-action"));

    const htmlUnificacion = ClienteUnificacionTemplate({
        nombre: "Test User Unificado",
        dpi: "9876543210101",
        password: "NewPassword!2",
    });

    assert.ok(htmlUnificacion.includes("Consolidación de tu Cuenta"));
    assert.ok(htmlUnificacion.includes("9876543210101"));
    assert.ok(htmlUnificacion.includes("NewPassword!2"));
    assert.ok(htmlUnificacion.includes("code-box"));
});

test("RegistrarClienteUseCase - Cliente existente por DPI adopta campos faltantes ingresados (telefono, email, apellido, NIT)", async () => {
    const clienteExistente: any = {
        id: "c-existente-sin-datos",
        nombre: "CONSUMIDOR FINAL",
        apellido: null,
        dpi: "9999000010101",
        nit: null,
        telefono: null,
        email: null,
        password_hash: "hash_existente",
    };

    let actualizacionEnviada: any = null;
    let negocioAsociado = false;

    const mockRepo: any = {
        buscarPorDpi: async (dpi: string) => (dpi === "9999000010101" ? clienteExistente : null),
        buscarPorNit: async () => null,
        actualizar: async (id: string, data: any) => {
            actualizacionEnviada = data;
            return { ...clienteExistente, ...data };
        },
        estaAsociadoANegocio: async () => false,
        asociarNegocio: async () => { negocioAsociado = true; },
        obtenerPorId: async () => ({ ...clienteExistente, ...actualizacionEnviada }),
    };

    const useCase = new RegistrarClienteUseCase(mockRepo, {} as any);

    const resultado = await useCase.execute(
        {
            nombre: "Julio Roberto",
            apellido: "Soto",
            dpi: "9999000010101",
            nit: "554433-2",
            telefono: "55559999",
            email: "julio.soto@example.com",
        },
        "negocio-1"
    );

    assert.strictEqual(resultado.reutilizado, true);
    assert.strictEqual(negocioAsociado, true);

    // Debe haber adoptado todos los campos que no tenía
    assert.strictEqual(actualizacionEnviada.nombre, "Julio Roberto", "Debe reemplazar nombre genérico por el ingresado");
    assert.strictEqual(actualizacionEnviada.apellido, "Soto", "Debe adoptar apellido");
    assert.strictEqual(actualizacionEnviada.nit, "554433-2", "Debe adoptar NIT");
    assert.strictEqual(actualizacionEnviada.telefono, "55559999", "Debe adoptar teléfono");
    assert.strictEqual(actualizacionEnviada.email, "julio.soto@example.com", "Debe adoptar email");
});
