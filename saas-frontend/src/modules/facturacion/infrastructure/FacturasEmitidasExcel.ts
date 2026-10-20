import * as ExcelJS from 'exceljs';
import type { FacturaEmitida } from '../domain/interfaces/factura.interface';

export interface ExportFacturasExcelParams {
    facturas: FacturaEmitida[];
    negocioNombre?: string;
    negocioNit?: string;
    periodoLabel: string;
    rangoFechas?: string;
    filtroBusqueda?: string;
    monedaSimbolo?: string;
}

export const generarFacturasEmitidasExcel = async ({
    facturas,
    negocioNombre = 'Asyncronix',
    negocioNit = 'C/F',
    periodoLabel,
    rangoFechas,
    filtroBusqueda,
    monedaSimbolo = 'Q'
}: ExportFacturasExcelParams): Promise<ExcelJS.Workbook> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Asyncronix SaaS';
    workbook.lastModifiedBy = 'Asyncronix SaaS';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Facturas Emitidas', {
        views: [{ showGridLines: true }]
    });

    const borderThin: Partial<ExcelJS.Borders> = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };

    // 1. Título principal
    sheet.mergeCells('A1:N1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'LIBRO DE FACTURAS EMITIDAS - DOCUMENTOS TRIBUTARIOS ELECTRÓNICOS (DTE - SAT)';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 32;

    // 2. Metadatos de la consulta
    sheet.getCell('A3').value = 'Negocio / Emisor:';
    sheet.getCell('A3').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B3').value = negocioNombre;
    sheet.getCell('B3').font = { bold: true, size: 10 };

    sheet.getCell('D3').value = 'NIT Emisor:';
    sheet.getCell('D3').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E3').value = negocioNit;
    sheet.getCell('E3').font = { size: 10 };

    sheet.getCell('A4').value = 'Período Fiscal:';
    sheet.getCell('A4').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B4').value = periodoLabel;
    sheet.getCell('B4').font = { size: 10 };

    sheet.getCell('D4').value = 'Rango Fechas:';
    sheet.getCell('D4').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E4').value = rangoFechas || 'Todo el período';
    sheet.getCell('E4').font = { size: 10 };

    sheet.getCell('A5').value = 'Fecha de Exportación:';
    sheet.getCell('A5').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B5').value = new Date().toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
    sheet.getCell('B5').font = { size: 10 };

    sheet.getCell('D5').value = 'Criterio Búsqueda:';
    sheet.getCell('D5').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E5').value = filtroBusqueda ? `"${filtroBusqueda}"` : 'Todos los registros del rango';
    sheet.getCell('E5').font = { size: 10, italic: Boolean(filtroBusqueda) };

    // 3. Mini resumen de métricas
    const totalRegistros = facturas.length;
    const totalCertificadas = facturas.filter(f => f.estado === 'EMITIDA' || f.estado === 'CERTIFICADA').length;
    const totalAnuladas = facturas.filter(f => f.estado === 'ANULADA').length;
    const totalFacturadoCalculado = facturas
        .filter(f => f.estado !== 'ANULADA')
        .reduce((acc, f) => acc + (Number(f.total) || 0), 0);
    const totalImpuestosCalculado = facturas
        .filter(f => f.estado !== 'ANULADA')
        .reduce((acc, f) => acc + (Number(f.total_impuestos) || 0), 0);

    sheet.getCell('A7').value = 'Total Documentos:';
    sheet.getCell('A7').font = { bold: true, size: 10 };
    sheet.getCell('B7').value = totalRegistros;
    sheet.getCell('B7').font = { bold: true, size: 10 };

    sheet.getCell('C7').value = 'Certificadas:';
    sheet.getCell('C7').font = { bold: true, size: 10, color: { argb: 'FF15803D' } };
    sheet.getCell('D7').value = totalCertificadas;
    sheet.getCell('D7').font = { bold: true, size: 10, color: { argb: 'FF15803D' } };

    sheet.getCell('E7').value = 'Anuladas:';
    sheet.getCell('E7').font = { bold: true, size: 10, color: { argb: 'FFB91C1C' } };
    sheet.getCell('F7').value = totalAnuladas;
    sheet.getCell('F7').font = { bold: true, size: 10, color: { argb: 'FFB91C1C' } };

    sheet.getCell('H7').value = 'Total Facturado Neto:';
    sheet.getCell('H7').font = { bold: true, size: 10 };
    sheet.getCell('I7').value = totalFacturadoCalculado;
    sheet.getCell('I7').font = { bold: true, size: 10 };
    sheet.getCell('I7').numFmt = `"${monedaSimbolo}"#,##0.00`;

    sheet.getCell('K7').value = 'Impuestos Totales Netos:';
    sheet.getCell('K7').font = { bold: true, size: 10 };
    sheet.getCell('L7').value = totalImpuestosCalculado;
    sheet.getCell('L7').font = { bold: true, size: 10 };
    sheet.getCell('L7').numFmt = `"${monedaSimbolo}"#,##0.00`;

    // 4. Encabezados de la tabla (Fila 9)
    const headerRowIndex = 9;
    const headers = [
        'No.',
        'Fecha Emisión',
        'Tipo DTE',
        'Serie',
        'No. Factura',
        'Autorización DTE (UUID)',
        'NIT Receptor',
        'Nombre Receptor (Cliente)',
        'Régimen Emisor',
        `Subtotal (${monedaSimbolo})`,
        `IVA / Impuestos (${monedaSimbolo})`,
        `Total Facturado (${monedaSimbolo})`,
        'Estado SAT',
        'Fecha Certificación'
    ];

    const headerRow = sheet.getRow(headerRowIndex);
    headers.forEach((h, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = h;
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
            top: { style: 'medium', color: { argb: 'FF0F172A' } },
            bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
            left: { style: 'thin', color: { argb: 'FF334155' } },
            right: { style: 'thin', color: { argb: 'FF334155' } }
        };
    });
    headerRow.height = 28;

    // 5. Celdas de datos (A partir de fila 10)
    let currentRowIndex = 10;
    const currencyNumFmt = `"${monedaSimbolo}"#,##0.00;[Red]-"${monedaSimbolo}"#,##0.00;"${monedaSimbolo}"0.00`;

    facturas.forEach((factura, index) => {
        const row = sheet.getRow(currentRowIndex);
        const isEven = index % 2 === 1;
        const rowBgColor = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

        const esAnulada = factura.estado === 'ANULADA';
        const isPeq = factura.emisor_afiliacion_iva === 'PEQ' || factura.tipo_dte === 'FPEQ';
        const regimenTexto = isPeq ? 'Pequeño Contribuyente (5%)' : 'Régimen General (12%)';

        const fechaEmisionD = factura.fecha_emision ? new Date(factura.fecha_emision) : null;
        const fechaEmisionStr = fechaEmisionD
            ? fechaEmisionD.toLocaleString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            : '---';

        const fechaCertD = factura.fecha_certificacion ? new Date(factura.fecha_certificacion) : null;
        const fechaCertStr = fechaCertD
            ? fechaCertD.toLocaleString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            : '---';

        row.getCell(1).value = index + 1;
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

        row.getCell(2).value = fechaEmisionStr;
        row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

        row.getCell(3).value = factura.tipo_dte || (isPeq ? 'FPEQ' : 'FACT');
        row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

        row.getCell(4).value = factura.serie || '---';
        row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

        row.getCell(5).value = factura.numero_factura || '---';
        row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };

        row.getCell(6).value = factura.dte_uuid || 'Sin certificar';
        row.getCell(6).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(6).font = { name: 'Consolas', size: 9 };

        row.getCell(7).value = factura.receptor_nit || 'CF';
        row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };

        row.getCell(8).value = factura.receptor_nombre || 'CONSUMIDOR FINAL';
        row.getCell(8).alignment = { horizontal: 'left', vertical: 'middle' };

        row.getCell(9).value = regimenTexto;
        row.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };

        // Valores numéricos con formato
        const totalNum = Number(factura.total) || 0;
        const impuestosNum = Number(factura.total_impuestos) || 0;
        let subtotalNum = Number(factura.subtotal_sin_iva);
        if (isNaN(subtotalNum) || subtotalNum <= 0 || (subtotalNum === totalNum && impuestosNum > 0)) {
            subtotalNum = totalNum - impuestosNum;
        }

        row.getCell(10).value = subtotalNum;
        row.getCell(10).numFmt = currencyNumFmt;
        row.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };

        row.getCell(11).value = impuestosNum;
        row.getCell(11).numFmt = currencyNumFmt;
        row.getCell(11).alignment = { horizontal: 'right', vertical: 'middle' };

        row.getCell(12).value = totalNum;
        row.getCell(12).numFmt = currencyNumFmt;
        row.getCell(12).alignment = { horizontal: 'right', vertical: 'middle' };
        row.getCell(12).font = { bold: true };

        row.getCell(13).value = factura.estado;
        row.getCell(13).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(13).font = {
            bold: true,
            color: { argb: esAnulada ? 'FFB91C1C' : 'FF15803D' }
        };

        row.getCell(14).value = fechaCertStr;
        row.getCell(14).alignment = { horizontal: 'center', vertical: 'middle' };

        // Aplicar estilos y bordes a toda la fila
        for (let col = 1; col <= 14; col++) {
            const cell = row.getCell(col);
            cell.border = borderThin;
            if (!cell.fill || cell.fill.type !== 'pattern') {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };
            }
            if (esAnulada && col !== 13) {
                cell.font = { ...cell.font, color: { argb: 'FF94A3B8' } };
            }
        }

        row.height = 22;
        currentRowIndex++;
    });

    // 6. Fila de Totales Generales
    if (facturas.length > 0) {
        const totalRow = sheet.getRow(currentRowIndex);
        totalRow.height = 26;

        sheet.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
        const totalLabelCell = sheet.getCell(`A${currentRowIndex}`);
        totalLabelCell.value = 'TOTALES (SUMATORIA DEL PERÍODO):';
        totalLabelCell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
        totalLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };

        const firstDataRow = 10;
        const lastDataRow = currentRowIndex - 1;

        // Subtotal SUM
        const subtotalCell = totalRow.getCell(10);
        subtotalCell.value = { formula: `SUM(J${firstDataRow}:J${lastDataRow})` };
        subtotalCell.numFmt = currencyNumFmt;
        subtotalCell.font = { bold: true, size: 10 };
        subtotalCell.alignment = { horizontal: 'right', vertical: 'middle' };

        // IVA SUM
        const ivaCell = totalRow.getCell(11);
        ivaCell.value = { formula: `SUM(K${firstDataRow}:K${lastDataRow})` };
        ivaCell.numFmt = currencyNumFmt;
        ivaCell.font = { bold: true, size: 10 };
        ivaCell.alignment = { horizontal: 'right', vertical: 'middle' };

        // Total SUM
        const grandTotalCell = totalRow.getCell(12);
        grandTotalCell.value = { formula: `SUM(L${firstDataRow}:L${lastDataRow})` };
        grandTotalCell.numFmt = currencyNumFmt;
        grandTotalCell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
        grandTotalCell.alignment = { horizontal: 'right', vertical: 'middle' };

        // Aplicar relleno y bordes contables
        for (let col = 1; col <= 14; col++) {
            const cell = totalRow.getCell(col);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF0F172A' } },
                bottom: { style: 'double', color: { argb: 'FF0F172A' } },
                left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
            };
        }
    }

    // 7. Definir anchos de columna óptimos
    const columnWidths = [
        6,   // No.
        18,  // Fecha Emision
        12,  // Tipo DTE
        14,  // Serie
        14,  // No. Factura
        42,  // UUID
        16,  // NIT Receptor
        32,  // Nombre Receptor
        28,  // Régimen
        20,  // Subtotal
        20,  // IVA
        20,  // Total
        16,  // Estado SAT
        20   // Fecha Certificacion
    ];

    columnWidths.forEach((width, index) => {
        sheet.getColumn(index + 1).width = width;
    });

    return workbook;
};
