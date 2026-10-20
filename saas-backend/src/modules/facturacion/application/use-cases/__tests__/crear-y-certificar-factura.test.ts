import test from "node:test";
import assert from "node:assert/strict";
import { CrearYCertificarFacturaUseCase } from "../crear-y-certificar-factura.usecase.js";
import AppError from "@shared/errors/AppError.js";

// Mock Factory
function createMocks() {
    let facturaCreadaData: any = null;
    let facturaMarcadaCertificada: any = null;

    const datosVenta: any = {
        id: "venta-123",
        negocio_id: "negocio-uuid-123",
        sucursal_id: "sucursal-uuid-456",
        usuario_id: "user-uuid-789",
        cliente_id: "cliente-uuid-101",
        total: 100,
        metodo_pago: 'EFECTIVO',
        cliente: { nit: "388577959", nombre: "Juan Perez", direccion: "1ra Calle 2-30" },
        negocio: {
            moneda: { codigo: "GTQ" },
            usuario: { email: "admin@empresa.com" },
            negocioFacturacionConfig: {
                nit_emisor: "12345678",
                nombre_emisor: "Mi Empresa S.A.",
                nombre_comercial: "Comercial Mi Empresa",
                afiliacion_iva: "GEN",
                tipo_frase: 1,
                codigo_escenario: 2,
                correo_emisor: "facturas@empresa.com",
                fel_username: "mi_usuario",
                fel_ambiente: "PRUEBAS"
            }
        },
        sucursal: {
            nombre: "Sucursal Central",
            codigo_establecimiento: "2",
            direccion: "Calzada Roosevelt 15-40 Zona 11",
            codigo_postal: "01011",
            division_nivel_2: {
                nombre: "Mixco",
                codigo_postal: "01057",
                division_nivel_1: {
                    nombre: "Guatemala",
                    pais: { codigo_iso: "GT" }
                }
            }
        },
        detalles: [
            { descripcion: "Producto A", cantidad: 2, precio_unitario: 50 }
        ]
    };

    const mockRepo: any = {
        obtenerPorVentaId: async () => null,
        obtenerPorServicioId: async () => null,
        obtenerDatosParaFacturar: async () => datosVenta,
        crear: async (data: any) => {
            facturaCreadaData = data;
            return { id: "factura-uuid-999", ...data };
        },
        marcarComoCertificada: async (id: string, uuid: string, serie: string, fecha: Date, xmlUrl: string, pdfUrl: string) => {
            facturaMarcadaCertificada = { id, uuid, serie, fecha, xmlUrl, pdfUrl };
            return { ...facturaCreadaData, id, estado: 'CERTIFICADA', dte_uuid: uuid };
        },
        marcarComoError: async () => {}
    };

    const mockTokenUseCase: any = {
        execute: async () => "token-digifact-valido"
    };

    let certificacionPayload: any = null;
    const mockDigifact: any = {
        certificarFactura: async (token: string, nit: string, user: string, nucJson: any, ambiente: string) => {
            certificacionPayload = nucJson;
            return {
                code: 1,
                message: "Factura certificada",
                authNumber: "AUTH-UUID-TEST-9999",
                serial: "SERIE123",
                issuedTimeStamp: new Date().toISOString(),
                responseData1: Buffer.from("<xml>test</xml>").toString('base64'),
                responseData3: Buffer.from("pdf-data").toString('base64')
            };
        }
    };

    const mockStorage: any = {
        uploadFile: async (file: any, path: string) => `https://r2.dev/${path}/${file.originalname}`,
        deleteFile: async () => {}
    };

    const useCase = new CrearYCertificarFacturaUseCase(
        mockRepo,
        mockTokenUseCase,
        mockDigifact,
        mockStorage
    );

    return {
        useCase,
        mockRepo,
        mockTokenUseCase,
        datosVenta,
        mockDigifact,
        getFacturaCreada: () => facturaCreadaData,
        getCertificacionPayload: () => certificacionPayload
    };
}

test("Régimen GEN: DocType es FACT, cálculo de IVA 12% y desglose", async () => {
    const { useCase, getFacturaCreada, getCertificacionPayload } = createMocks();

    const result = await useCase.execute("venta-123", "VENTA");
    assert.strictEqual(result.estado, "CERTIFICADA");

    // Validar datos persistidos en BD
    const facturaPersistida = getFacturaCreada();
    assert.strictEqual(facturaPersistida.emisor_afiliacion_iva, "GEN");
    assert.strictEqual(facturaPersistida.tipo_dte, "FACT");
    assert.strictEqual(facturaPersistida.porcentaje_impuesto, 0.12);
    assert.strictEqual(facturaPersistida.total, 100);
    // 100 / 1.12 = 89.285714
    assert.strictEqual(facturaPersistida.subtotal_sin_iva, 89.285714);
    // 100 - 89.285714 = 10.714286
    assert.strictEqual(facturaPersistida.total_impuestos, 10.714286);

    // Validar JSON enviado a Digifact
    const nucJson = getCertificacionPayload();
    assert.strictEqual(nucJson.Header.DocType, "FACT");
    assert.strictEqual(nucJson.Items.length, 1);
    assert.strictEqual(nucJson.Items[0].Taxes.Tax[0].TaxableAmount, "89.285714");
    assert.strictEqual(nucJson.Items[0].Taxes.Tax[0].Amount, "10.714286");
    assert.strictEqual(nucJson.Totals.TotalTaxes.TotalTax[0].Amount, "10.714286");
    assert.strictEqual(nucJson.Totals.GrandTotal.InvoiceTotal, "100.000000");
});

test("Régimen PEQ: DocType es FPEQ, TaxableAmount completo, Amount=0 y TotalTax.Amount=0", async () => {
    const { useCase, datosVenta, getFacturaCreada, getCertificacionPayload } = createMocks();

    // Cambiar configuración del negocio a PEQ
    datosVenta.negocio.negocioFacturacionConfig.afiliacion_iva = "PEQ";

    const result = await useCase.execute("venta-123", "VENTA");
    assert.strictEqual(result.estado, "CERTIFICADA");

    // Validar datos persistidos en BD para PEQ
    const facturaPersistida = getFacturaCreada();
    assert.strictEqual(facturaPersistida.emisor_afiliacion_iva, "PEQ");
    assert.strictEqual(facturaPersistida.tipo_dte, "FPEQ");
    assert.strictEqual(facturaPersistida.porcentaje_impuesto, 0.05);
    assert.strictEqual(facturaPersistida.total, 100);
    // Base imponible conserva el total cobrado
    assert.strictEqual(facturaPersistida.subtotal_sin_iva, 100);
    // total_impuestos interno estimado: 100 * 0.05 = 5.000000
    assert.strictEqual(facturaPersistida.total_impuestos, 5);

    // Validar JSON enviado a Digifact para PEQ
    const nucJson = getCertificacionPayload();
    assert.strictEqual(nucJson.Header.DocType, "FPEQ");
    assert.strictEqual(nucJson.Seller.TaxIDAdditionalInfo[0].Value, "PEQ");

    // FormatItem: TaxableAmount conserva el valor sin descontar el 5%, Amount es 0.000000
    assert.strictEqual(nucJson.Items[0].Taxes.Tax[0].TaxableAmount, "100.000000");
    assert.strictEqual(nucJson.Items[0].Taxes.Tax[0].Amount, "0.000000");
    assert.strictEqual(nucJson.Items[0].Totals.TotalItem, "100.000000");

    // Totals: TotalTax.Amount debe ser 0.000000
    assert.strictEqual(nucJson.Totals.TotalTaxes.TotalTax[0].Amount, "0.000000");
    assert.strictEqual(nucJson.Totals.GrandTotal.InvoiceTotal, "100.000000");
});

test("AdditionalInfo utiliza TipoFrase y Escenario de la configuración del negocio", async () => {
    const { useCase, datosVenta, getCertificacionPayload } = createMocks();

    datosVenta.negocio.negocioFacturacionConfig.tipo_frase = 3;
    datosVenta.negocio.negocioFacturacionConfig.codigo_escenario = 5;

    await useCase.execute("venta-123", "VENTA");

    const nucJson = getCertificacionPayload();
    const additionlInfo = nucJson.Seller.AdditionlInfo;
    const tipoFraseObj = additionlInfo.find((a: any) => a.Name === "TipoFrase");
    const escenarioObj = additionlInfo.find((a: any) => a.Name === "Escenario");

    assert.strictEqual(tipoFraseObj.Value, "3");
    assert.strictEqual(escenarioObj.Value, "5");
});

test("AddressInfo utiliza la dirección y datos de la sucursal de origen", async () => {
    const { useCase, getCertificacionPayload } = createMocks();

    await useCase.execute("venta-123", "VENTA");

    const nucJson = getCertificacionPayload();
    const branchInfo = nucJson.Seller.BranchInfo;

    assert.strictEqual(branchInfo.Code, "2");
    assert.strictEqual(branchInfo.Name, "Sucursal Central");
    assert.strictEqual(branchInfo.AddressInfo.Address, "Calzada Roosevelt 15-40 Zona 11");
    assert.strictEqual(branchInfo.AddressInfo.City, "01011");
    assert.strictEqual(branchInfo.AddressInfo.District, "Mixco");
    assert.strictEqual(branchInfo.AddressInfo.State, "Guatemala");
    assert.strictEqual(branchInfo.AddressInfo.Country, "GT");
});

test("CANTIDAD_LETRAS se genera correctamente en el backend", async () => {
    const { useCase, getCertificacionPayload } = createMocks();

    await useCase.execute("venta-123", "VENTA");

    const nucJson = getCertificacionPayload();
    const addDocs = nucJson.AdditionalDocumentInfo.AdditionalInfo[0].AditionalData.Data[0].Info;
    const cantidadLetrasObj = addDocs.find((i: any) => i.Name === "CANTIDAD_LETRAS");

    assert.strictEqual(cantidadLetrasObj.Value, "CIEN QUETZALES CON 00/100");
});

test("Régimen no soportado lanza error de negocio claro", async () => {
    const { useCase, datosVenta } = createMocks();

    datosVenta.negocio.negocioFacturacionConfig.afiliacion_iva = "EXENTO_INVALIDO";

    await assert.rejects(
        async () => {
            await useCase.execute("venta-123", "VENTA");
        },
        (err: any) => {
            assert(err instanceof AppError);
            assert.strictEqual(err.code, "REGIMEN_FISCAL_NO_SOPORTADO");
            assert(err.message.includes("no soportado"));
            return true;
        }
    );
});

test("Cuando el token es rechazado con 401 Unauthorized, solicita nuevo token con credenciales y reintenta con éxito", async () => {
    const { useCase, mockDigifact, mockTokenUseCase } = createMocks();

    let tokenCalls: { forceRefresh?: boolean | undefined }[] = [];
    mockTokenUseCase.execute = async (_negocioId: string, forceRefresh?: boolean) => {
        tokenCalls.push({ forceRefresh });
        return forceRefresh ? "nuevo-token-fresco-123" : "token-viejo-expirado";
    };

    let intentosCertificacion = 0;
    mockDigifact.certificarFactura = async (token: string) => {
        intentosCertificacion++;
        if (token === "token-viejo-expirado") {
            throw new AppError("Invalid JSON response: 401 Unauthorized", "DIGIFACT_UNAUTHORIZED", 401);
        }
        return {
            code: 1,
            message: "Factura certificada tras refresco de credenciales",
            authNumber: "AUTH-RETRY-OK-123",
            serial: "SERIE-RETRY",
            issuedTimeStamp: new Date().toISOString(),
            responseData1: Buffer.from("<xml>test</xml>").toString("base64"),
            responseData3: Buffer.from("pdf-data").toString("base64")
        };
    };

    const resultado = await useCase.execute("venta-123", "VENTA");

    assert.strictEqual(resultado.estado, "CERTIFICADA");
    assert.strictEqual(resultado.dte_uuid, "AUTH-RETRY-OK-123");
    assert.strictEqual(intentosCertificacion, 2);
    // Verificamos que el segundo llamado a token se hizo con forceRefresh = true
    assert.strictEqual(tokenCalls.length, 2);
    assert.strictEqual(tokenCalls[0]?.forceRefresh, undefined);
    assert.strictEqual(tokenCalls[1]?.forceRefresh, true);
});
