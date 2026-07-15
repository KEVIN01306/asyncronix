import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { getPdfStyles, PDF_COLORS } from '../../../core/theme/pdfTheme.js';
import type { ReporteFinanciero } from '../domain/reportes.model.js';
import { formatMoney } from '../../../core/utils/formatMoney.js';

const baseStyles = getPdfStyles();

const styles = StyleSheet.create({
    ...baseStyles,
    headerGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoBox: { width: '25%', alignItems: 'flex-start' },
    logoBoxEnd: { width: '25%', alignItems: 'flex-end' },
    logo: { height: 70, width: 70, objectFit: 'contain' },
    titleBox: { width: '50%', alignItems: 'center' },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: PDF_COLORS.primary,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: PDF_COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    infoContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
    infoRowHalf: { width: '50%', flexDirection: 'row', marginBottom: 5 },
    label: { fontSize: 10, fontWeight: 'bold', color: PDF_COLORS.textPrimary },
    value: { fontSize: 10, color: PDF_COLORS.textSecondary, marginLeft: 4 },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: PDF_COLORS.border,
        marginBottom: 15,
        marginTop: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: PDF_COLORS.primary,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 10,
    },

    // KPI Grid
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    kpiCard: {
        width: '31%',
        borderWidth: 1,
        borderColor: PDF_COLORS.border,
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
        backgroundColor: PDF_COLORS.card,
    },
    kpiTitle: {
        fontSize: 9,
        color: PDF_COLORS.textSecondary,
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    kpiValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: PDF_COLORS.primary,
    },

    // Tables
    tableContainer: {
        borderWidth: 1,
        borderColor: PDF_COLORS.border,
        borderRadius: 2,
        backgroundColor: PDF_COLORS.card,
        overflow: 'hidden',
        marginBottom: 15,
    },
    tableHeader: { flexDirection: 'row', backgroundColor: PDF_COLORS.primary, padding: 6 },
    tableHeaderCell: { color: '#ffffff', fontSize: 9, fontWeight: 'bold' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: PDF_COLORS.border, padding: 6 },
    tableCell: { fontSize: 9, color: PDF_COLORS.textPrimary },
    noDataCell: { padding: 12, textAlign: 'center', fontSize: 9, fontStyle: 'italic', color: PDF_COLORS.textSecondary },

    flexRowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    halfTableWrapper: { width: '48%' },
});

interface ReporteFinancieroPdfProps {
    reporte: ReporteFinanciero;
    user: any;
    sucursalesSeleccionadas: string[];
    todasLasSucursales: any[];
}

export const ReporteFinancieroPdf: React.FC<ReporteFinancieroPdfProps> = ({
    reporte,
    user,
    sucursalesSeleccionadas,
    todasLasSucursales
}) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const logoSrc = user?.negocio?.logo_url ? `${baseUrl}/${user.negocio.logo_url}` : '/icons/asyncronix_corto.png';
    const negocioBaseCurrency = user?.negocio?.moneda?.codigo || 'USD';

    let sucursalInfo = 'Todas las sucursales';
    if (sucursalesSeleccionadas.length === 1) {
        const suc = todasLasSucursales.find(s => s.id === sucursalesSeleccionadas[0]);
        sucursalInfo = suc ? suc.nombre : '1 Sucursal';
    } else if (sucursalesSeleccionadas.length > 1) {
        sucursalInfo = 'Multi Sucursal';
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ENCABEZADO */}
                <View style={styles.headerGrid}>
                    <View style={styles.logoBox}><Image src={logoSrc} style={styles.logo} /></View>
                    <View style={styles.titleBox}>
                        <Text style={styles.mainTitle}>{user?.negocio?.nombre_comercial || 'Asyncronix'}</Text>
                        <Text style={styles.subTitle}>Reporte Financiero</Text>
                    </View>
                    <View style={styles.logoBoxEnd} />
                </View>

                {/* INFO GENERAL */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Fecha de Generación:</Text>
                        <Text style={styles.value}>{new Date().toLocaleString()}</Text>
                    </View>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Sucursales:</Text>
                        <Text style={styles.value}>{sucursalInfo}</Text>
                    </View>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Moneda Base:</Text>
                        <Text style={styles.value}>{negocioBaseCurrency}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* KPIs GENERALES */}
                <Text style={styles.sectionTitle}>Indicadores Clave</Text>
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Total Ingresos</Text>
                        <Text style={[styles.kpiValue, { color: PDF_COLORS.success }]}>{formatMoney(reporte.kpis.total_ingresos)}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Total Egresos</Text>
                        <Text style={[styles.kpiValue, { color: PDF_COLORS.error }]}>{formatMoney(reporte.kpis.total_egresos)}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Flujo Neto</Text>
                        <Text style={[styles.kpiValue, { color: reporte.kpis.flujo_neto >= 0 ? PDF_COLORS.success : PDF_COLORS.error }]}>
                            {formatMoney(reporte.kpis.flujo_neto)}
                        </Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Cant. Ingresos</Text>
                        <Text style={styles.kpiValue}>{reporte.kpis.cantidad_ingresos}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Cant. Egresos</Text>
                        <Text style={styles.kpiValue}>{reporte.kpis.cantidad_egresos}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Total Movimientos</Text>
                        <Text style={styles.kpiValue}>{reporte.kpis.total_movimientos}</Text>
                    </View>
                </View>

                {/* DISTRIBUCIÓN */}
                <View style={styles.flexRowBetween}>
                    <View style={styles.halfTableWrapper}>
                        <Text style={styles.sectionTitle}>Por Método de Pago</Text>
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '50%' }]}>Método</Text>
                                <Text style={[styles.tableHeaderCell, { width: '50%', textAlign: 'right' }]}>Total</Text>
                            </View>
                            {reporte.distribucion.por_metodo_pago.length > 0 ? (
                                reporte.distribucion.por_metodo_pago.map((item, idx) => (
                                    <View key={idx} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { width: '50%' }]}>{item.metodo}</Text>
                                        <Text style={[styles.tableCell, { width: '50%', textAlign: 'right' }]}>{formatMoney(item.total)}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noDataCell}>No hay datos</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.halfTableWrapper}>
                        <Text style={styles.sectionTitle}>Por Origen</Text>
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '50%' }]}>Origen</Text>
                                <Text style={[styles.tableHeaderCell, { width: '50%', textAlign: 'right' }]}>Total</Text>
                            </View>
                            {reporte.distribucion.por_origen.length > 0 ? (
                                reporte.distribucion.por_origen.map((item, idx) => (
                                    <View key={idx} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { width: '50%' }]}>{item.origen}</Text>
                                        <Text style={[styles.tableCell, { width: '50%', textAlign: 'right' }]}>{formatMoney(item.total)}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noDataCell}>No hay datos</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* CONCILIACIÓN */}
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Saldos Actuales</Text>

                {reporte.distribucion.entidades.cajas.length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                        <Text style={[styles.kpiTitle, { marginBottom: 5 }]}>Cajas de Efectivo</Text>
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '60%' }]}>Caja</Text>
                                <Text style={[styles.tableHeaderCell, { width: '40%', textAlign: 'right' }]}>Saldo</Text>
                            </View>
                            {reporte.distribucion.entidades.cajas.map((item, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { width: '60%' }]}>{item.nombre}</Text>
                                    <Text style={[styles.tableCell, { width: '40%', textAlign: 'right' }]}>{formatMoney(item.saldo)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {reporte.distribucion.entidades.cuentas.length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                        <Text style={[styles.kpiTitle, { marginBottom: 5 }]}>Cuentas Bancarias</Text>
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Banco / Cuenta</Text>
                                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Moneda</Text>
                                <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Saldo Original</Text>
                                <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Saldo en Base</Text>
                            </View>
                            {reporte.distribucion.entidades.cuentas.map((item, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { width: '40%' }]}>{item.banco} - {item.numero_cuenta}</Text>
                                    <Text style={[styles.tableCell, { width: '20%' }]}>{item.moneda_codigo}</Text>
                                    <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>{formatMoney(item.saldo_original, item.moneda_codigo)}</Text>
                                    <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>{formatMoney(item.saldo)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* RESUMEN FINAL CONCILIACIÓN */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                    <View style={{ width: '50%', backgroundColor: PDF_COLORS.card, padding: 10, borderRadius: 4, borderWidth: 1, borderColor: PDF_COLORS.border }}>
                        <View style={styles.flexRowBetween}>
                            <Text style={styles.kpiTitle}>Saldo Esperado:</Text>
                            <Text style={styles.tableCell}>{formatMoney(reporte.conciliacion.saldo_esperado)}</Text>
                        </View>
                        <View style={[styles.flexRowBetween, { marginTop: 5 }]}>
                            <Text style={styles.kpiTitle}>Saldo Actual (Real):</Text>
                            <Text style={[styles.tableCell, { fontWeight: 'bold', color: PDF_COLORS.primary }]}>{formatMoney(reporte.conciliacion.saldo_actual)}</Text>
                        </View>
                        <View style={[styles.flexRowBetween, { marginTop: 5 }]}>
                            <Text style={styles.kpiTitle}>Diferencia:</Text>
                            <Text style={[styles.tableCell, { color: reporte.conciliacion.diferencia < 0 ? PDF_COLORS.error : PDF_COLORS.success }]}>
                                {formatMoney(reporte.conciliacion.diferencia)}
                            </Text>
                        </View>
                    </View>
                </View>

            </Page>
        </Document>
    );
};
