import * as ExcelJS from 'exceljs';
import type { ReporteFinanciero } from '../domain/reportes.model';

export interface ReporteFinancieroExcelOptions {
    reporte: ReporteFinanciero;
    monedaCodigo?: string;
    monedaSimbolo?: string;
    sucursalBase?: string;
    fecha?: string;
    negocioNombre?: string;
    negocioNit?: string;
}

export const generarReporteFinancieroExcel = async (
    reporteOrOptions: ReporteFinanciero | ReporteFinancieroExcelOptions,
    moneda: string = 'Q',
    sucursalBase: string = 'Todas las Sucursales',
    fecha: string = 'Histórico',
    negocioNombre: string = 'Asyncronix'
): Promise<ExcelJS.Workbook> => {
    // Soportar tanto formato de objeto como argumentos posicionales por compatibilidad
    let reporte: ReporteFinanciero;
    let monedaCodigo = 'GTQ';
    let monedaSimbolo = moneda || 'Q';
    let sucursal = sucursalBase;
    let rangoFechas = fecha;
    let empresaNombre = negocioNombre;
    let negocioNit = 'C/F';

    if ('reporte' in reporteOrOptions && (reporteOrOptions as ReporteFinancieroExcelOptions).reporte) {
        const opts = reporteOrOptions as ReporteFinancieroExcelOptions;
        reporte = opts.reporte;
        monedaCodigo = opts.monedaCodigo || 'GTQ';
        monedaSimbolo = opts.monedaSimbolo || (opts.monedaCodigo === 'USD' ? '$' : 'Q');
        sucursal = opts.sucursalBase || 'Todas las Sucursales';
        rangoFechas = opts.fecha || 'Histórico';
        empresaNombre = opts.negocioNombre || 'Asyncronix';
        negocioNit = opts.negocioNit || 'C/F';
    } else {
        reporte = reporteOrOptions as ReporteFinanciero;
        monedaCodigo = moneda === '$' ? 'USD' : 'GTQ';
        monedaSimbolo = moneda === 'USD' ? '$' : (moneda === 'GTQ' ? 'Q' : moneda);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Asyncronix SaaS';
    workbook.lastModifiedBy = 'Asyncronix SaaS';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Reporte Financiero', {
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
    titleCell.value = 'REPORTE FINANCIERO Y FLUJO DE CAJA CONSOLIDADO';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 32;

    // 2. METADATOS DE LA CONSULTA
    sheet.getCell('A3').value = 'Empresa / Negocio:';
    sheet.getCell('A3').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B3').value = empresaNombre;
    sheet.getCell('B3').font = { bold: true, size: 10 };

    sheet.getCell('D3').value = 'NIT:';
    sheet.getCell('D3').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E3').value = negocioNit;
    sheet.getCell('E3').font = { size: 10 };

    sheet.getCell('A4').value = 'Sucursal(es):';
    sheet.getCell('A4').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B4').value = sucursal;
    sheet.getCell('B4').font = { size: 10 };

    sheet.getCell('D4').value = 'Período / Rango:';
    sheet.getCell('D4').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E4').value = rangoFechas;
    sheet.getCell('E4').font = { size: 10 };

    sheet.getCell('A5').value = 'Fecha Exportación:';
    sheet.getCell('A5').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('B5').value = new Date().toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
    sheet.getCell('B5').font = { size: 10 };

    sheet.getCell('D5').value = 'Moneda Base:';
    sheet.getCell('D5').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    sheet.getCell('E5').value = `${monedaCodigo} (${monedaSimbolo})`;
    sheet.getCell('E5').font = { size: 10, bold: true };

    // 3. INDICADORES CLAVE (KPIS)
    sheet.getCell('A7').value = 'INDICADORES GENERALES (KPIS)';
    sheet.getCell('A7').font = { bold: true, size: 11, color: { argb: 'FF0F172A' } };

    const kpiCards = [
        { label: 'Ingresos Totales', val: Number(reporte.kpis?.total_ingresos || 0), isCurr: true, color: 'FF15803D' },
        { label: 'Egresos Totales', val: Number(reporte.kpis?.total_egresos || 0), isCurr: true, color: 'FFB91C1C' },
        { label: 'Flujo Neto', val: Number(reporte.kpis?.flujo_neto || 0), isCurr: true, color: 'FF0F172A' },
        { label: 'Transac. Ingresos', val: Number(reporte.kpis?.cantidad_ingresos || 0), isCurr: false, color: 'FF334155' },
        { label: 'Transac. Egresos', val: Number(reporte.kpis?.cantidad_egresos || 0), isCurr: false, color: 'FF334155' },
        { label: 'Total Movimientos', val: Number(reporte.kpis?.total_movimientos || 0), isCurr: false, color: 'FF334155' }
    ];

    const kpiRowLabels = sheet.getRow(8);
    const kpiRowValues = sheet.getRow(9);
    kpiRowLabels.height = 18;
    kpiRowValues.height = 24;

    kpiCards.forEach((kpi, idx) => {
        const colIdx = idx + 1;
        const lCell = kpiRowLabels.getCell(colIdx);
        lCell.value = kpi.label;
        lCell.font = { size: 9, bold: true, color: { argb: 'FF64748B' } };
        lCell.alignment = { horizontal: 'center', vertical: 'middle' };
        lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        lCell.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };

        const vCell = kpiRowValues.getCell(colIdx);
        vCell.value = kpi.val;
        vCell.font = { size: 11, bold: true, color: { argb: kpi.color } };
        vCell.alignment = { horizontal: 'center', vertical: 'middle' };
        vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        vCell.border = { bottom: { style: 'medium', color: { argb: 'FFCBD5E1' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
        if (kpi.isCurr) {
            vCell.numFmt = currencyNumFmt;
        } else {
            vCell.numFmt = '#,##0';
        }
    });

    let currentRow = 11;

    // Helper para formatear encabezados de sección
    const renderSectionHeader = (title: string, headers: string[]) => {
        const secLabel = sheet.getCell(`A${currentRow}`);
        secLabel.value = title;
        secLabel.font = { bold: true, size: 11, color: { argb: 'FF0F172A' } };
        sheet.getRow(currentRow).height = 22;
        currentRow++;

        const hRow = sheet.getRow(currentRow);
        hRow.height = 26;
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
        currentRow++;
    };

    // 4. TABLA: DISTRIBUCIÓN POR MÉTODO DE PAGO
    const metodos = reporte.distribucion?.por_metodo_pago || [];
    renderSectionHeader('1. INGRESOS POR MÉTODO DE PAGO', ['No.', 'Método de Pago', `Total Percibido (${monedaSimbolo})`, 'Participación (%)']);
    const startRowMetodos = currentRow;

    if (metodos.length === 0) {
        const emptyRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:D${currentRow}`);
        emptyRow.getCell(1).value = 'No se registraron cobros en el período.';
        emptyRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
        emptyRow.getCell(1).alignment = { horizontal: 'center' };
        currentRow++;
    } else {
        metodos.forEach((m, idx) => {
            const row = sheet.getRow(currentRow);
            const isEven = idx % 2 === 1;
            const bg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

            row.getCell(1).value = idx + 1;
            row.getCell(1).alignment = { horizontal: 'center' };

            row.getCell(2).value = m.metodo || 'Otro';
            row.getCell(2).alignment = { horizontal: 'left' };

            row.getCell(3).value = Number(m.total) || 0;
            row.getCell(3).numFmt = currencyNumFmt;
            row.getCell(3).alignment = { horizontal: 'right' };

            row.getCell(4).value = (Number(m.porcentaje) || 0) / 100;
            row.getCell(4).numFmt = '0.00%';
            row.getCell(4).alignment = { horizontal: 'right' };

            for (let c = 1; c <= 4; c++) {
                const cell = row.getCell(c);
                cell.border = borderThin;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
            }
            row.height = 20;
            currentRow++;
        });

        // Fila de Total
        const endRowMetodos = currentRow - 1;
        const totRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:B${currentRow}`);
        totRow.getCell(1).value = 'TOTAL MÉTODOS DE PAGO:';
        totRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
        totRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

        totRow.getCell(3).value = { formula: `SUM(C${startRowMetodos}:C${endRowMetodos})` };
        totRow.getCell(3).numFmt = currencyNumFmt;
        totRow.getCell(3).font = { bold: true, size: 10 };
        totRow.getCell(3).alignment = { horizontal: 'right' };

        totRow.getCell(4).value = { formula: `SUM(D${startRowMetodos}:D${endRowMetodos})` };
        totRow.getCell(4).numFmt = '0.00%';
        totRow.getCell(4).font = { bold: true, size: 10 };
        totRow.getCell(4).alignment = { horizontal: 'right' };

        for (let c = 1; c <= 4; c++) {
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

    currentRow += 2;

    // 5. TABLA: DISTRIBUCIÓN POR ORIGEN DE INGRESOS
    const origenes = reporte.distribucion?.por_origen || [];
    renderSectionHeader('2. INGRESOS POR ORIGEN DE FONDOS', ['No.', 'Origen / Fuente', `Total Percibido (${monedaSimbolo})`, 'Participación (%)']);
    const startRowOrigenes = currentRow;

    if (origenes.length === 0) {
        const emptyRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:D${currentRow}`);
        emptyRow.getCell(1).value = 'No se registraron ingresos con origen clasificado.';
        emptyRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
        emptyRow.getCell(1).alignment = { horizontal: 'center' };
        currentRow++;
    } else {
        origenes.forEach((o, idx) => {
            const row = sheet.getRow(currentRow);
            const isEven = idx % 2 === 1;
            const bg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

            row.getCell(1).value = idx + 1;
            row.getCell(1).alignment = { horizontal: 'center' };

            row.getCell(2).value = o.origen || 'General';
            row.getCell(2).alignment = { horizontal: 'left' };

            row.getCell(3).value = Number(o.total) || 0;
            row.getCell(3).numFmt = currencyNumFmt;
            row.getCell(3).alignment = { horizontal: 'right' };

            row.getCell(4).value = (Number(o.porcentaje) || 0) / 100;
            row.getCell(4).numFmt = '0.00%';
            row.getCell(4).alignment = { horizontal: 'right' };

            for (let c = 1; c <= 4; c++) {
                const cell = row.getCell(c);
                cell.border = borderThin;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
            }
            row.height = 20;
            currentRow++;
        });

        const endRowOrigenes = currentRow - 1;
        const totRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:B${currentRow}`);
        totRow.getCell(1).value = 'TOTAL INGRESOS POR ORIGEN:';
        totRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
        totRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

        totRow.getCell(3).value = { formula: `SUM(C${startRowOrigenes}:C${endRowOrigenes})` };
        totRow.getCell(3).numFmt = currencyNumFmt;
        totRow.getCell(3).font = { bold: true, size: 10 };
        totRow.getCell(3).alignment = { horizontal: 'right' };

        totRow.getCell(4).value = { formula: `SUM(D${startRowOrigenes}:D${endRowOrigenes})` };
        totRow.getCell(4).numFmt = '0.00%';
        totRow.getCell(4).font = { bold: true, size: 10 };
        totRow.getCell(4).alignment = { horizontal: 'right' };

        for (let c = 1; c <= 4; c++) {
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

    currentRow += 2;

    // 6. TABLA: SALDOS EN CAJAS
    const cajas = reporte.distribucion?.entidades?.cajas || [];
    renderSectionHeader('3. SALDOS DISPONIBLES EN CAJAS FÍSICAS', ['No.', 'Nombre de la Caja', `Saldo Actual (${monedaSimbolo})`]);
    const startRowCajas = currentRow;

    if (cajas.length === 0) {
        const emptyRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:C${currentRow}`);
        emptyRow.getCell(1).value = 'No hay cajas activas registradas.';
        emptyRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
        emptyRow.getCell(1).alignment = { horizontal: 'center' };
        currentRow++;
    } else {
        cajas.forEach((c, idx) => {
            const row = sheet.getRow(currentRow);
            const isEven = idx % 2 === 1;
            const bg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

            row.getCell(1).value = idx + 1;
            row.getCell(1).alignment = { horizontal: 'center' };

            row.getCell(2).value = c.nombre;
            row.getCell(2).alignment = { horizontal: 'left' };

            row.getCell(3).value = Number(c.saldo) || 0;
            row.getCell(3).numFmt = currencyNumFmt;
            row.getCell(3).alignment = { horizontal: 'right' };

            for (let col = 1; col <= 3; col++) {
                const cell = row.getCell(col);
                cell.border = borderThin;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
            }
            row.height = 20;
            currentRow++;
        });

        const endRowCajas = currentRow - 1;
        const totRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:B${currentRow}`);
        totRow.getCell(1).value = 'TOTAL DISPONIBLE EN CAJAS:';
        totRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
        totRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

        totRow.getCell(3).value = { formula: `SUM(C${startRowCajas}:C${endRowCajas})` };
        totRow.getCell(3).numFmt = currencyNumFmt;
        totRow.getCell(3).font = { bold: true, size: 10 };
        totRow.getCell(3).alignment = { horizontal: 'right' };

        for (let col = 1; col <= 3; col++) {
            const cell = totRow.getCell(col);
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

    currentRow += 2;

    // 7. TABLA: SALDOS EN CUENTAS BANCARIAS
    const cuentas = reporte.distribucion?.entidades?.cuentas || [];
    renderSectionHeader('4. SALDOS EN CUENTAS BANCARIAS', [
        'No.',
        'Banco / Entidad',
        'Número de Cuenta',
        'Moneda',
        'Saldo Moneda Original',
        `Saldo en Moneda Base (${monedaSimbolo})`
    ]);
    const startRowCuentas = currentRow;

    if (cuentas.length === 0) {
        const emptyRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:F${currentRow}`);
        emptyRow.getCell(1).value = 'No hay cuentas bancarias activas registradas.';
        emptyRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
        emptyRow.getCell(1).alignment = { horizontal: 'center' };
        currentRow++;
    } else {
        cuentas.forEach((c, idx) => {
            const row = sheet.getRow(currentRow);
            const isEven = idx % 2 === 1;
            const bg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

            row.getCell(1).value = idx + 1;
            row.getCell(1).alignment = { horizontal: 'center' };

            row.getCell(2).value = c.banco;
            row.getCell(2).alignment = { horizontal: 'left' };

            row.getCell(3).value = c.numero_cuenta;
            row.getCell(3).alignment = { horizontal: 'center' };

            row.getCell(4).value = c.moneda_codigo;
            row.getCell(4).alignment = { horizontal: 'center' };

            row.getCell(5).value = Number(c.saldo_original) || 0;
            row.getCell(5).numFmt = `#,##0.00;[Red]-#,##0.00;0.00`;
            row.getCell(5).alignment = { horizontal: 'right' };

            row.getCell(6).value = Number(c.saldo) || 0;
            row.getCell(6).numFmt = currencyNumFmt;
            row.getCell(6).alignment = { horizontal: 'right' };

            for (let col = 1; col <= 6; col++) {
                const cell = row.getCell(col);
                cell.border = borderThin;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
            }
            row.height = 20;
            currentRow++;
        });

        const endRowCuentas = currentRow - 1;
        const totRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:E${currentRow}`);
        totRow.getCell(1).value = 'TOTAL DISPONIBLE EN BANCOS (MONEDA BASE):';
        totRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
        totRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

        totRow.getCell(6).value = { formula: `SUM(F${startRowCuentas}:F${endRowCuentas})` };
        totRow.getCell(6).numFmt = currencyNumFmt;
        totRow.getCell(6).font = { bold: true, size: 10 };
        totRow.getCell(6).alignment = { horizontal: 'right' };

        for (let col = 1; col <= 6; col++) {
            const cell = totRow.getCell(col);
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

    currentRow += 2;

    // 8. AUDITORÍA Y CONCILIACIÓN FINANCIERA (si existe)
    if (reporte.conciliacion) {
        renderSectionHeader('5. CONCILIACIÓN FINANCIERA (SALDOS VS FLUJO DE MOVIMIENTOS)', [
            'Concepto de Conciliación',
            `Monto (${monedaSimbolo})`,
            'Estado del Cuadre'
        ]);

        const concRows = [
            { label: 'Saldo Esperado (Flujo acumulado de ingresos y egresos)', val: Number(reporte.conciliacion.saldo_esperado) || 0, estado: '-' },
            { label: 'Saldo Real (Total verificado en cajas físicas y bancos)', val: Number(reporte.conciliacion.saldo_actual) || 0, estado: '-' },
            { 
                label: 'Diferencia / Ajuste de Conciliación', 
                val: Number(reporte.conciliacion.diferencia) || 0, 
                estado: Math.abs(Number(reporte.conciliacion.diferencia) || 0) < 0.01 ? 'BALANCEADO' : 'DESCUADRE' 
            }
        ];

        concRows.forEach((cr, idx) => {
            const row = sheet.getRow(currentRow);
            const isDiff = idx === 2;
            const bg = isDiff ? 'FFF1F5F9' : (idx % 2 === 1 ? 'FFF8FAFC' : 'FFFFFFFF');

            row.getCell(1).value = cr.label;
            row.getCell(1).font = { bold: isDiff, size: 9.5 };
            row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

            row.getCell(2).value = cr.val;
            row.getCell(2).numFmt = currencyNumFmt;
            row.getCell(2).font = { bold: isDiff, size: 10, color: { argb: isDiff && cr.val !== 0 ? 'FFB91C1C' : 'FF0F172A' } };
            row.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };

            row.getCell(3).value = cr.estado;
            row.getCell(3).font = { bold: true, size: 9.5, color: { argb: cr.estado === 'BALANCEADO' ? 'FF15803D' : (cr.estado === 'DESCUADRE' ? 'FFB91C1C' : 'FF64748B') } };
            row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

            for (let c = 1; c <= 3; c++) {
                const cell = row.getCell(c);
                cell.border = isDiff ? {
                    top: { style: 'thin', color: { argb: 'FF0F172A' } },
                    bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                } : borderThin;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
            }
            row.height = 22;
            currentRow++;
        });
    }

    // 9. AJUSTE DE ANCHOS DE COLUMNAS
    sheet.columns.forEach((col, idx) => {
        let maxLength = 12;
        col.eachCell?.({ includeEmpty: false }, (cell) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength && val.length < 50) {
                maxLength = val.length;
            }
        });
        col.width = Math.max(maxLength + 3, idx === 0 ? 8 : (idx === 1 ? 28 : (idx === 5 ? 24 : 16)));
    });

    return workbook;
};
