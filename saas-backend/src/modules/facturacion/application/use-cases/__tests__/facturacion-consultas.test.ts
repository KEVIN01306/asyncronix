import test from "node:test";
import assert from "node:assert/strict";
import { resolverRangoFechas } from "../../utils/date-range.util.js";
import { ListarFacturasUseCase } from "../listar-facturas.usecase.js";
import { ObtenerResumenFiscalUseCase } from "../obtener-resumen-fiscal.usecase.js";
import { ObtenerDocumentoFacturaUseCase } from "../obtener-documento-factura.usecase.js";
import AppError from "@shared/errors/AppError.js";

test("resolverRangoFechas - 24 horas", () => {
    const { inicio, fin } = resolverRangoFechas("24_horas");
    const diffHours = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    assert.strictEqual(Math.round(diffHours), 24);
});

test("resolverRangoFechas - 7 días", () => {
    const { inicio, fin } = resolverRangoFechas("7_dias");
    const diffDays = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
    assert.strictEqual(Math.round(diffDays), 7);
});

test("resolverRangoFechas - 30 días", () => {
    const { inicio, fin } = resolverRangoFechas("30_dias");
    const diffDays = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
    assert.strictEqual(Math.round(diffDays), 30);
});

test("resolverRangoFechas - Este mes", () => {
    const { inicio, fin } = resolverRangoFechas("este_mes");
    assert(inicio <= fin);
    assert(inicio.getTime() <= Date.now());
});

test("resolverRangoFechas - Rango personalizado válido", () => {
    const { inicio, fin } = resolverRangoFechas("custom", "2026-10-01", "2026-10-15");
    assert(inicio <= fin);
});

test("resolverRangoFechas - Rango personalizado inválido (inicio posterior a fin)", () => {
    assert.throws(
        () => resolverRangoFechas("custom", "2026-10-20", "2026-10-05"),
        (err: any) => {
            assert(err instanceof AppError);
            assert.strictEqual(err.code, "RANGO_FECHAS_INVALIDO");
            return true;
        }
    );
});

test("ListarFacturasUseCase - devuelve facturas filtradas y paginadas", async () => {
    const mockRepo: any = {
        listarEmitidas: async (negocioId: string, filtros: any) => ({
            data: [
                {
                    id: "fact-1",
                    dte_uuid: "UUID-1",
                    serie: "SER-1",
                    numero_factura: "V-100",
                    tipo_dte: "FACT",
                    fecha_emision: new Date(),
                    total: 100,
                    total_impuestos: 10.71,
                    subtotal_sin_iva: 89.29,
                    porcentaje_impuesto: 0.12,
                    emisor_afiliacion_iva: "GEN",
                    receptor_nit: "CF",
                    receptor_nombre: "Consumidor Final",
                    estado: "CERTIFICADA",
                    dte_sat_xml: "https://r2.dev/factura.xml",
                    dle_sat_pdf: "https://r2.dev/factura.pdf"
                }
            ],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
        })
    };

    const useCase = new ListarFacturasUseCase(mockRepo);
    const resultado = await useCase.execute({
        negocio_id: "neg-1",
        periodo: "7_dias",
        page: 1,
        limit: 10
    });

    assert.strictEqual(resultado.data.length, 1);
    assert.strictEqual(resultado.data[0]?.dte_uuid, "UUID-1");
    assert.strictEqual(resultado.data[0]?.tiene_xml, true);
    assert.strictEqual(resultado.data[0]?.tiene_pdf, true);
    assert.strictEqual(resultado.pagination.total, 1);
});

test("ObtenerResumenFiscalUseCase - calcula métricas y respeta facturas anuladas", async () => {
    const mockRepo: any = {
        obtenerResumenFiscal: async (negocioId: string, inicio: Date, fin: Date) => ({
            total_facturado: 1500,
            total_impuestos_estimados: 160.71,
            cantidad_facturas: 5,
            cantidad_anuladas: 1,
            total_anulado: 200,
            regimen_fiscal_actual: "GEN"
        })
    };

    const useCase = new ObtenerResumenFiscalUseCase(mockRepo);
    const resumen = await useCase.execute({
        negocio_id: "neg-1",
        periodo: "este_mes"
    });

    assert.strictEqual(resumen.total_facturado, 1500);
    assert.strictEqual(resumen.total_impuestos_estimados, 160.71);
    assert.strictEqual(resumen.cantidad_facturas, 5);
    assert.strictEqual(resumen.cantidad_anuladas, 1);
    assert.strictEqual(resumen.regimen_fiscal_actual, "GEN");
});

test("ObtenerDocumentoFacturaUseCase - devuelve URL del documento según tipo", async () => {
    const mockRepo: any = {
        obtenerPorIdYNegocio: async (id: string, negocioId: string) => ({
            id,
            negocio_id: negocioId,
            numero_factura: "V-123",
            dte_uuid: "UUID-TEST",
            dte_sat_xml: "https://r2.dev/factura.xml",
            dle_sat_pdf: null
        })
    };

    const useCase = new ObtenerDocumentoFacturaUseCase(mockRepo);

    // XML disponible
    const resXml = await useCase.execute("fact-1", "xml", "neg-1");
    assert.strictEqual(resXml.url, "https://r2.dev/factura.xml");

    // PDF no disponible
    await assert.rejects(
        async () => {
            await useCase.execute("fact-1", "pdf", "neg-1");
        },
        (err: any) => {
            assert(err instanceof AppError);
            assert.strictEqual(err.code, "DOCUMENTO_NO_DISPONIBLE");
            return true;
        }
    );
});
