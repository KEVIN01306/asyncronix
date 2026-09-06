import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import type { ObtenerTokenDigifactUseCase } from "./obtener-token-digifact.usecase.js";
import type { IDigifactProvider } from "@shared/domain/providers/digifact.provider.interface.js";
import type { IStorageProvider } from "@shared/domain/providers/storage.provider.js";
import AppError from "@shared/errors/AppError.js";

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

        // 3. Crear el JSON NUC
        const nucJson = this.construirNucJson(documento, config, tipoDocumento);

        // 4. Crear registro de factura en estado EMITIDA
        const total = documento.total ?? 0;
        const subtotalSinIva = total / 1.12; 
        const iva = total - subtotalSinIva;

        let factura = facturaExistente;
        if (!factura) {
            factura = await this.facturaRepository.crear({
                negocio_id: documento.negocio_id,
                sucursal_id: documento.sucursal_id,
                usuario_id: emisor_id || documento.usuario_id || documento.recepcionista_id || documento.negocio_id, // fallback to negocio_id in worst case, though it will fail if UUID not match user, but usually emisor_id or recepcionista is there
                cliente_id: documento.cliente_id,
                venta_id: tipoDocumento === 'VENTA' ? documento.id : undefined,
                servicio_id: tipoDocumento === 'SERVICIO' ? documento.id : undefined,
                tipo_dte: 'FACT',
                numero_factura: `${tipoDocumento === 'VENTA' ? 'V' : 'S'}-${documento.id.slice(-6)}`,
                receptor_nit: (documento.cliente?.nit || "CF").replace(/[^0-9KkCFcf]/g, ''),
                receptor_nombre: documento.cliente?.nombre || "Consumidor Final",
                receptor_direccion: "Ciudad",
                subtotal_sin_iva: parseFloat(subtotalSinIva.toFixed(2)),
                descuento: 0,
                iva: parseFloat(iva.toFixed(2)),
                total: total,
                metodo_pago: tipoDocumento === 'VENTA' ? documento.metodo_pago : (documento.MetodoPago || 'EFECTIVO'),
                estado: 'EMITIDA'
            });
        } else if (factura.estado === 'ERROR') {
            // Si ya existe y está en ERROR, intentaremos sobre esa misma
        }

        try {
            // 5. Obtener token
            const token = await this.obtenerTokenDigifactUseCase.execute(documento.negocio_id);

            // 6. Enviar a certificar
            const certificacion = await this.digifactProvider.certificarFactura(
                token,
                config.nit_emisor,
                config.fel_username,
                nucJson,
                config.fel_ambiente
            );

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
    private construirNucJson(documento: any, config: any, tipoDocumento: 'VENTA' | 'SERVICIO') {
        const ahora = new Date();
        const offset = -6 * 60; // Guatemala UTC-6
        const localTime = new Date(ahora.getTime() + (offset - ahora.getTimezoneOffset()) * 60000);
        const dateIso = localTime.toISOString().replace(/\.\d{3}Z$/, '-06:00');

        const total = documento.total ?? 0;
        const subtotal = total / 1.12;
        const ivaAmount = total - subtotal;

        let numeroLinea = 1;
        let items: any[] = [];

        const formatItem = (descripcion: string, cantidad: number, precioUnitario: number, tipoFiscal: 'Bien' | 'Servicio') => {
            const itemTaxableAmount = (cantidad * precioUnitario) / 1.12;
            const itemIva = (cantidad * precioUnitario) - itemTaxableAmount;
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
                            "TaxableAmount": itemTaxableAmount.toFixed(6),
                            "Amount": itemIva.toFixed(6)
                        }
                    ]
                },
                "Totals": {
                    "TotalItem": (cantidad * precioUnitario).toFixed(6)
                }
            };
        };

        if (tipoDocumento === 'VENTA') {
            items = documento.detalles.map((d: any) => formatItem(d.descripcion, d.cantidad, d.precio_unitario, 'Bien'));
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
                    
                    // Calcular subtotal de repuestos de esta reparación
                    const totalRepuestos = repuestosRep.reduce((acc: number, r: any) => acc + (r.precio_venta * r.cantidad), 0);
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

        return {
            "Version": "1.00",
            "CountryCode": "GT",
            "Header": {
                "DocType": "FACT",
                "IssuedDateTime": dateIso,
                "Currency": documento.negocio.moneda?.codigo || "GTQ"
            },
            "Seller": {
                "TaxID": config.nit_emisor.replace(/[^0-9Kk]/g, ''),
                "Name": config.nombre_emisor,
                "TaxIDAdditionalInfo": [
                    {
                        "Name": "AfiliacionIVA",
                        "Data": null,
                        "Value": config.afiliacion_iva || "GEN"
                    }
                ],
                "Contact": {
                    "EmailList": {
                        "Email": [
                            documento.negocio.usuario?.email || "correo@empresa.com"
                        ]
                    }
                },
                "AdditionlInfo": [
                    {
                        "Name": "TipoFrase",
                        "Data": "1",
                        "Value": "1"
                    },
                    {
                        "Name": "Escenario",
                        "Data": "1",
                        "Value": "2"
                    }
                ],
                "BranchInfo": {
                    "Code": documento.sucursal?.codigo_establecimiento || "1",
                    "Name": documento.sucursal?.nombre || "Establecimiento",
                    "AddressInfo": {
                        "Address": documento.sucursal?.direccion || "Ciudad",
                        "City": "01001",
                        "District": "Guatemala",
                        "State": "Guatemala",
                        "Country": "GT"
                    }
                }
            },
            "Buyer": {
                "TaxID": (documento.cliente?.nit || "CF").replace(/[^0-9KkCFcf]/g, ''),
                "Name": documento.cliente?.nombre || "Consumidor Final",
                "AddressInfo": {
                    "Address": "Ciudad",
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
                            "Amount": ivaAmount.toFixed(6)
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
                                            "Value": "CANTIDAD EN LETRAS"
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
