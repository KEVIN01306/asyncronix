import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    AlertTitle,
    Chip,
    Stack,
    CircularProgress,
    Divider,
    Paper,
    Switch,
} from '@mui/material';
import { Warning, CheckCircle, DeleteForever } from '@mui/icons-material';
import type { ResumenUnificacion, UnificarClientesPayload } from '../../domain/interfaces/cliente.interface';

interface Props {
    open: boolean;
    resumen: ResumenUnificacion | null;
    ejecutando: boolean;
    onClose: () => void;
    onConfirm: (payload: UnificarClientesPayload) => void;
}

export const ModalConfirmarUnificacion = ({ open, resumen, ejecutando, onClose, onConfirm }: Props) => {
    const [clienteConservarId, setClienteConservarId] = useState<string>('');
    const [adoptarDatosFaltantes, setAdoptarDatosFaltantes] = useState<boolean>(true);

    if (!resumen) return null;

    const origen = resumen.origen;
    const destino = resumen.destino;
    const conservarId = clienteConservarId || origen.id;
    const esOrigenConservado = conservarId === origen.id;

    const clienteConservar = esOrigenConservado ? origen : destino;
    const clienteEliminar = esOrigenConservado ? destino : origen;
    const relaciones = resumen.relaciones_a_migrar;

    const esNombreGenerico = (n?: string | null) => {
        if (!n) return true;
        const norm = n.trim().toUpperCase();
        return norm === 'CF' || norm === 'C/F' || norm === 'CONSUMIDOR FINAL' || norm === 'CLIENTE GENERAL';
    };

    const camposFaltantes: Array<{ etiqueta: string; valor: string }> = [];
    if (esNombreGenerico(clienteConservar.nombre) && !esNombreGenerico(clienteEliminar.nombre)) {
        camposFaltantes.push({ etiqueta: 'Nombre', valor: clienteEliminar.nombre });
    }
    if (!clienteConservar.apellido?.trim() && clienteEliminar.apellido?.trim()) {
        camposFaltantes.push({ etiqueta: 'Apellido', valor: clienteEliminar.apellido.trim() });
    }
    if (!clienteConservar.telefono?.trim() && clienteEliminar.telefono?.trim()) {
        camposFaltantes.push({ etiqueta: 'Teléfono', valor: clienteEliminar.telefono.trim() });
    }
    if (!clienteConservar.email?.trim() && clienteEliminar.email?.trim()) {
        camposFaltantes.push({ etiqueta: 'Email', valor: clienteEliminar.email.trim() });
    }
    if (!clienteConservar.nit?.trim() && clienteEliminar.nit?.trim()) {
        camposFaltantes.push({ etiqueta: 'NIT', valor: clienteEliminar.nit.trim() });
    }
    if (!clienteConservar.dpi?.trim() && clienteEliminar.dpi?.trim()) {
        camposFaltantes.push({ etiqueta: 'DPI', valor: clienteEliminar.dpi.trim() });
    }

    const handleConfirm = () => {
        const nombreDefinitivo = (esNombreGenerico(clienteConservar.nombre) && !esNombreGenerico(clienteEliminar.nombre) && adoptarDatosFaltantes)
            ? (clienteEliminar.nombre?.trim() || clienteConservar.nombre)
            : clienteConservar.nombre;

        onConfirm({
            cliente_conservar_id: clienteConservar.id,
            cliente_eliminar_id: clienteEliminar.id,
            adoptar_datos_faltantes: adoptarDatosFaltantes,
            datos_fusionados: {
                nombre: nombreDefinitivo,
                apellido: (clienteConservar.apellido?.trim() || (adoptarDatosFaltantes ? (clienteEliminar.apellido?.trim() || null) : null)),
                telefono: (clienteConservar.telefono?.trim() || (adoptarDatosFaltantes ? (clienteEliminar.telefono?.trim() || null) : null)),
                email: (clienteConservar.email?.trim() || (adoptarDatosFaltantes ? (clienteEliminar.email?.trim() || null) : null)),
                nit: (clienteConservar.nit?.trim() || (adoptarDatosFaltantes ? (clienteEliminar.nit?.trim() || null) : null)),
                dpi: (clienteConservar.dpi?.trim() || (adoptarDatosFaltantes ? (clienteEliminar.dpi?.trim() || null) : null)),
            },
        });
    };

    return (
        <Dialog open={open} onClose={() => !ejecutando && onClose()} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning color="warning" />
                Confirmación de Unificación de Clientes
            </DialogTitle>

            <DialogContent dividers>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>Operación irreversible de consolidación histórica</AlertTitle>
                    Todas las ventas, vehículos, servicios y facturas del registro que se elimine serán reasignados al cliente definitivo.
                    Las asociaciones a negocios serán unificadas sin duplicados. Se generarán nuevas credenciales seguras y se enviará notificación por correo.
                </Alert>

                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Paso 1: Selecciona el registro que se CONSERVARÁ
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    El registro seleccionado conservará su DPI como identificador de inicio de sesión principal.
                </Typography>

                <RadioGroup value={conservarId} onChange={(e) => setClienteConservarId(e.target.value)}>
                    <Grid container spacing={2} mb={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    borderColor: esOrigenConservado ? 'primary.main' : 'divider',
                                    bgcolor: esOrigenConservado ? 'action.selected' : 'background.paper',
                                }}
                                onClick={() => setClienteConservarId(origen.id)}
                            >
                                <FormControlLabel
                                    value={origen.id}
                                    control={<Radio />}
                                    label={<Typography fontWeight={700}>Opción A: Cliente Origen (Local)</Typography>}
                                />
                                <Typography variant="body2">{origen.nombre} {origen.apellido || ''}</Typography>
                                <Typography variant="caption" display="block">DPI: {origen.dpi || 'N/A'}</Typography>
                                <Typography variant="caption" display="block">NIT: {origen.nit || 'N/A'}</Typography>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    borderColor: !esOrigenConservado ? 'secondary.main' : 'divider',
                                    bgcolor: !esOrigenConservado ? 'action.selected' : 'background.paper',
                                }}
                                onClick={() => setClienteConservarId(destino.id)}
                            >
                                <FormControlLabel
                                    value={destino.id}
                                    control={<Radio color="secondary" />}
                                    label={<Typography fontWeight={700}>Opción B: Cliente Global</Typography>}
                                />
                                <Typography variant="body2">{destino.nombre} {destino.apellido || ''}</Typography>
                                <Typography variant="caption" display="block">DPI: {destino.dpi || 'N/A'}</Typography>
                                <Typography variant="caption" display="block">NIT: {destino.nit || 'N/A'}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </RadioGroup>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Paso 2: Adopción de datos faltantes
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Configura si el registro que se conservará adoptará los campos faltantes que posee el registro a eliminar.
                </Typography>

                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        mb: 3,
                        borderColor: adoptarDatosFaltantes ? 'primary.light' : 'divider',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
                    }}
                >
                    <FormControlLabel
                        control={
                            <Switch
                                checked={adoptarDatosFaltantes}
                                onChange={(e) => setAdoptarDatosFaltantes(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Adoptar datos faltantes del registro a eliminar
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {adoptarDatosFaltantes
                                        ? 'Los campos vacíos del registro que se conservará se completarán con la información disponible en el otro registro.'
                                        : 'Se mantendrán únicamente los datos del registro a conservar, descartando cualquier campo adicional del otro registro.'}
                                </Typography>
                            </Box>
                        }
                        sx={{ alignItems: 'flex-start', mb: camposFaltantes.length > 0 ? 1.5 : 0 }}
                    />

                    {camposFaltantes.length > 0 ? (
                        adoptarDatosFaltantes ? (
                            <Box sx={{ mt: 1, pl: { sm: 6 } }}>
                                <Typography variant="caption" fontWeight={600} color="primary" display="block" mb={1}>
                                    Datos que serán adoptados por el cliente definitivo:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                    {camposFaltantes.map((c) => (
                                        <Chip
                                            key={c.etiqueta}
                                            label={`${c.etiqueta}: ${c.valor}`}
                                            color="primary"
                                            size="small"
                                            variant="filled"
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        ) : (
                            <Box sx={{ mt: 1, pl: { sm: 6 } }}>
                                <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
                                    No se copiarán datos adicionales. El cliente conservado quedará tal cual está registrado actualmente.
                                </Alert>
                            </Box>
                        )
                    ) : (
                        <Box sx={{ mt: 1, pl: { sm: 6 } }}>
                            <Typography variant="caption" color="textSecondary">
                                El registro seleccionado ya cuenta con todos los datos o el otro registro no contiene campos adicionales.
                            </Typography>
                        </Box>
                    )}
                </Paper>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Paso 3: Resumen del plan de migración
                </Typography>

                <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <CheckCircle fontSize="small" />
                                <Typography variant="subtitle2" fontWeight={700}>SE CONSERVARÁ:</Typography>
                            </Stack>
                            <Typography variant="body2"><strong>{clienteConservar.nombre} {clienteConservar.apellido || ''}</strong></Typography>
                            <Typography variant="caption" display="block">DPI: {clienteConservar.dpi || 'N/A'}</Typography>
                            <Typography variant="caption" display="block">Usuario definitivo de acceso</Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <DeleteForever fontSize="small" />
                                <Typography variant="subtitle2" fontWeight={700}>SE ELIMINARÁ (post-migración):</Typography>
                            </Stack>
                            <Typography variant="body2"><strong>{clienteEliminar.nombre} {clienteEliminar.apellido || ''}</strong></Typography>
                            <Typography variant="caption" display="block">DPI: {clienteEliminar.dpi || 'N/A'}</Typography>
                            <Typography variant="caption" display="block">Sus sesiones serán revocadas</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Typography variant="body2" fontWeight={600} mb={1}>
                    Relaciones a consolidar:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    <Chip label={`Vehículos: ${relaciones.vehiculos}`} size="small" variant="outlined" />
                    <Chip label={`Ventas: ${relaciones.ventas}`} size="small" variant="outlined" />
                    <Chip label={`Servicios: ${relaciones.servicios}`} size="small" variant="outlined" />
                    <Chip label={`Citas: ${relaciones.citas}`} size="small" variant="outlined" />
                    <Chip label={`Cotizaciones: ${relaciones.cotizaciones}`} size="small" variant="outlined" />
                    <Chip label={`Facturas: ${relaciones.facturas}`} size="small" variant="outlined" />
                    <Chip label={`Preventas: ${relaciones.pre_ventas}`} size="small" variant="outlined" />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={ejecutando} color="inherit">
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={handleConfirm}
                    disabled={ejecutando}
                    startIcon={ejecutando ? <CircularProgress size={18} color="inherit" /> : <Warning />}
                >
                    {ejecutando ? 'Consolidando registros...' : 'Confirmar y Unificar Clientes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
