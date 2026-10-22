import test from "node:test";
import assert from "node:assert/strict";
import { ReenviarCredencialesClienteUseCase } from "../application/reenviar-credenciales-cliente.usecase.js";
import AppError from "../../../shared/errors/AppError.js";

test("ReenviarCredencialesClienteUseCase - Error 404 si el cliente no existe", async () => {
    const mockRepo: any = {
        obtenerPorId: async () => null,
    };
    const useCase = new ReenviarCredencialesClienteUseCase(mockRepo, {} as any);

    await assert.rejects(
        async () => useCase.execute("cliente-inexistente", "negocio-1"),
        (err: any) => err instanceof AppError && err.statusCode === 404 && err.code === "CLIENT_NOT_FOUND"
    );
});

test("ReenviarCredencialesClienteUseCase - Error 403 si el cliente no está asociado al negocio actual", async () => {
    const mockRepo: any = {
        obtenerPorId: async () => ({ id: "c-1", nombre: "Juan" }),
        estaAsociadoANegocio: async () => false,
    };
    const useCase = new ReenviarCredencialesClienteUseCase(mockRepo, {} as any);

    await assert.rejects(
        async () => useCase.execute("c-1", "negocio-ajeno"),
        (err: any) => err instanceof AppError && err.statusCode === 403 && err.code === "CLIENT_NOT_IN_BUSINESS"
    );
});

test("ReenviarCredencialesClienteUseCase - Error 400 si el cliente no tiene email registrado", async () => {
    const mockRepo: any = {
        obtenerPorId: async () => ({ id: "c-1", nombre: "Juan", email: null, dpi: "1234567890101" }),
        estaAsociadoANegocio: async () => true,
    };
    const useCase = new ReenviarCredencialesClienteUseCase(mockRepo, {} as any);

    await assert.rejects(
        async () => useCase.execute("c-1", "negocio-1"),
        (err: any) => err instanceof AppError && err.statusCode === 400 && err.code === "CLIENT_NO_EMAIL"
    );
});

test("ReenviarCredencialesClienteUseCase - Éxito: regenera contraseña, actualiza hash, revoca sesiones y envía correo", async () => {
    const clienteExistente: any = {
        id: "c-100",
        nombre: "Valeria",
        apellido: "Mazariegos",
        dpi: "2222333340101",
        email: "valeria@example.com",
        password_hash: "old_hash",
    };

    let actualizacionData: any = null;
    let sesionesEliminadasPara: string | null = null;
    let emailEnviado: any = null;

    const mockRepo: any = {
        obtenerPorId: async () => clienteExistente,
        estaAsociadoANegocio: async () => true,
        actualizar: async (id: string, data: any) => {
            actualizacionData = data;
            return { ...clienteExistente, ...data };
        },
        eliminarSesiones: async (id: string) => {
            sesionesEliminadasPara = id;
        },
    };

    const mockHashProvider: any = {
        hash: async (pwd: string) => `argon2_new_${pwd}`,
    };

    const mockEmailProvider: any = {
        sendEmail: async (params: any) => {
            emailEnviado = params;
            return { id: "msg-resend-1" };
        },
    };

    const useCase = new ReenviarCredencialesClienteUseCase(mockRepo, mockHashProvider, mockEmailProvider);

    const resultado = await useCase.execute("c-100", "negocio-1");

    assert.strictEqual(resultado.clienteId, "c-100");
    assert.strictEqual(resultado.email, "valeria@example.com");
    assert.strictEqual(resultado.dpi, "2222333340101");
    assert.strictEqual(resultado.notificacionEnviada, true);

    // Validar hash actualizado
    assert.ok(actualizacionData.password_hash.startsWith("argon2_new_"));
    assert.notStrictEqual(actualizacionData.password_hash, "old_hash");

    // Validar revocación de sesiones previas
    assert.strictEqual(sesionesEliminadasPara, "c-100");

    // Validar correo enviado con DPI y estilo OTP
    assert.ok(emailEnviado !== null);
    assert.strictEqual(emailEnviado.to, "valeria@example.com");
    assert.ok(emailEnviado.subject.includes("Nuevas credenciales"));
    assert.ok(emailEnviado.html.includes("2222333340101"));
    assert.ok(emailEnviado.html.includes("code-box"));
});
