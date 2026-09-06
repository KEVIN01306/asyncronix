import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, Box, Typography, IconButton, Button, CircularProgress, DialogActions } from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';
import { ventaRepository } from '../../../../modules/ventas/infrastructure/venta.repository';
import { servicioRepository } from '../../../../modules/serviciosVehiculos/infrastructure/repositories/servicio.repository';
import { negocioRepository } from '../../../../modules/negocio/infrastructure/repositories/negocio.repository';
import { sucursalRepository } from '../../../../modules/sucursales/infrastructure/repositories/sucursal.repository';
import { negocioFacturacionRepository } from '../../../../modules/negocio/infrastructure/repositories/negocio-facturacion.repository';
import { numeroALetras } from '../../../../core/utils/numeroALetras';
import { FacturaTermicaPreview } from '../../../../shared/components/ui/FacturaTermicaPreview';
import type { FacturaTermicaData } from '../../../../shared/interfaces/factura-termica.interface';
import ConfirmDialog from '../../../../shared/components/ui/dialog/ConfirmDialog';
import { formatMoney } from '../../../../core/utils/formatMoney';

type Props = {
    open: boolean;
    documentoId: string | null;
    tipoDocumento: 'VENTA' | 'SERVICIO';
    onClose: () => void;
};

export default function DocumentPreviewModal({ open, documentoId, tipoDocumento, onClose }: Props) {
    const [documento, setDocumento] = useState<any>(null);
    const [negocio, setNegocio] = useState<any>(null);
    const [sucursal, setSucursal] = useState<any>(null);
    const [facturacion, setFacturacion] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showVueltoModal, setShowVueltoModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const autoPrintDone = useRef(false);

    useEffect(() => {
        if (!open) {
            autoPrintDone.current = false;
            setShowVueltoModal(false);
            setShowConfirmDialog(false);
            setDocumento(null);
            setFacturacion(null);
            setSucursal(null);
            setNegocio(null);
        }
    }, [open]);

    useEffect(() => {
        if (open && documentoId) {
            fetchDocumento();
        }
    }, [open, documentoId, tipoDocumento]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (open && e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();

                if (showConfirmDialog) {
                    onClose();
                    return;
                }

                if (showVueltoModal) {
                    setShowVueltoModal(false);
                    setShowConfirmDialog(true);
                    return;
                }

                if (!loading && documento) {
                    setTimeout(() => handlePrint(), 300);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [open, loading, documento, showVueltoModal, showConfirmDialog]);

    useEffect(() => {
        const handleAfterPrint = () => {
            const metodoPago = tipoDocumento === 'VENTA' ? documento?.metodo_pago : documento?.MetodoPago;
            if (metodoPago === 'EFECTIVO') {
                setShowVueltoModal(true);
            } else {
                setShowConfirmDialog(true);
            }
        };
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, [documento, tipoDocumento]);

    useEffect(() => {
        if (open && !loading && documento && !autoPrintDone.current) {
            autoPrintDone.current = true;
            setTimeout(() => handlePrint(), 800);
        }
    }, [open, loading, documento]);

    const fetchDocumento = async () => {
        try {
            setLoading(true);
            const [resDoc, resNegocio, resSucursal, resFacturacion] = await Promise.all([
                tipoDocumento === 'VENTA'
                    ? ventaRepository.obtener(documentoId!)
                    : servicioRepository.obtener(documentoId!),
                negocioRepository.obtenerMiNegocio().catch(() => null),
                sucursalRepository.obtenerMiSucursal().catch(() => null),
                negocioFacturacionRepository.obtener().catch(() => null)
            ]);
            setDocumento(tipoDocumento === 'VENTA' ? (resDoc as any).data : resDoc);
            setNegocio(resNegocio);
            setSucursal(resSucursal);
            setFacturacion(resFacturacion);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!open) return null;

    let invoiceData: FacturaTermicaData | null = null;

    const buildServiceItems = (servicio: any) => {
        const items: any[] = [];
        if (servicio.subtotal && servicio.subtotal > 0) {
            items.push({ descripcion: 'Mano de Obra', cantidad: 1, precio_unitario: servicio.subtotal, total: servicio.subtotal });
        }
        (servicio.repuestos_inventario || []).forEach((rep: any) => {
            if (rep.cantidad > 0) items.push({ descripcion: rep.variante?.producto?.nombre || 'Repuesto', cantidad: rep.cantidad, precio_unitario: rep.precio_venta, total: rep.cantidad * rep.precio_venta });
        });
        (servicio.servicioReparacion || []).forEach((rep: any) => {
            if (rep.total > 0) items.push({ descripcion: rep.descripcion || 'Reparación', cantidad: 1, precio_unitario: rep.total, total: rep.total });
            (rep.servicioRepuestos || []).forEach((r: any) => {
                if (r.cantidad > 0) items.push({ descripcion: r.variante?.producto?.nombre || 'Repuesto', cantidad: r.cantidad, precio_unitario: r.precio_venta, total: r.cantidad * r.precio_venta });
            });
        });
        (servicio.servicioCustodias || []).forEach((cust: any) => {
            if (cust.total > 0) items.push({ descripcion: cust.descripcion || 'Custodia', cantidad: 1, precio_unitario: cust.total, total: cust.total });
        });
        return items;
    };

    if (documento) {
        const atendidoPor = tipoDocumento === 'VENTA' ? documento.vendedor_nombre : (documento.mecanico_asignado?.nombre || 'Mecánico');
        const items = tipoDocumento === 'VENTA'
            ? (documento.detalles || []).map((d: any) => ({
                descripcion: d.descripcion,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                total: d.cantidad * d.precio_unitario,
            }))
            : buildServiceItems(documento);

        invoiceData = {
            negocio_nombre: facturacion?.nombre_comercial || negocio?.nombre_comercial || 'NEGOCIO',
            negocio_nit: facturacion?.nit_emisor || negocio?.nit_rut || 'C/F',
            negocio_telefono: sucursal?.telefono || null,
            slogan: negocio?.slogan || null,
            sucursal_direccion: sucursal?.direccion || 'Ciudad',
            atendido_por: atendidoPor || 'Cajero',
            uuid: documento.factura?.dte_uuid,
            serie: documento.factura?.serie,
            numero: documento.factura?.numero_factura,
            fecha_emision: documento.created_at,
            cliente_nombre: documento.factura?.receptor_nombre || 'CONSUMIDOR FINAL',
            cliente_nit: documento.factura?.receptor_nit || 'CF',
            items: items,
            subtotal: documento.total / 1.12,
            iva: documento.total - (documento.total / 1.12),
            descuento: 0,
            total: documento.total,
            efectivo_recibido: documento.efectivo_recibido,
            cambio: documento.vuelto,
            total_letras: numeroALetras(documento.total),

            certificador_nombre: 'Digifact S.A.',
            certificador_nit: '77454820',
            frases: ['SUJETO A PAGOS TRIMESTRALES'],
        };
    }

    return (
        <Dialog
            open={open}
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                    onClose();
                }
            }}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, '@media print': { display: 'none' } }}>
                Factura Generada
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ backgroundColor: '#e0e0e0', p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center', '@media print': { p: 0, border: 'none', overflow: 'visible' } }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight={300} sx={{ '@media print': { display: 'none' } }}>
                        <CircularProgress />
                    </Box>
                ) : !invoiceData ? (
                    <Typography sx={{ '@media print': { display: 'none' } }}>No se encontró la información del documento</Typography>
                ) : (
                    <FacturaTermicaPreview data={invoiceData} width="80mm" />
                )}
            </DialogContent>
            <Box p={2} display="flex" justifyContent="center" gap={2} sx={{ '@media print': { display: 'none' } }}>
                <Button variant="outlined" onClick={() => {
                    const metodoPago = tipoDocumento === 'VENTA' ? documento?.metodo_pago : documento?.MetodoPago;
                    if (metodoPago === 'EFECTIVO') {
                        setShowVueltoModal(true);
                    } else {
                        setShowConfirmDialog(true);
                    }
                }}>
                    Cerrar
                </Button>
                <Button
                    variant="contained"
                    onClick={() => setTimeout(() => handlePrint(), 300)}
                    startIcon={<PrintIcon />}
                    disabled={loading || !invoiceData}
                    disableRipple
                    disableFocusRipple
                >
                    Imprimir Factura
                </Button>
            </Box>

            {/* Modal de Vuelto para Efectivo */}
            <Dialog
                open={showVueltoModal}
                onClose={() => { }}
                maxWidth="xs"
                fullWidth
                disableEscapeKeyDown
            >
                <DialogTitle textAlign="center" fontWeight="bold">Cambio a Entregar</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1} textAlign="center">
                        <Typography variant="body1" color="text.secondary">
                            Efectivo Recibido: {formatMoney(documento?.efectivo_recibido || 0)}
                        </Typography>
                        <Typography variant="h3" color="primary.main" fontWeight="bold">
                            {formatMoney(documento?.vuelto || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Entregue esta cantidad al cliente
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                            setShowVueltoModal(false);
                            setShowConfirmDialog(true);
                        }}
                    >
                        Entendido (Enter)
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Confirmación para Nueva Operación */}
            <ConfirmDialog
                open={showConfirmDialog}
                title="Operación Finalizada"
                description={tipoDocumento === 'VENTA' ? "Venta finalizada con éxito. ¿Deseas realizar otra venta?" : "Servicio finalizado con éxito. ¿Deseas regresar a la lista de servicios?"}
                confirmText={tipoDocumento === 'VENTA' ? "Sí, Nueva Venta" : "Entendido"}
                confirmColor="primary"
                onClose={() => {
                    // Si dice que no, igual cerramos pero podríamos navegar a otro lado si fuera necesario. 
                    // Asumiremos que el onClose principal lo limpia de todos modos.
                    onClose();
                }}
                onConfirm={() => {
                    onClose();
                }}
            />
        </Dialog>
    );
}
