import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import type { ObtenerTokenDigifactUseCase } from "./obtener-token-digifact.usecase.js";
import type { IDigifactProvider } from "../../../../shared/domain/providers/digifact.provider.interface.js";
import type { IStorageProvider } from "../../../../shared/domain/providers/storage.provider.js";
import { obtenerConfiguracionRegimen, type ConfiguracionRegimenFiscal } from "../../domain/constants/regimen-fiscal.constants.js";
import { numeroALetras } from "../../../../shared/utils/numeroALetras.js";
import AppError from "../../../../shared/errors/AppError.js";

export class CrearYCertificarFacturaUseCase {
    constructor(
        private readonly facturaRepository: FacturaRepository,
        private readonly obtenerTokenDigifactUseCase: ObtenerTokenDigifactUseCase,
        private readonly digifactProvider: IDigifactProvider,
        private readonly storageProvider: IStorageProvider
    ) { }

    async execute(documentoId: string, tipoDocumento: 'VENTA' | 'SERVICIO' = 'VENTA', emisor_id?: string): Promise<any> {
        // 1. Validar Idempotencia
        let facturaExistente;
        if (tipoDocumento === 'VENTA') {
            facturaExistente = await this.facturaRepository.obtenerPorVentaId(documentoId);
        } else {
            facturaExistente = await this.facturaRepository.obtenerPorServicioId(documentoId);
        }

        if (facturaExistente && facturaExistente.estado === 'CERTIFICADA') {
            return facturaExistente;
        }

        // 2. Obtener datos
        let documento;
        if (tipoDocumento === 'VENTA') {
            documento = await this.facturaRepository.obtenerDatosParaFacturar(documentoId);
        } else {
            documento = await this.facturaRepository.obtenerDatosParaFacturarServicio(documentoId);
        }

        if (!documento) throw new AppError("Documento no encontrado", "DOCUMENTO_NO_ENCONTRADO", 404);

        const config = documento.negocio.negocioFacturacionConfig;
        if (!config) throw new AppError("Configuración de facturación no encontrada", "FACTURACION_NO_CONFIGURADA", 400);

        // Validar y obtener configuración fiscal del régimen
        const regimenConfig = obtenerConfiguracionRegimen(config.afiliacion_iva);

        // 3. Crear el JSON NUC para Digifact
        const nucJson = this.construirNucJson(documento, config, tipoDocumento, regimenConfig);

        // 4. Cálculos internos para persistencia contable/fiscal
        const total = Number(documento.total ?? 0);
        let subtotalSinIva: number;
        let totalImpuestos: number;

        if (regimenConfig.codigo === 'PEQ') {
            // Para Pequeño Contribuyente: los conceptos no descuentan impuesto del precio.
            // La base imponible interna corresponde al total facturado y el impuesto estimado es del 5%.
            subtotalSinIva = total;
            totalImpuestos = total * regimenConfig.porcentajeImpuestoDecimal;
        } else {
            // Para Régimen General: IVA 12% desglosado
            subtotalSinIva = total / (1 + regimenConfig.porcentajeImpuestoDecimal);
            totalImpuestos = total - subtotalSinIva;
        }

        let factura = facturaExistente;
        if (!factura) {
            factura = await this.facturaRepository.crear({
                negocio_id: documento.negocio_id,
                sucursal_id: documento.sucursal_id,
                usuario_id: emisor_id || documento.usuario_id || documento.recepcionista_id || documento.negocio_id,
                cliente_id: documento.cliente_id,
                venta_id: tipoDocumento === 'VENTA' ? documento.id : undefined,
                servicio_id: tipoDocumento === 'SERVICIO' ? documento.id : undefined,
                tipo_dte: regimenConfig.docType,
                numero_factura: `${tipoDocumento === 'VENTA' ? 'V' : 'S'}-${documento.id.slice(-6)}`,
                receptor_nit: (documento.cliente?.nit || "CF").replace(/[^0-9KkCFcf]/g, ''),
                receptor_nombre: documento.cliente?.nombre || "Consumidor Final",
                receptor_direccion: "Ciudad",
                emisor_afiliacion_iva: regimenConfig.codigo,
                subtotal_sin_iva: parseFloat(subtotalSinIva.toFixed(6)),
                descuento: 0,
                porcentaje_impuesto: regimenConfig.porcentajeImpuestoDecimal,
                total_impuestos: parseFloat(totalImpuestos.toFixed(6)),
                total: parseFloat(total.toFixed(6)),
                metodo_pago: tipoDocumento === 'VENTA' ? documento.metodo_pago : (documento.MetodoPago || 'EFECTIVO'),
                estado: 'EMITIDA'
            });
        } else if (factura.estado === 'ERROR') {
            // Si ya existe y está en ERROR, intentaremos sobre esa misma
        }

        try {
            // 5. Obtener token
            let token = await this.obtenerTokenDigifactUseCase.execute(documento.negocio_id);

            // 6. Enviar a certificar con reintento si el token expiró o es inválido
            let certificacion: any;
            try {
                certificacion = await this.digifactProvider.certificarFactura(
                    token,
                    config.nit_emisor,
                    config.fel_username,
                    nucJson,
                    config.fel_ambiente
                );
            } catch (certError: any) {
                const esNoAutorizado = certError?.codigo === "DIGIFACT_UNAUTHORIZED" || 
                                       certError?.statusCode === 401 || 
                                       certError?.message?.includes("401") || 
                                       certError?.message?.includes("Unauthorized") ||
                                       certError?.message?.toLowerCase().includes("token");

                if (esNoAutorizado) {
                    console.warn(`[Digifact] Token no autorizado o expirado para negocio ${documento.negocio_id}. Renovando token con credenciales...`);
                    token = await this.obtenerTokenDigifactUseCase.execute(documento.negocio_id, true);
                    certificacion = await this.digifactProvider.certificarFactura(
                        token,
                        config.nit_emisor,
                        config.fel_username,
                        nucJson,
                        config.fel_ambiente
                    );
                } else {
                    throw certError;
                }
            }

            // 7. Subir a R2
            let xmlUrl = undefined;
            let pdfUrl = undefined;

            try {
                if (certificacion.responseData1) {
                    const xmlBuffer = Buffer.from(certificacion.responseData1, 'base64');
                    xmlUrl = await this.storageProvider.uploadFile(
                        { buffer: xmlBuffer, originalname: "factura.xml", mimetype: "application/xml", size: xmlBuffer.length },
                        `${documento.negocio_id}/facturas/${factura.id}`
                    );
                }

                if (certificacion.responseData3) {
                    const pdfBuffer = Buffer.from(certificacion.responseData3, 'base64');
                    pdfUrl = await this.storageProvider.uploadFile(
                        { buffer: pdfBuffer, originalname: "factura.pdf", mimetype: "application/pdf", size: pdfBuffer.length },
                        `${documento.negocio_id}/facturas/${factura.id}`
                    );
                }
            } catch (storageError) {
                // Compensación R2: si subió uno pero falló el otro
                if (xmlUrl) await this.storageProvider.deleteFile(xmlUrl);
                if (pdfUrl) await this.storageProvider.deleteFile(pdfUrl);
                throw new AppError("Error guardando documentos en R2", "STORAGE_ERROR", 500);
            }

            // 8. Actualizar factura a CERTIFICADA
            const certificada = await this.facturaRepository.marcarComoCertificada(
                factura.id,
                certificacion.authNumber || "",
                certificacion.serial || "",
                new Date(certificacion.issuedTimeStamp || new Date()),
                xmlUrl,
                pdfUrl
            );

            return certificada;
        } catch (error: any) {
            // 9. Manejo de error y marcar factura
            await this.facturaRepository.marcarComoError(factura.id);
            throw error;
        }
    }

    public construirNucJson(
        documento: any, 
        config: any, 
        tipoDocumento: 'VENTA' | 'SERVICIO',
        regimenConfig: ConfiguracionRegimenFiscal
    ) {
        const ahora = new Date();
        const offset = -6 * 60; // Guatemala UTC-6
        const localTime = new Date(ahora.getTime() + (offset - ahora.getTimezoneOffset()) * 60000);
        const dateIso = localTime.toISOString().replace(/\.\d{3}Z$/, '-06:00');

        const total = Number(documento.total ?? 0);
        const esPeq = regimenConfig.codigo === 'PEQ';

        // Para GEN: el total incluye IVA 12%
        // Para PEQ: no se desglosa IVA (Amount = 0, TotalTax.Amount = 0)
        const subtotalGen = total / 1.12;
        const ivaAmountGen = total - subtotalGen;

        let numeroLinea = 1;
        let items: any[] = [];

        const formatItem = (descripcion: string, cantidad: number, precioUnitario: number, tipoFiscal: 'Bien' | 'Servicio') => {
            const lineTotal = Number(cantidad) * Number(precioUnitario);

            let itemTaxableAmountStr: string;
            let itemIvaStr: string;

            if (esPeq) {
                // Para PEQ:
                // - TaxableAmount contiene el importe completo sin descontar impuesto
                // - Amount se envía en 0.000000 (sin desglose de IVA del 5%)
                itemTaxableAmountStr = lineTotal.toFixed(6);
                itemIvaStr = Number(0).toFixed(6);
            } else {
                // Para GEN: desglose oficial de IVA 12%
                const itemTaxableAmount = lineTotal / 1.12;
                const itemIva = lineTotal - itemTaxableAmount;
                itemTaxableAmountStr = itemTaxableAmount.toFixed(6);
                itemIvaStr = itemIva.toFixed(6);
            }

            return {
                "Number": String(numeroLinea++),
                "Codes": null,
                "Type": tipoFiscal,
                "Description": descripcion,
                "Qty": Number(cantidad).toFixed(6),
                "UnitOfMeasure": "UNI",
                "Price": Number(precioUnitario).toFixed(6),
                "Discounts": null,
                "Taxes": {
                    "Tax": [
                        {
                            "Code": "1",
                            "Description": "IVA",
                            "TaxableAmount": itemTaxableAmountStr,
                            "Amount": itemIvaStr
                        }
                    ]
                },
                "Totals": {
                    "TotalItem": lineTotal.toFixed(6)
                }
            };
        };

        if (tipoDocumento === 'VENTA') {
            items = (documento.detalles || []).map((d: any) => formatItem(d.descripcion, d.cantidad, d.precio_unitario, 'Bien'));
        } else {
            // Es SERVICIO
            // 1. Mano de Obra (subtotal)
            if (documento.subtotal > 0) {
                const nombreServicio = documento.tipo_servicio?.nombre || 'Mano de obra';
                items.push(formatItem(nombreServicio, 1, documento.subtotal, 'Servicio'));
            }

            // 2. Repuestos de Inventario
            if (documento.repuestos) {
                documento.repuestos.forEach((rep: any) => {
                    const desc = rep.variante?.producto?.nombre || 'Repuesto';
                    items.push(formatItem(desc, rep.cantidad, rep.precio_venta, 'Bien'));
                });
            }

            // 3. Reparaciones
            if (documento.servicioReparacion) {
                documento.servicioReparacion.forEach((rep: any, i: number) => {
                    const descRep = rep.descripcion ? `Reparación: ${rep.descripcion}` : `Reparación #${i + 1}`;
                    const repuestosRep = rep.servicioRepuestos || [];

                    const manoObraReparacion = rep.total ? rep.total : 0;

                    if (manoObraReparacion > 0) {
                        items.push(formatItem(descRep, 1, manoObraReparacion, 'Servicio'));
                    }

                    repuestosRep.forEach((r: any) => {
                        const rDesc = r.variante?.producto?.nombre || 'Repuesto de reparación';
                        items.push(formatItem(rDesc, r.cantidad, r.precio_venta, 'Bien'));
                    });
                });
            }

            // 4. Custodias
            if (documento.servicioCustodia) {
                documento.servicioCustodia.forEach((cust: any, i: number) => {
                    if (cust.total > 0) {
                        const desc = cust.descripcion ? `Custodia: ${cust.descripcion}` : `Custodia #${i + 1}`;
                        items.push(formatItem(desc, 1, cust.total, 'Servicio'));
                    }
                });
            }
        }

        // CANTIDAD_LETRAS generado de forma autónoma en el backend
        const cantidadEnLetras = numeroALetras(Number(total.toFixed(2)));

        // AddressInfo de la sucursal de origen de la factura
        const sucursalDireccion = documento.sucursal?.direccion || "Ciudad";
        const sucursalCodigoPostal = documento.sucursal?.codigo_postal || documento.sucursal?.division_nivel_2?.codigo_postal || "01001";
        const sucursalMunicipio = documento.sucursal?.division_nivel_2?.nombre || "Guatemala";
        const sucursalDepartamento = documento.sucursal?.division_nivel_2?.division_nivel_1?.nombre || "Guatemala";
        const sucursalPais = documento.sucursal?.division_nivel_2?.division_nivel_1?.pais?.codigo_iso || "GT";

        return {
            "Version": "1.00",
            "CountryCode": "GT",
            "Header": {
                "DocType": regimenConfig.docType,
                "IssuedDateTime": dateIso,
                "Currency": documento.negocio?.moneda?.codigo || "GTQ"
            },
            "Seller": {
                "TaxID": config.nit_emisor.replace(/[^0-9Kk]/g, ''),
                "Name": config.nombre_emisor,
                "TaxIDAdditionalInfo": [
                    {
                        "Name": "AfiliacionIVA",
                        "Data": null,
                        "Value": regimenConfig.codigo
                    }
                ],
                "Contact": {
                    "EmailList": {
                        "Email": [
                            config.correo_emisor || documento.negocio?.usuario?.email || "correo@empresa.com"
                        ]
                    }
                },
                "AdditionlInfo": [
                    {
                        "Name": "TipoFrase",
                        "Data": "1",
                        "Value": String(config.tipo_frase ?? "1")
                    },
                    {
                        "Name": "Escenario",
                        "Data": "1",
                        "Value": String(config.codigo_escenario ?? "1")
                    }
                ],
                "BranchInfo": {
                    "Code": documento.sucursal?.codigo_establecimiento || "1",
                    "Name": documento.sucursal?.nombre || "Establecimiento",
                    "AddressInfo": {
                        "Address": sucursalDireccion,
                        "City": sucursalCodigoPostal,
                        "District": sucursalMunicipio,
                        "State": sucursalDepartamento,
                        "Country": sucursalPais
                    }
                }
            },
            "Buyer": {
                "TaxID": (documento.cliente?.nit || "CF").replace(/[^0-9KkCFcf]/g, ''),
                "Name": documento.cliente?.nombre || "Consumidor Final",
                "AddressInfo": {
                    "Address": documento.cliente?.direccion || "Ciudad",
                    "City": "01010",
                    "District": "Guatemala",
                    "State": "Guatemala",
                    "Country": "GT"
                }
            },
            "ThirdParties": null,
            "Items": items,
            "Totals": {
                "TotalTaxes": {
                    "TotalTax": [
                        {
                            "Description": "IVA",
                            "Amount": esPeq ? Number(0).toFixed(6) : ivaAmountGen.toFixed(6)
                        }
                    ]
                },
                "GrandTotal": {
                    "InvoiceTotal": total.toFixed(6)
                }
            },
            "AdditionalDocumentInfo": {
                "AdditionalInfo": [
                    {
                        "Code": "FRONT-263C-444B-89BA-6F87EC1330C0",
                        "Type": "ADENDA",
                        "AditionalData": {
                            "Data": [
                                {
                                    "Name": "INFORMACION_ADICIONAL",
                                    "Info": [
                                        {
                                            "Name": "OBSERVACIONES",
                                            "Data": null,
                                            "Value": "-"
                                        },
                                        {
                                            "Name": "CANTIDAD_LETRAS",
                                            "Data": null,
                                            "Value": cantidadEnLetras
                                        }
                                    ]
                                },
                                {
                                    "Name": "DetallesAux_Detalle",
                                    "Info": [
                                        {
                                            "Name": "NumeroLinea",
                                            "Data": null,
                                            "Value": "1"
                                        },
                                        {
                                            "Name": "Descripcion_Adicional",
                                            "Data": null,
                                            "Value": "-"
                                        },
                                        {
                                            "Name": "CodigoEAN",
                                            "Data": null,
                                            "Value": "0001"
                                        },
                                        {
                                            "Name": "CategoriaAdicional",
                                            "Data": null,
                                            "Value": "-"
                                        }
                                    ]
                                }
                            ]
                        },
                        "AditionalInfo": [
                            {
                                "Name": "VALIDAR_REFERENCIA_INTERNA",
                                "Data": null,
                                "Value": "NO_VALIDAR"
                            }
                        ]
                    }
                ]
            }
        };
    }
}
