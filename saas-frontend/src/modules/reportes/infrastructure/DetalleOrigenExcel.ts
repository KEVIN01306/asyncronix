import * as ExcelJS from 'exceljs';
import type { DetalleOrigenReporte } from '../domain/reportes.model';

export interface DetalleOrigenExcelOptions {
    reporte: DetalleOrigenReporte;
    monedaCodigo?: string;
    monedaSimbolo?: string;
    origen?: string;
    sucursalBase?: string;
    fecha?: string;
    negocioNombre?: string;
    negocioNit?: string;
}

export const generarDetalleOrigenExcel = async (
    reporteOrOptions: DetalleOrigenReporte | DetalleOrigenExcelOptions,
    moneda: string = 'Q',
    origen: string = 'Ingresos',
    sucursalBase: string = 'Sucursal',
    fecha: string = 'Histórico',
    negocioNombre: string = 'Asyncronix'
): Promise<ExcelJS.Workbook> => {
    let reporte: DetalleOrigenReporte;
    let monedaCodigo = 'GTQ';
    let monedaSimbolo = moneda || 'Q';
    let origenNombre = origen;
    let sucursal = sucursalBase;
    let rangoFechas = fecha;
    let empresaNombre = negocioNombre;
    let negocioNit = 'C/F';

    if ('reporte' in reporteOrOptions && (reporteOrOptions as DetalleOrigenExcelOptions).reporte) {
        const opts = reporteOrOptions as DetalleOrigenExcelOptions;
        reporte = opts.reporte;
        monedaCodigo = opts.monedaCodigo || 'GTQ';
        monedaSimbolo = opts.monedaSimbolo || (opts.monedaCodigo === 'USD' ? '$' : 'Q');
        origenNombre = opts.origen || reporte.origen || 'Ingresos';
        sucursal = opts.sucursalBase || 'Sucursal';
        rangoFechas = opts.fecha || 'Histórico';
        empresaNombre = opts.negocioNombre || 'Asyncronix';
        negocioNit = opts.negocioNit || 'C/F';
    } else {
        reporte = reporteOrOptions as DetalleOrigenReporte;
        origenNombre = origen || reporte.origen;
        monedaCodigo = moneda === '$' ? 'USD' : 'GTQ';
        monedaSimbolo = moneda === 'USD' ? '$' : (moneda === 'GTQ' ? 'Q' : moneda);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Asyncronix SaaS';
    workbook.lastModifiedBy = 'Asyncronix SaaS';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`Detalle ${origenNombre}`.slice(0, 31), {
        views: [{ showGridLines: true }]
    });

    const borderThin: Partial<ExcelJS.Borders> = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };

    const currencyNumFmt = `"${monedaSimbolo}"#,##0.00;[Red]-"${monedaSimbolo}"#,##0.00;"${monedaSimbolo}"0.00`;

    // 1. TÍTULO PRINCIPAL (BANNER)
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `DETALLE DE INGRESOS POR ORIGEN: ${origenNombre.toUpperCase()}`;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 32;

    // 2. METADATOS
    sheet.getCell('A3').value = 'Empresa / Negocio:';
    sheet.getCell('A3').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B3').value = empresaNombre;
    sheet.getCell('B3').font = { bold: true, size: 10 };

    sheet.getCell('D3').value = 'NIT:';
    sheet.getCell('D3').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E3').value = negocioNit;
    sheet.getCell('E3').font = { size: 10 };

    sheet.getCell('A4').value = 'Origen Evaluado:';
    sheet.getCell('A4').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B4').value = origenNombre;
    sheet.getCell('B4').font = { size: 10, bold: true };

    sheet.getCell('D4').value = 'Moneda:';
    sheet.getCell('D4').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E4').value = `${monedaCodigo} (${monedaSimbolo})`;
    sheet.getCell('E4').font = { size: 10 };

    sheet.getCell('A5').value = 'Sucursal(es):';
    sheet.getCell('A5').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B5').value = sucursal;
    sheet.getCell('B5').font = { size: 10 };

    sheet.getCell('D5').value = 'Período / Rango:';
    sheet.getCell('D5').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E5').value = rangoFechas;
    sheet.getCell('E5').font = { size: 10 };

    sheet.getCell('A6').value = 'Fecha Exportación:';
    sheet.getCell('A6').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B6').value = new Date().toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
    sheet.getCell('B6').font = { size: 10 };

    sheet.getCell('D6').value = 'Total Percibido:';
    sheet.getCell('D6').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E6').value = Number(reporte.total_ingresos) || 0;
    sheet.getCell('E6').font = { size: 11, bold: true, color: { argb: 'FF15803D' } };
    sheet.getCell('E6').numFmt = currencyNumFmt;

    // 3. TABLA DE DISTRIBUCIÓN
    const headerRowIndex = 8;
    const headers = [
        'No.',
        'Tipo de Entidad',
        'Nombre de Caja / Cuenta',
        'Método de Pago',
        `Monto Percibido (${monedaSimbolo})`,
        'Participación (%)'
    ];

    const hRow = sheet.getRow(headerRowIndex);
    hRow.height = 28;
    headers.forEach((h, idx) => {
        const cell = hRow.getCell(idx + 1);
        cell.value = h;
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'medium', color: { argb: 'FF0F172A' } },
            bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
            left: { style: 'thin', color: { argb: 'FF334155' } },
            right: { style: 'thin', color: { argb: 'FF334155' } }
        };
    });

    let currentRow = 9;
    const startDataRow = currentRow;
    const agrupaciones = reporte.agrupaciones || [];

    if (agrupaciones.length === 0) {
        const emptyRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:F${currentRow}`);
        emptyRow.getCell(1).value = 'No hay movimientos registrados para este origen.';
        emptyRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
        emptyRow.getCell(1).alignment = { horizontal: 'center' };
        currentRow++;
    } else {
        agrupaciones.forEach((a, idx) => {
            const row = sheet.getRow(currentRow);
            const isEven = idx % 2 === 1;
            const bg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';
            const tipoEntidad = a.entidad_tipo === 'CAJA' ? 'Caja Física' : 'Cuenta Bancaria';

            row.getCell(1).value = idx + 1;
            row.getCell(1).alignment = { horizontal: 'center' };

            row.getCell(2).value = tipoEntidad;
            row.getCell(2).alignment = { horizontal: 'center' };

            row.getCell(3).value = a.entidad_nombre || '---';
            row.getCell(3).alignment = { horizontal: 'left' };

            row.getCell(4).value = a.metodo_pago || '---';
            row.getCell(4).alignment = { horizontal: 'center' };

            row.getCell(5).value = Number(a.total) || 0;
            row.getCell(5).numFmt = currencyNumFmt;
            row.getCell(5).alignment = { horizontal: 'right' };

            row.getCell(6).value = (Number(a.porcentaje) || 0) / 100;
            row.getCell(6).numFmt = '0.00%';
            row.getCell(6).alignment = { horizontal: 'right' };

            for (let c = 1; c <= 6; c++) {
                const cell = row.getCell(c);
                cell.border = borderThin;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
            }
            row.height = 20;
            currentRow++;
        });

        // Fila de Total
        const endDataRow = currentRow - 1;
        const totRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:D${currentRow}`);
        totRow.getCell(1).value = 'TOTAL PERCIBIDO POR EL ORIGEN:';
        totRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
        totRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

        totRow.getCell(5).value = { formula: `SUM(E${startDataRow}:E${endDataRow})` };
        totRow.getCell(5).numFmt = currencyNumFmt;
        totRow.getCell(5).font = { bold: true, size: 10 };
        totRow.getCell(5).alignment = { horizontal: 'right' };

        totRow.getCell(6).value = { formula: `SUM(F${startDataRow}:F${endDataRow})` };
        totRow.getCell(6).numFmt = '0.00%';
        totRow.getCell(6).font = { bold: true, size: 10 };
        totRow.getCell(6).alignment = { horizontal: 'right' };

        for (let c = 1; c <= 6; c++) {
            const cell = totRow.getCell(c);
            cell.border = {
                top: { style: 'medium', color: { argb: 'FF0F172A' } },
                bottom: { style: 'double', color: { argb: 'FF0F172A' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        }
        totRow.height = 24;
        currentRow++;
    }

    // Auto-width
    sheet.columns.forEach((col, idx) => {
        let maxLength = 12;
        col.eachCell?.({ includeEmpty: false }, (cell) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength && val.length < 50) {
                maxLength = val.length;
            }
        });
        col.width = Math.max(maxLength + 3, idx === 0 ? 8 : (idx === 2 ? 26 : 18));
    });

    return workbook;
};
