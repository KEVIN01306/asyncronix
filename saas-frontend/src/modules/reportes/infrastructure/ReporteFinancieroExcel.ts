import * as ExcelJS from 'exceljs';
import type { ReporteFinanciero } from '../domain/reportes.model';

export const generarReporteFinancieroExcel = async (reporte: ReporteFinanciero, moneda: string, sucursalBase: string, fecha: string): Promise<ExcelJS.Workbook> => {
    const workbook = new ExcelJS.Workbook();
    
    // Título y Configuración
    workbook.creator = 'Asyncronix';
    workbook.lastModifiedBy = 'Asyncronix';
    workbook.created = new Date();
    
    const sheet = workbook.addWorksheet('Reporte Financiero');

    // 1. Título
    sheet.mergeCells('A1:D1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Reporte Financiero - ${sucursalBase} - ${fecha}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // 2. KPIs
    sheet.addRow([]);
    sheet.addRow(['KPIs Generales']).font = { bold: true, size: 12 };
    
    sheet.addRow(['Total Ingresos', reporte.kpis.total_ingresos, moneda]);
    sheet.addRow(['Total Egresos', reporte.kpis.total_egresos, moneda]);
    sheet.addRow(['Flujo Neto', reporte.kpis.flujo_neto, moneda]);
    sheet.addRow(['Cantidad de Ingresos', reporte.kpis.cantidad_ingresos]);
    sheet.addRow(['Cantidad de Egresos', reporte.kpis.cantidad_egresos]);
    sheet.addRow(['Total Movimientos', reporte.kpis.total_movimientos]);

    // 3. Distribución por Método de Pago
    sheet.addRow([]);
    sheet.addRow(['Distribución por Método de Pago']).font = { bold: true, size: 12 };
    sheet.addRow(['Método', 'Total', 'Moneda', 'Porcentaje']).font = { bold: true };
    reporte.distribucion.por_metodo_pago.forEach(m => {
        sheet.addRow([m.metodo, m.total, moneda, `${m.porcentaje.toFixed(2)}%`]);
    });

    // 4. Distribución por Origen
    sheet.addRow([]);
    sheet.addRow(['Distribución por Origen']).font = { bold: true, size: 12 };
    sheet.addRow(['Origen', 'Total', 'Moneda', 'Porcentaje']).font = { bold: true };
    reporte.distribucion.por_origen.forEach(o => {
        sheet.addRow([o.origen, o.total, moneda, `${o.porcentaje.toFixed(2)}%`]);
    });

    // 5. Cajas
    sheet.addRow([]);
    sheet.addRow(['Saldos en Cajas']).font = { bold: true, size: 12 };
    sheet.addRow(['Nombre de Caja', 'Saldo', 'Moneda']).font = { bold: true };
    reporte.distribucion.entidades.cajas.forEach(c => {
        sheet.addRow([c.nombre, c.saldo, moneda]);
    });

    // 6. Cuentas Bancarias
    sheet.addRow([]);
    sheet.addRow(['Saldos en Cuentas Bancarias']).font = { bold: true, size: 12 };
    sheet.addRow(['Banco', 'Número de Cuenta', 'Moneda Cuenta', 'Saldo', 'Saldo Original']).font = { bold: true };
    reporte.distribucion.entidades.cuentas.forEach(c => {
        sheet.addRow([c.banco, c.numero_cuenta, c.moneda_codigo, c.saldo, c.saldo_original]);
    });

    // Ajuste de columnas
    sheet.columns.forEach((column) => {
        column.width = 25;
    });

    return workbook;
};
