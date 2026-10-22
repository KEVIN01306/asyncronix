import test from "node:test";
import assert from "node:assert/strict";
import { RegistrarClienteParaVentaUseCase } from "../../ventas/application/registrar-cliente-para-venta.usecase.js";
import { AsociarClienteVehiculoUseCase } from "../../vehiculo/application/asociar-cliente.usecase.js";
import AppError from "../../../shared/errors/AppError.js";

test("RegistrarClienteParaVentaUseCase - Cliente nuevo con DPI delega a RegistrarClienteUseCase", async () => {
    let registrarClienteEjecutado = false;

    const mockRegistrarUseCase: any = {
        execute: async (data: any, negocioId: string) => {
            registrarClienteEjecutado = true;
            assert.strictEqual(data.dpi, "1234567890101");
            assert.strictEqual(negocioId, "negocio-pos-1");
            return {
                id: "cliente-nuevo-pos",
                nombre: data.nombre,
                dpi: data.dpi,
                reutilizado: false,
            };
        },
    };

    const useCase = new RegistrarClienteParaVentaUseCase({} as any, mockRegistrarUseCase);

    const res = await useCase.execute({
        nombre: "Ana Gómez",
        dpi: "1234 56789 0101",
        nit: "CF",
    }, "negocio-pos-1");

    assert.strictEqual(registrarClienteEjecutado, true);
    assert.strictEqual(res.id, "cliente-nuevo-pos");
});

test("RegistrarClienteParaVentaUseCase - Cliente existente por NIT se delega y reutiliza", async () => {
    let registrarEjecutado = false;

    const mockRegistrarUseCase: any = {
        execute: async (data: any, negocioId: string) => {
            registrarEjecutado = true;
            assert.strictEqual(data.nit, "77788899");
            assert.strictEqual(negocioId, "negocio-sucursal-2");
            return {
                id: "cliente-por-nit",
                nombre: data.nombre,
                nit: data.nit,
                reutilizado: true,
            };
        },
    };

    const useCase = new RegistrarClienteParaVentaUseCase({} as any, mockRegistrarUseCase);

    const res = await useCase.execute({
        nombre: "Distribuidora El Sol",
        nit: "77788899",
    }, "negocio-sucursal-2");

    assert.strictEqual(registrarEjecutado, true);
    assert.strictEqual(res.id, "cliente-por-nit");
    assert.strictEqual(res.reutilizado, true);
});

test("AsociarClienteVehiculoUseCase - Búsqueda por DPI auto-asocia al negocio y vincula vehículo", async () => {
    const clienteGlobal: any = {
        id: "cliente-moto-1",
        nombre: "Roberto",
        dpi: "2222333340101",
    };

    let asociacionNegocio = false;
    let vehiculoActualizado = false;

    const mockClienteRepo: any = {
        buscarPorDpi: async (dpi: string) => (dpi === "2222333340101" ? clienteGlobal : null),
        estaAsociadoANegocio: async () => false,
        asociarNegocio: async (cId: string, nId: string) => {
            asociacionNegocio = true;
            assert.strictEqual(cId, "cliente-moto-1");
            assert.strictEqual(nId, "taller-central");
        },
    };

    const mockVehiculoRepo: any = {
        actualizar: async (vId: string, nId: string, data: any) => {
            vehiculoActualizado = true;
            assert.strictEqual(vId, "vehiculo-100");
            assert.strictEqual(nId, "taller-central");
            assert.strictEqual(data.cliente_id, "cliente-moto-1");
            return { id: vId, cliente_id: data.cliente_id };
        },
    };

    const useCase = new AsociarClienteVehiculoUseCase(mockVehiculoRepo, mockClienteRepo);

    const resultado = await useCase.execute("vehiculo-100", "2222-33334-0101", "taller-central");

    assert.strictEqual(asociacionNegocio, true);
    assert.strictEqual(vehiculoActualizado, true);
    assert.strictEqual(resultado.cliente_id, "cliente-moto-1");
});

test("AsociarClienteVehiculoUseCase - Error 404 si el cliente no existe", async () => {
    const mockClienteRepo: any = {
        buscarPorDpi: async () => null,
        buscarPorNit: async () => null,
    };
    const useCase = new AsociarClienteVehiculoUseCase({} as any, mockClienteRepo);

    await assert.rejects(
        async () => useCase.execute("vehiculo-1", "9999999999999", "taller-1"),
        (err: any) => err instanceof AppError && err.statusCode === 404
    );
});
