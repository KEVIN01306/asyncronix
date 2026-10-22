import test from "node:test";
import assert from "node:assert/strict";
import { ObtenerResumenUnificacionUseCase } from "../application/obtener-resumen-unificacion.usecase.js";
import { UnificarClientesUseCase } from "../application/unificar-clientes.usecase.js";
import AppError from "../../../shared/errors/AppError.js";

test("ObtenerResumenUnificacionUseCase - Validación de identificadores diferentes", async () => {
    const useCase = new ObtenerResumenUnificacionUseCase({} as any);
    await assert.rejects(
        async () => useCase.execute("cliente-1", "cliente-1", "negocio-1"),
        (err: any) => err instanceof AppError && err.statusCode === 400
    );
});

test("ObtenerResumenUnificacionUseCase - Error si cliente no existe", async () => {
    const mockRepo: any = {
        obtenerPorId: async (id: string) => (id === "cliente-1" ? { id: "cliente-1", nombre: "A" } : null),
    };
    const useCase = new ObtenerResumenUnificacionUseCase(mockRepo);
    await assert.rejects(
        async () => useCase.execute("cliente-1", "cliente-inexistente", "negocio-1"),
        (err: any) => err instanceof AppError && err.statusCode === 404
    );
});

test("ObtenerResumenUnificacionUseCase - Retorno correcto de resumen y conteo", async () => {
    const mockRepo: any = {
        obtenerPorId: async (id: string) => ({ id, nombre: `Cliente ${id}` }),
        obtenerConteoRelaciones: async (id: string) => ({
            vehiculos: 2,
            citas: 1,
            servicios: 3,
            ventas: 5,
            pre_ventas: 0,
            cotizaciones: 1,
            facturas: 4,
            sessions: 1,
        }),
    };
    const useCase = new ObtenerResumenUnificacionUseCase(mockRepo);
    const resumen = await useCase.execute("cliente-origen", "cliente-destino", "negocio-1");

    assert.strictEqual(resumen.origen.id, "cliente-origen");
    assert.strictEqual(resumen.destino.id, "cliente-destino");
    assert.strictEqual(resumen.relaciones_a_migrar.vehiculos, 2);
    assert.strictEqual(resumen.relaciones_a_migrar.ventas, 5);
    assert.strictEqual(resumen.relaciones_a_migrar.servicios, 3);
});

test("UnificarClientesUseCase - Rechazo si clienteConservar === clienteEliminar", async () => {
    const useCase = new UnificarClientesUseCase({} as any, {} as any);
    await assert.rejects(
        async () => useCase.execute({
            clienteConservarId: "mismo-id",
            clienteEliminarId: "mismo-id",
            negocioId: "negocio-1",
            usuarioId: "user-1",
        }),
        (err: any) => err instanceof AppError && err.statusCode === 400
    );
});

test("UnificarClientesUseCase - Rechazo 403 si ninguno de los clientes está en el negocio actual", async () => {
    const mockRepo: any = {
        obtenerPorId: async (id: string) => ({ id, nombre: "Persona" }),
        estaAsociadoANegocio: async () => false, // Ninguno está asociado a negocio-1
    };
    const useCase = new UnificarClientesUseCase(mockRepo, {} as any);
    await assert.rejects(
        async () => useCase.execute({
            clienteConservarId: "c-1",
            clienteEliminarId: "c-2",
            negocioId: "negocio-1",
            usuarioId: "user-1",
        }),
        (err: any) => err instanceof AppError && err.statusCode === 403
    );
});

test("UnificarClientesUseCase - Unificación exitosa con migración y notificación", async () => {
    const clienteConservar: any = {
        id: "cliente-conservar",
        nombre: "Juan",
        apellido: null,
        dpi: "1111222230101",
        nit: null,
        email: "juan@example.com",
    };

    const clienteEliminar: any = {
        id: "cliente-eliminar",
        nombre: "Juan Carlos",
        apellido: "Perez",
        dpi: "9999888870101",
        nit: "1234567-8",
        email: null,
    };

    let paramsUnificar: any = null;
    let emailEnviado: any = null;

    const mockRepo: any = {
        obtenerPorId: async (id: string) => {
            if (id === "cliente-conservar") return clienteConservar;
            if (id === "cliente-eliminar") return clienteEliminar;
            return null;
        },
        estaAsociadoANegocio: async (id: string, negId: string) => {
            // El cliente a conservar pertenece al negocio actual
            return id === "cliente-conservar" && negId === "negocio-1";
        },
        unificar: async (params: any) => {
            paramsUnificar = params;
            return {
                relacionesMigradas: {
                    vehiculos: 2,
                    citas: 1,
                    servicios: 3,
                    ventas: 4,
                    pre_ventas: 0,
                    cotizaciones: 1,
                    facturas: 2,
                    sessions: 1,
                },
                clienteDefinitivo: {
                    ...clienteConservar,
                    apellido: params.datosFusionados.apellido,
                    nit: params.datosFusionados.nit,
                },
            };
        },
    };

    const mockHashProvider: any = {
        hash: async (plain: string) => `hashed_pwd_${plain}`,
    };

    const mockEmailProvider: any = {
        sendEmail: async (params: any) => {
            emailEnviado = params;
            return { id: "msg-777" };
        },
    };

    const useCase = new UnificarClientesUseCase(mockRepo, mockHashProvider, mockEmailProvider);

    const resultado = await useCase.execute({
        clienteConservarId: "cliente-conservar",
        clienteEliminarId: "cliente-eliminar",
        negocioId: "negocio-1",
        usuarioId: "admin-user",
    });

    // Validar llamadas y resultado
    assert.strictEqual(resultado.clienteDefinitivo.id, "cliente-conservar");
    assert.strictEqual(resultado.relacionesMigradas.ventas, 4);
    assert.strictEqual(resultado.relacionesMigradas.vehiculos, 2);
    assert.strictEqual(resultado.notificacionEnviada, true);

    // Validar parámetros pasados a la transacción de persistencia
    assert.strictEqual(paramsUnificar.clienteConservarId, "cliente-conservar");
    assert.strictEqual(paramsUnificar.clienteEliminarId, "cliente-eliminar");
    assert.strictEqual(paramsUnificar.datosFusionados.apellido, "Perez", "Debe heredar apellido faltante");
    assert.strictEqual(paramsUnificar.datosFusionados.nit, "1234567-8", "Debe heredar NIT faltante");
    assert.ok(paramsUnificar.datosFusionados.password_hash.startsWith("hashed_pwd_"));

    // Validar notificación de correo
    assert.ok(emailEnviado !== null);
    assert.strictEqual(emailEnviado.to, "juan@example.com");
    assert.ok(emailEnviado.html.includes("1111222230101"), "El correo debe notificar el DPI definitivo");
});

test("UnificarClientesUseCase - Fallo en correo de notificación no rompe la unificación", async () => {
    const mockRepo: any = {
        obtenerPorId: async (id: string) => ({ id, nombre: "Persona", email: "p@example.com", dpi: "123" }),
        estaAsociadoANegocio: async () => true,
        unificar: async () => ({
            relacionesMigradas: { vehiculos: 0, citas: 0, servicios: 0, ventas: 1, pre_ventas: 0, cotizaciones: 0, facturas: 0, sessions: 0 },
            clienteDefinitivo: { id: "c-1", nombre: "Persona" },
        }),
    };

    const mockHashProvider: any = { hash: async () => "hash" };
    const mockEmailProvider: any = {
        sendEmail: async () => { throw new Error("Email service 503"); },
    };

    const useCase = new UnificarClientesUseCase(mockRepo, mockHashProvider, mockEmailProvider);

    const res = await useCase.execute({
        clienteConservarId: "c-1",
        clienteEliminarId: "c-2",
        negocioId: "negocio-1",
        usuarioId: "admin-1",
    });

    assert.strictEqual(res.clienteDefinitivo.id, "c-1");
    assert.strictEqual(res.notificacionEnviada, false);
});

test("UnificarClientesUseCase - Con adoptarDatosFaltantes: true hereda campos faltantes y nombre real si el conservado era genérico", async () => {
    const clienteConservar: any = {
        id: "c-cons",
        nombre: "CONSUMIDOR FINAL",
        apellido: null,
        telefono: "",
        email: null,
        nit: null,
        dpi: "1234567890101",
    };

    const clienteEliminar: any = {
        id: "c-elim",
        nombre: "Fernando José",
        apellido: "Alvarado",
        telefono: "55554321",
        email: "fernando@example.com",
        nit: "9876543-2",
        dpi: null,
    };

    let paramsUnificar: any = null;
    const mockRepo: any = {
        obtenerPorId: async (id: string) => (id === "c-cons" ? clienteConservar : id === "c-elim" ? clienteEliminar : null),
        estaAsociadoANegocio: async () => true,
        unificar: async (params: any) => {
            paramsUnificar = params;
            return {
                relacionesMigradas: { vehiculos: 1, citas: 0, servicios: 0, ventas: 1, pre_ventas: 0, cotizaciones: 0, facturas: 0, sessions: 0 },
                clienteDefinitivo: { id: "c-cons", ...params.datosFusionados },
            };
        },
    };

    const mockHashProvider: any = { hash: async () => "hash_pwd" };
    const useCase = new UnificarClientesUseCase(mockRepo, mockHashProvider);

    await useCase.execute({
        clienteConservarId: "c-cons",
        clienteEliminarId: "c-elim",
        negocioId: "negocio-1",
        usuarioId: "admin-1",
        adoptarDatosFaltantes: true,
    });

    assert.strictEqual(paramsUnificar.datosFusionados.nombre, "Fernando José", "Debe adoptar nombre real sobre nombre genérico");
    assert.strictEqual(paramsUnificar.datosFusionados.apellido, "Alvarado", "Debe adoptar apellido faltante");
    assert.strictEqual(paramsUnificar.datosFusionados.telefono, "55554321", "Debe adoptar teléfono faltante");
    assert.strictEqual(paramsUnificar.datosFusionados.email, "fernando@example.com", "Debe adoptar email faltante");
    assert.strictEqual(paramsUnificar.datosFusionados.nit, "9876543-2", "Debe adoptar NIT faltante");
    assert.strictEqual(paramsUnificar.datosFusionados.dpi, "1234567890101", "Debe mantener DPI del cliente conservado");
});

test("UnificarClientesUseCase - Con adoptarDatosFaltantes: false NO hereda datos del registro a eliminar", async () => {
    const clienteConservar: any = {
        id: "c-cons",
        nombre: "Roberto",
        apellido: null,
        telefono: null,
        email: null,
        nit: null,
        dpi: "5555666670101",
    };

    const clienteEliminar: any = {
        id: "c-elim",
        nombre: "Roberto Carlos",
        apellido: "Mendez",
        telefono: "77778888",
        email: "roberto@otro.com",
        nit: "112233-4",
        dpi: null,
    };

    let paramsUnificar: any = null;
    const mockRepo: any = {
        obtenerPorId: async (id: string) => (id === "c-cons" ? clienteConservar : id === "c-elim" ? clienteEliminar : null),
        estaAsociadoANegocio: async () => true,
        unificar: async (params: any) => {
            paramsUnificar = params;
            return {
                relacionesMigradas: { vehiculos: 0, citas: 0, servicios: 0, ventas: 0, pre_ventas: 0, cotizaciones: 0, facturas: 0, sessions: 0 },
                clienteDefinitivo: { id: "c-cons", ...params.datosFusionados },
            };
        },
    };

    const mockHashProvider: any = { hash: async () => "hash_pwd" };
    const useCase = new UnificarClientesUseCase(mockRepo, mockHashProvider);

    await useCase.execute({
        clienteConservarId: "c-cons",
        clienteEliminarId: "c-elim",
        negocioId: "negocio-1",
        usuarioId: "admin-1",
        adoptarDatosFaltantes: false,
    });

    assert.strictEqual(paramsUnificar.datosFusionados.nombre, "Roberto", "Debe mantener nombre del conservado");
    assert.strictEqual(paramsUnificar.datosFusionados.apellido, null, "NO debe adoptar apellido");
    assert.strictEqual(paramsUnificar.datosFusionados.telefono, null, "NO debe adoptar teléfono");
    assert.strictEqual(paramsUnificar.datosFusionados.email, null, "NO debe adoptar email");
    assert.strictEqual(paramsUnificar.datosFusionados.nit, null, "NO debe adoptar NIT");
    assert.strictEqual(paramsUnificar.datosFusionados.dpi, "5555666670101", "Debe mantener su propio DPI");
});

test("UnificarClientesUseCase - Adopta DPI del cliente a eliminar cuando el conservado no tenía DPI", async () => {
    const clienteConservar: any = {
        id: "c-local",
        nombre: "Local Sin DPI",
        dpi: null,
        nit: "12345",
    };

    const clienteEliminar: any = {
        id: "c-global",
        nombre: "Global Con DPI",
        dpi: "7777888890101",
        nit: "12345",
    };

    let paramsUnificar: any = null;
    const mockRepo: any = {
        obtenerPorId: async (id: string) => (id === "c-local" ? clienteConservar : id === "c-global" ? clienteEliminar : null),
        estaAsociadoANegocio: async () => true,
        buscarPorDpi: async () => null,
        unificar: async (params: any) => {
            paramsUnificar = params;
            return {
                relacionesMigradas: { vehiculos: 0, citas: 0, servicios: 0, ventas: 1, pre_ventas: 0, cotizaciones: 0, facturas: 0, sessions: 0 },
                clienteDefinitivo: { id: "c-local", ...params.datosFusionados },
            };
        },
    };

    const mockHashProvider: any = { hash: async () => "hash_pwd" };
    const useCase = new UnificarClientesUseCase(mockRepo, mockHashProvider);

    await useCase.execute({
        clienteConservarId: "c-local",
        clienteEliminarId: "c-global",
        negocioId: "negocio-1",
        usuarioId: "admin-1",
        adoptarDatosFaltantes: true,
    });

    assert.strictEqual(paramsUnificar.datosFusionados.dpi, "7777888890101", "Debe adoptar el DPI del registro a eliminar");
});

test("UnificarClientesUseCase - Rechaza con 409 si el DPI sobrescrito pertenece a un tercer cliente", async () => {
    const clienteConservar: any = { id: "c-1", nombre: "C1", dpi: null };
    const clienteEliminar: any = { id: "c-2", nombre: "C2", dpi: null };
    const clienteTercero: any = { id: "c-tercero", nombre: "Tercero", dpi: "9999999990101" };

    const mockRepo: any = {
        obtenerPorId: async (id: string) => (id === "c-1" ? clienteConservar : id === "c-2" ? clienteEliminar : null),
        estaAsociadoANegocio: async () => true,
        buscarPorDpi: async (dpi: string) => (dpi === "9999999990101" ? clienteTercero : null),
    };

    const useCase = new UnificarClientesUseCase(mockRepo, {} as any);

    await assert.rejects(
        async () => useCase.execute({
            clienteConservarId: "c-1",
            clienteEliminarId: "c-2",
            negocioId: "negocio-1",
            usuarioId: "admin-1",
            datosFusionadosSobrescritos: { dpi: "9999999990101" },
        }),
        (err: any) => err instanceof AppError && err.statusCode === 409 && err.code === "DPI_ALREADY_EXISTS"
    );
});
