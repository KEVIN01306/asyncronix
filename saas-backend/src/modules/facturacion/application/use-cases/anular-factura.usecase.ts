import AppError from "@shared/errors/AppError.js";
import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import type { IDigifactProvider } from "@shared/domain/providers/digifact.provider.interface.js";
import type { IStorageProvider } from "@shared/domain/providers/storage.provider.js";
import type { ObtenerTokenDigifactUseCase } from "./obtener-token-digifact.usecase.js";

export class AnularFacturaUseCase {
    constructor(
        private readonly facturaRepository: FacturaRepository,
        private readonly digifactProvider: IDigifactProvider,
        private readonly obtenerTokenDigifactUseCase: ObtenerTokenDigifactUseCase,
        private readonly storageProvider: IStorageProvider
    ) { }

    async execute(factura_id: string, negocio_id: string, comentario: string): Promise<void> {
        // 1. Obtener la factura
        const factura = await this.facturaRepository.obtenerPorId(factura_id);
        if (!factura) {
            throw new AppError("La factura no existe", "FACTURA_NO_ENCONTRADA", 404);
        }

        if (factura.negocio_id !== negocio_id) {
            throw new AppError("No tienes permiso para anular esta factura", "UNAUTHORIZED", 403);
        }

        if (factura.estado === 'ANULADA') {
            throw new AppError("La factura ya se encuentra anulada", "FACTURA_YA_ANULADA", 400);
        }

        if (factura.estado !== 'CERTIFICADA' || !factura.dte_uuid) {
            throw new AppError("Solo se pueden anular facturas certificadas", "FACTURA_NO_CERTIFICADA", 400);
        }

        // 2. Obtener la configuración FEL
        const config = await this.facturaRepository.obtenerConfiguracion(negocio_id);
        if (!config || !config.fel_username || !config.nit_emisor) {
            throw new AppError("No se encontró la configuración de facturación para anular el DTE", "CONFIG_FACTURACION_NO_ENCONTRADA", 404);
        }

        // 3. Obtener el token de Digifact
        const token = await this.obtenerTokenDigifactUseCase.execute(negocio_id);

        // 4. Formatear la fecha estrictamente como requiere Digifact (extrayendo local time de la fecha original)
        // La fecha original está en UTC en BD (ej. 2026-09-05T16:10:57Z)
        // Si Digifact requiere la hora local exacta, debemos restarle 6 horas (UTC-6 para Guatemala)
        const fechaBase = factura.fecha_emision || new Date();
        const guatemalaTime = new Date(fechaBase.getTime() - 6 * 60 * 60 * 1000);
        const fechaEmision = guatemalaTime.toISOString().split('.')[0]; // YYYY-MM-DDTHH:mm:ss

        const receptor = factura.receptor_nit || 'CF';

        // 5. Enviar a Digifact la solicitud
        const response = await this.digifactProvider.anularFactura(token, {
            Taxid: config.nit_emisor,
            Autorizacion: factura.dte_uuid,
            IdReceptor: receptor,
            FechaEmisionDocumentoAnular: String(fechaEmision),
            MotivoAnulacion: comentario,
            Username: config.fel_username,
            ambiente: config.fel_ambiente || 'TEST'
        });

        // 6. Validar respuesta
        if (!response || response.code !== 1) {
            throw new AppError(response?.message || "Error al anular factura en Digifact", "DIGIFACT_ANULACION_ERROR", 502);
        }

        let newXmlUrl = null;
        let oldXmlUrl = factura.dte_sat_xml;
        let oldPdfUrl = factura.dle_sat_pdf; // Typo en schema "dle_sat_pdf"

        // 7. Reemplazar el XML existente
        if (response.responseData1) {
            try {
                const xmlBuffer = Buffer.from(response.responseData1, 'base64');
                newXmlUrl = await this.storageProvider.uploadFile(
                    { buffer: xmlBuffer, originalname: "factura_anulada.xml", mimetype: "application/xml", size: xmlBuffer.length },
                    `${negocio_id}/facturas/${factura.id}`
                );
            } catch (storageError) {
                // Si el almacenamiento falla, NO actualizamos la factura en BD para que no quede huérfana
                throw new AppError("Error guardando documento anulado en storage", "STORAGE_ERROR", 500);
            }
        } else {
            throw new AppError("Digifact no devolvió el XML de anulación (ResponseDATA1)", "DIGIFACT_RESPONSE_INCOMPLETE", 502);
        }

        // 8. Actualizar la factura en Base de Datos
        try {
            await this.facturaRepository.marcarComoAnulada(
                factura.id,
                newXmlUrl,
                comentario,
                (response as any).AcuseReciboSAT || null // Lo casteamos por si acaso no está en la interfaz
            );
        } catch (dbError) {
            // Si la base de datos falla, intentamos borrar el nuevo XML para no dejarlo suelto
            try {
                await this.storageProvider.deleteFile(newXmlUrl);
            } catch (e) {
                console.error("No se pudo eliminar el XML de anulación tras un fallo en BD", e);
            }
            throw new AppError("Error al actualizar la base de datos", "DATABASE_ERROR", 500);
        }

        // 9. Borrar los archivos antiguos
        try {
            if (oldXmlUrl) await this.storageProvider.deleteFile(oldXmlUrl);
            if (oldPdfUrl) await this.storageProvider.deleteFile(oldPdfUrl);
        } catch (e) {
            console.error("No se pudo eliminar los archivos originales de la factura", e);
            // Esto no debe frenar el flujo, ya que la factura sí se anuló correctamente
        }
    }
}
