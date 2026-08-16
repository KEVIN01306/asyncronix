import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { getPdfStyles, PDF_COLORS } from '../../../../core/theme/pdfTheme';
import type { Cotizacion } from '../../domain/interfaces/cotizacion.interface';

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
    serviceIdText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: PDF_COLORS.error,
        textAlign: 'right',
        marginBottom: 10,
    },
    infoContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
    infoRow: { width: '100%', flexDirection: 'row', marginBottom: 5 },
    infoRowHalf: { width: '50%', flexDirection: 'row', marginBottom: 5 },
    label: { fontSize: 10, fontWeight: 'bold', color: PDF_COLORS.textPrimary },
    value: { fontSize: 10, color: PDF_COLORS.textSecondary, marginLeft: 4 },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: PDF_COLORS.border,
        marginBottom: 15,
        marginTop: 15,
    },
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
    totalContainer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: PDF_COLORS.textPrimary,
        marginRight: 10
    },
    totalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: PDF_COLORS.error
    }
});

interface CotizacionPdfProps {
    cotizacion: Cotizacion;
    user: any;
}

export const CotizacionPdf: React.FC<CotizacionPdfProps> = ({ cotizacion, user }) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const logoSrc = user?.negocio?.logo_url ? `${baseUrl}/${user.negocio.logo_url}` : '/icons/asyncronix_corto.png';

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const formatMoney = (amount?: number) => {
        if (amount == null) return 'Q 0.00';
        return `Q ${amount.toFixed(2)}`;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.headerGrid}>
                    <View style={styles.logoBox}>
                        <Image src={logoSrc} style={styles.logo} />
                    </View>
                    <View style={styles.titleBox}>
                        <Text style={styles.mainTitle}>{user?.negocio?.nombre_comercial || 'Asyncronix'}</Text>
                    </View>
                    <View style={styles.logoBoxEnd}>
                        <Image src={logoSrc} style={styles.logo} />
                    </View>
                </View>

                {/* ID COTIZACION */}
                <Text style={styles.serviceIdText}>Cotización {cotizacion.codigo}</Text>

                {/* INFO GENERAL */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Fecha de Emisión:</Text>
                        <Text style={styles.value}>{formatDate(cotizacion.fecha_emision)}</Text>
                    </View>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Fecha de Validez:</Text>
                        <Text style={styles.value}>{formatDate(cotizacion.fecha_validez)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Cliente:</Text>
                        <Text style={styles.value}>{cotizacion.cliente?.nombre || 'Consumidor Final'}</Text>
                    </View>
                    {cotizacion.cliente?.telefono && (
                        <View style={styles.infoRowHalf}>
                            <Text style={styles.label}>Teléfono:</Text>
                            <Text style={styles.value}>{cotizacion.cliente.telefono}</Text>
                        </View>
                    )}
                    {cotizacion.cliente?.email && (
                        <View style={styles.infoRowHalf}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{cotizacion.cliente.email}</Text>
                        </View>
                    )}
                    {cotizacion.vehiculo && (
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Vehículo:</Text>
                            <Text style={styles.value}>{cotizacion.vehiculo.placa}</Text>
                        </View>
                    )}
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Estado:</Text>
                        <Text style={styles.value}>{cotizacion.estado}</Text>
                    </View>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Destino:</Text>
                        <Text style={styles.value}>{cotizacion.tipo_destino.replace('_', ' ')}</Text>
                    </View>
                </View>

                {/* TERMINOS Y CONDICIONES (si aplica) */}
                {cotizacion.terminos && (
                    <View style={{ marginBottom: 15 }}>
                        <Text style={[styles.label, { marginBottom: 5 }]}>Términos y Condiciones:</Text>
                        <Text style={styles.value}>{cotizacion.terminos}</Text>
                    </View>
                )}

                <View style={styles.divider} />

                {/* TABLA DE DETALLES */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Cant.</Text>
                        <Text style={[styles.tableHeaderCell, { width: '45%' }]}>Descripción</Text>
                        <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>Precio Unit.</Text>
                        <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>Desc.</Text>
                        <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>Subtotal</Text>
                    </View>
                    {cotizacion.detalles && cotizacion.detalles.length > 0 ? (
                        cotizacion.detalles.map((row, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '10%' }]}>{row.cantidad}</Text>
                                <Text style={[styles.tableCell, { width: '45%' }]}>{row.descripcion || '-'}</Text>
                                <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{formatMoney(row.precio_unitario)}</Text>
                                <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{formatMoney(row.descuento)}</Text>
                                <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{formatMoney(row.subtotal)}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataCell}>No hay detalles en esta cotización.</Text>
                    )}
                </View>

                {/* TOTAL */}
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>TOTAL:</Text>
                    <Text style={styles.totalValue}>{formatMoney(cotizacion.total)}</Text>
                </View>

            </Page>
        </Document>
    );
};
