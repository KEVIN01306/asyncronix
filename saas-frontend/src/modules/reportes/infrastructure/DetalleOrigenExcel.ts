import * as ExcelJS from 'exceljs';
import type { DetalleOrigenReporte } from '../domain/reportes.model';

export const generarDetalleOrigenExcel = async (reporte: DetalleOrigenReporte, moneda: string, origen: string, sucursalBase: string, fecha: string): Promise<ExcelJS.Workbook> => {
    const workbook = new ExcelJS.Workbook();
    
    // Título y Configuración
    workbook.creator = 'Asyncronix';
    workbook.lastModifiedBy = 'Asyncronix';
    workbook.created = new Date();
    
    const sheet = workbook.addWorksheet(`Detalle ${origen}`);

    // 1. Título
    sheet.mergeCells('A1:D1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Detalle de Origen (${origen}) - ${sucursalBase} - ${fecha}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // 2. Resumen
    sheet.addRow([]);
    sheet.addRow(['Total Percibido', reporte.total_ingresos, moneda]).font = { bold: true };

    // 3. Detalle
    sheet.addRow([]);
    sheet.addRow(['Distribución por Cajas y Cuentas']).font = { bold: true, size: 12 };
    sheet.addRow(['Tipo Entidad', 'Nombre', 'Método de Pago', 'Total', 'Moneda', 'Porcentaje']).font = { bold: true };

    reporte.agrupaciones.forEach(a => {
        const tipoEntidad = a.entidad_tipo === 'CAJA' ? 'Caja' : 'Cuenta Bancaria';
        sheet.addRow([tipoEntidad, a.entidad_nombre, a.metodo_pago, a.total, moneda, `${a.porcentaje.toFixed(2)}%`]);
    });

    // Ajuste de columnas
    sheet.columns.forEach((column) => {
        column.width = 25;
    });

    return workbook;
};
