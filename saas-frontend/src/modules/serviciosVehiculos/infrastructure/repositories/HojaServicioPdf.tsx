import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { getPdfStyles, PDF_COLORS } from '../../../../core/theme/pdfTheme';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';

const getAbsoluteUrl = (url: string | undefined | null, fallback = ''): string => {
    if (!url) {
        if (!fallback) return '';
        return fallback.startsWith('http') ? fallback : `${window.location.origin}${fallback.startsWith('/') ? '' : '/'}${fallback}`;
    }
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

// 1. Instanciamos los estilos base estáticos
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
    tableSectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: PDF_COLORS.primary,
        textTransform: 'uppercase',
        marginBottom: 6,
        marginTop: 10,
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
    flexRowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    halfTableWrapper: { width: '48%' },
    signaturesContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 25 },
    signatureBox: { alignItems: 'center', width: '40%' },
    signatureImgBox: {
        height: 70,
        width: 140,
        borderWidth: 1,
        borderColor: PDF_COLORS.border,
        borderStyle: 'dashed',
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        backgroundColor: PDF_COLORS.card,
    },
    signatureImg: { height: '100%', width: '100%', objectFit: 'contain' },
    signaturePlaceholder: { fontSize: 16, color: '#ccc' },
    signatureLabel: { fontSize: 9, textAlign: 'center', color: PDF_COLORS.textSecondary },
});

interface HojaServicioPdfProps {
    servicio: ServicioVehiculo;
    user: any;
}

export const HojaServicioPdf: React.FC<HojaServicioPdfProps> = ({ servicio, user }) => {
    const logoSrc = { uri: getAbsoluteUrl(user?.negocio?.logo_url, '/icons/asyncronix_corto.png'), method: 'GET', headers: { 'Cache-Control': 'no-cache' } };
    console.log('Generando PDF para servicio:', servicio, logoSrc);
    const tareasNormales = (servicio.tareas || []).filter((tarea) => !tarea.extra);
    const tareasExtras = (servicio.tareas || []).filter((tarea) => tarea.extra);

    const getStatusStyle = (estado: string) => {
        const est = estado?.toLowerCase();
        if (est?.includes('buen') || est?.includes('ok') || est?.includes('completado')) return styles.statusSuccess;
        if (est?.includes('mal') || est?.includes('urgente') || est?.includes('pendiente')) return styles.statusError;
        if (est?.includes('regular') || est?.includes('espera')) return styles.statusWarning;
        return {};
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* GRID DE ENCABEZADO */}
                <View style={styles.headerGrid}>
                    <View style={styles.logoBox}><Image src={logoSrc} style={styles.logo} /></View>
                    <View style={styles.titleBox}><Text style={styles.mainTitle}>{user?.negocio?.nombre_comercial || 'Asyncronix'}</Text></View>
                    <View style={styles.logoBoxEnd}><Image src={logoSrc} style={styles.logo} /></View>
                </View>

                {/* ID DEL SERVICIO */}
                <Text style={styles.serviceIdText}>Servicio #{servicio.id.slice(0, 8)}</Text>

                {/* BLOQUE DE INFORMACIÓN GENERAL */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Fecha:</Text>
                        <Text style={styles.value}>{servicio.fecha_entrada ? new Date(servicio.fecha_entrada).toLocaleDateString() : '-'}</Text>
                    </View>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Fecha Salida:</Text>
                        <Text style={styles.value}>{servicio.fecha_salida ? new Date(servicio.fecha_salida).toLocaleDateString() : '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Cliente:</Text>
                        <Text style={styles.value}>{servicio.cliente?.nombre ?? '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Documento:</Text>
                        <Text style={styles.value}>{servicio.cliente?.dpi ?? '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Teléfono:</Text>
                        <Text style={styles.value}>{servicio.cliente?.telefono ?? '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Vehículo:</Text>
                        <Text style={styles.value}>{servicio.vehiculo?.modelo?.modelo ?? '-'}</Text>
                    </View>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Kilometraje:</Text>
                        <Text style={styles.value}>{(servicio.kilometraje || servicio.kilometraje === 0) ? `${servicio.kilometraje} km` : '-'}</Text>
                    </View>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Próximo Servicio:</Text>
                        <Text style={styles.value}>{(servicio.kilometraje_proximo || servicio.kilometraje_proximo === 0) ? `${servicio.kilometraje_proximo} km` : 'No asignado'}</Text>
                    </View>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Placa:</Text>
                        <Text style={styles.value}>{servicio.vehiculo?.placa ?? '-'}</Text>
                    </View>
                    <View style={styles.infoRowHalf}>
                        <Text style={styles.label}>Tipo de Servicio:</Text>
                        <Text style={styles.value}>{servicio.tipo_servicio?.nombre ?? '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Descripción:</Text>
                        <Text style={styles.value}>{servicio.descripcion ?? '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Diagnóstico:</Text>
                        <Text style={styles.value}>{servicio.diagnostico ?? '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Estado:</Text>
                        <Text style={[styles.value, getStatusStyle(servicio.estado || '')]}>{servicio.estado ?? '-'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* TABLA 1: CHECKLIST DE RECEPCIÓN */}
                <Text style={styles.tableSectionTitle}>Checklist de Recepción</Text>
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Item</Text>
                        <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Estado</Text>
                        <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Observaciones</Text>
                    </View>
                    {servicio.checklist && servicio.checklist.length > 0 ? (
                        servicio.checklist.map((row: any, index: number) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '40%' }]}>{row.item?.nombre || '-'}</Text>
                                <Text style={[styles.tableCell, { width: '20%' }, getStatusStyle(row.estado || '')]}>{row.estado || 'N/A'}</Text>
                                <Text style={[styles.tableCell, { width: '40%' }]}>{row.observaciones || '-'}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataCell}>No hay registros disponibles.</Text>
                    )}
                </View>

                {/* TABLA 2: TAREAS DEL SERVICIO */}
                <Text style={styles.tableSectionTitle}>Tareas del Servicio {servicio.tipo_servicio?.nombre ? `- ${servicio.tipo_servicio.nombre}` : ''}</Text>
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Tarea</Text>
                        <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Estado</Text>
                        <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Observaciones</Text>
                    </View>
                    {tareasNormales.length > 0 ? (
                        tareasNormales.map((row: any, index: number) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '40%' }]}>{row.nombre || '-'}</Text>
                                <Text style={[styles.tableCell, { width: '20%' }, row.completado ? styles.statusSuccess : styles.statusError]}>
                                    {row.completado ? 'Completado' : 'Pendiente'}
                                </Text>
                                <Text style={[styles.tableCell, { width: '40%' }]}>{row.observacion || '-'}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataCell}>No hay registros disponibles.</Text>
                    )}
                </View>

                {tareasExtras.length > 0 && (
                    <>
                        <Text style={styles.tableSectionTitle}>Servicios Extras</Text>
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Tarea</Text>
                                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Estado</Text>
                                <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Observaciones</Text>
                            </View>
                            {tareasExtras.map((row: any, index: number) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { width: '40%' }]}>{row.nombre || '-'}</Text>
                                    <Text style={[styles.tableCell, { width: '20%' }, row.completado ? styles.statusSuccess : styles.statusError]}>
                                        {row.completado ? 'Completado' : 'Pendiente'}
                                    </Text>
                                    <Text style={[styles.tableCell, { width: '40%' }]}>{row.observacion || '-'}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* TABLAS PARALELAS: REPUESTOS */}
                <View style={styles.flexRowBetween}>
                    <View style={styles.halfTableWrapper}>
                        <Text style={styles.tableSectionTitle}>Repuestos del Cliente</Text>
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '70%' }]}>Repuesto</Text>
                                <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Cant.</Text>
                            </View>
                            {servicio.repuestos && servicio.repuestos.length > 0 ? (
                                servicio.repuestos.map((row: any, index: number) => (
                                    <View key={index} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { width: '70%' }]}>{row.repuesto || '-'}</Text>
                                        <Text style={[styles.tableCell, { width: '30%' }]}>{row.cantidad ?? '0'}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noDataCell}>No hay registros.</Text>
                            )}
                        </View>

                        <Text style={styles.tableSectionTitle}>Cambios siguiente servicio</Text>
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '100%' }]}>Item</Text>
                            </View>
                            {servicio.cambios_siguiente_servicio && servicio.cambios_siguiente_servicio.length > 0 ? (
                                servicio.cambios_siguiente_servicio.map((row: any, index: number) => (
                                    <View key={index} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { width: '100%' }]}>{row.item || '-'}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noDataCell}>No hay registros.</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.halfTableWrapper}>
                        <Text style={styles.tableSectionTitle}>Repuestos de Inventario</Text>
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '70%' }]}>Repuesto</Text>
                                <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Cant.</Text>
                            </View>
                            {servicio.repuestos_inventario && servicio.repuestos_inventario.length > 0 ? (
                                servicio.repuestos_inventario.map((row: any, index: number) => {
                                    const variante = row.variante;

                                    const atributos = variante
                                        ? (variante.valores ?? []).map((v: any) => `${v.atributo?.nombre}: ${v.valor}`).join(', ')
                                        : '';
                                    const textoRepuesto = variante
                                        ? `${variante.producto?.nombre || '-'} ${atributos ? `(${atributos})` : ''}`
                                        : '-';

                                    return (
                                        <View key={index} style={styles.tableRow}>
                                            <Text style={[styles.tableCell, { width: '70%' }]}>
                                                {textoRepuesto}
                                            </Text>
                                            <Text style={[styles.tableCell, { width: '30%' }]}>
                                                {row.cantidad ?? '0'}
                                            </Text>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={styles.noDataCell}>No hay registros.</Text>
                            )}
                        </View>

                    </View>
                </View>

                {/* SECCIÓN DE FIRMAS */}
                <View style={styles.signaturesContainer}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureImgBox}>
                            {servicio.firma_entrada ? (
                                <Image src={{ uri: getAbsoluteUrl(servicio.firma_entrada), method: 'GET', headers: { 'Cache-Control': 'no-cache' } }} style={styles.signatureImg} />
                            ) : (
                                <Text style={styles.signaturePlaceholder}>F</Text>
                            )}
                        </View>
                        <Text style={styles.signatureLabel}>Firma Cliente (Entrada)</Text>
                    </View>

                    <View style={styles.signatureBox}>
                        <View style={styles.signatureImgBox}>
                            {servicio.firma_salida ? (
                                <Image src={{ uri: getAbsoluteUrl(servicio.firma_salida), method: 'GET', headers: { 'Cache-Control': 'no-cache' } }} style={styles.signatureImg} />
                            ) : (
                                <Text style={styles.signaturePlaceholder}>F</Text>
                            )}
                        </View>
                        <Text style={styles.signatureLabel}>Firma Cliente (Salida)</Text>
                    </View>
                </View>

                {servicio.servicioReparacion && servicio.servicioReparacion.length > 0 && (
                    <View>
                        <View style={styles.divider} />
                        <Text style={[styles.mainTitle, { fontSize: 16, marginBottom: 10 }]}>Reparaciones Asociadas</Text>
                        {servicio.servicioReparacion.map((rep: any, index: number) => (
                            <View key={index} style={{ marginBottom: 20 }}>
                                <Text style={styles.tableSectionTitle}>Reparación #{index + 1}</Text>
                                {rep.descripcion && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.label}>Descripción:</Text>
                                        <Text style={styles.value}>{rep.descripcion}</Text>
                                    </View>
                                )}

                                <View style={styles.flexRowBetween}>
                                    <View style={styles.halfTableWrapper}>
                                        <Text style={styles.tableSectionTitle}>Repuestos Solicitados</Text>
                                        <View style={styles.tableContainer}>
                                            <View style={styles.tableHeader}>
                                                <Text style={[styles.tableHeaderCell, { width: '50%' }]}>Descripción</Text>
                                                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Cant.</Text>
                                                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Proc.</Text>
                                                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Entregado</Text>
                                            </View>
                                            {rep.servicioReparacionRepuestos && rep.servicioReparacionRepuestos.length > 0 ? (
                                                rep.servicioReparacionRepuestos.map((r: any, idx: number) => (
                                                    <View key={idx} style={styles.tableRow}>
                                                        <Text style={[styles.tableCell, { width: '50%' }]}>{r.descripccion || '-'}</Text>
                                                        <Text style={[styles.tableCell, { width: '15%' }]}>{r.cantidad ?? '0'}</Text>
                                                        <Text style={[styles.tableCell, { width: '20%' }]}>{r.procedencia || '-'}</Text>
                                                        <Text style={[styles.tableCell, { width: '15%' }]}>{r.entregado ? 'Si' : 'No'}</Text>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text style={styles.noDataCell}>No hay registros.</Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.halfTableWrapper}>
                                        <Text style={styles.tableSectionTitle}>Repuestos de Inventario</Text>
                                        <View style={styles.tableContainer}>
                                            <View style={styles.tableHeader}>
                                                <Text style={[styles.tableHeaderCell, { width: '70%' }]}>Repuesto</Text>
                                                <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Cant.</Text>
                                            </View>
                                            {rep.servicioRepuestos && rep.servicioRepuestos.length > 0 ? (
                                                rep.servicioRepuestos.map((r: any, idx: number) => {
                                                    const variante = r.variante;
                                                    const atributos = variante ? (variante.valores ?? []).map((v: any) => `${v.atributo?.nombre}: ${v.valor}`).join(', ') : '';
                                                    const textoRepuesto = variante ? `${variante.producto?.nombre || '-'} ${atributos ? `(${atributos})` : ''}` : '-';
                                                    return (
                                                        <View key={idx} style={styles.tableRow}>
                                                            <Text style={[styles.tableCell, { width: '70%' }]}>{textoRepuesto}</Text>
                                                            <Text style={[styles.tableCell, { width: '30%' }]}>{r.cantidad ?? '0'}</Text>
                                                        </View>
                                                    );
                                                })
                                            ) : (
                                                <Text style={styles.noDataCell}>No hay registros.</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={[styles.signaturesContainer, { marginTop: 10 }]}>
                                    <View style={styles.signatureBox}>
                                        <View style={styles.signatureImgBox}>
                                            {rep.firma_entrada ? (
                                                <Image src={{ uri: getAbsoluteUrl(rep.firma_entrada), method: 'GET', headers: { 'Cache-Control': 'no-cache' } }} style={styles.signatureImg} />
                                            ) : (
                                                <Text style={styles.signaturePlaceholder}>F</Text>
                                            )}
                                        </View>
                                        <Text style={styles.signatureLabel}>Firma Entrada Reparación {index + 1}</Text>
                                    </View>
                                    <View style={styles.signatureBox}>
                                        <View style={styles.signatureImgBox}>
                                            {rep.firma_salida ? (
                                                <Image src={{ uri: getAbsoluteUrl(rep.firma_salida), method: 'GET', headers: { 'Cache-Control': 'no-cache' } }} style={styles.signatureImg} />
                                            ) : (
                                                <Text style={styles.signaturePlaceholder}>F</Text>
                                            )}
                                        </View>
                                        <Text style={styles.signatureLabel}>Firma Salida Reparación {index + 1}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {servicio.servicioCustodias && servicio.servicioCustodias.length > 0 && (
                    <View>
                        <View style={styles.divider} />
                        <Text style={[styles.mainTitle, { fontSize: 16, marginBottom: 10 }]}>Custodias Asociadas</Text>
                        {servicio.servicioCustodias.map((cust: any, index: number) => (
                            <View key={index} style={{ marginBottom: 20 }}>
                                <Text style={styles.tableSectionTitle}>Custodia #{index + 1}</Text>
                                {cust.descripcion && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.label}>Descripción:</Text>
                                        <Text style={styles.value}>{cust.descripcion}</Text>
                                    </View>
                                )}
                                <View style={styles.infoRowHalf}>
                                    <Text style={styles.label}>Fecha Entrada:</Text>
                                    <Text style={styles.value}>{new Date(cust.fecha_entrada).toLocaleString()}</Text>
                                </View>
                                <View style={styles.infoRowHalf}>
                                    <Text style={styles.label}>Fecha Salida:</Text>
                                    <Text style={styles.value}>{cust.fecha_salida ? new Date(cust.fecha_salida).toLocaleString() : 'En curso'}</Text>
                                </View>
                                <View style={[styles.signaturesContainer, { marginTop: 10, justifyContent: 'center' }]}>
                                    <View style={styles.signatureBox}>
                                        <View style={styles.signatureImgBox}>
                                            {cust.firma_salida ? (
                                                <Image src={{ uri: getAbsoluteUrl(cust.firma_salida), method: 'GET', headers: { 'Cache-Control': 'no-cache' } }} style={styles.signatureImg} />
                                            ) : (
                                                <Text style={styles.signaturePlaceholder}>F</Text>
                                            )}
                                        </View>
                                        <Text style={styles.signatureLabel}>Firma Salida Custodia {index + 1}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

            </Page>
        </Document>
    );
};