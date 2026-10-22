import { useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Alert, AlertTitle, Stack, CircularProgress } from '@mui/material';
import { CompareArrows, Lock } from '@mui/icons-material';
import { toast } from 'sonner';
import { BuscadorClienteLocal } from './BuscadorClienteLocal';
import { BuscadorClienteGlobal } from './BuscadorClienteGlobal';
import { ModalConfirmarUnificacion } from './ModalConfirmarUnificacion';
import { clienteRepository } from '../../infrastructure/clientes.repository';
import type { Cliente, ResumenUnificacion, UnificarClientesPayload } from '../../domain/interfaces/cliente.interface';
import { useAuthStore } from '../../../../core/store/authStore';

interface Props {
    onUnificationSuccess?: () => void;
}

export const ClienteUnificacionTab = ({ onUnificationSuccess }: Props) => {
    const user = useAuthStore((s) => s.user);
    const tienePermiso = user?.permisos?.includes('UNIFICAR_CLIENTES');

    const [clienteLocal, setClienteLocal] = useState<Cliente | null>(null);
    const [clienteGlobal, setClienteGlobal] = useState<Cliente | null>(null);
    const [cargandoResumen, setCargandoResumen] = useState(false);
    const [resumen, setResumen] = useState<ResumenUnificacion | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [ejecutando, setEjecutando] = useState(false);

    const handlePreparar = async () => {
        if (!clienteLocal || !clienteGlobal) {
            toast.error('Debe seleccionar ambos clientes para unificar');
            return;
        }

        if (clienteLocal.id === clienteGlobal.id) {
            toast.warning('Ambos criterios identifican al mismo cliente. No hay registros que unificar.');
            return;
        }

        setCargandoResumen(true);
        try {
            const res = await clienteRepository.obtenerResumenUnificacion(clienteLocal.id, clienteGlobal.id);
            setResumen(res.data);
            setModalOpen(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al obtener resumen de unificación');
        } finally {
            setCargandoResumen(false);
        }
    };

    const handleConfirmar = async (payload: UnificarClientesPayload) => {
        setEjecutando(true);
        try {
            const res = await clienteRepository.unificar(payload);
            toast.success(res.message || 'Clientes unificados exitosamente. Se enviaron las nuevas credenciales.');
            setModalOpen(false);
            setResumen(null);
            setClienteLocal(null);
            setClienteGlobal(null);
            onUnificationSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al ejecutar la unificación');
        } finally {
            setEjecutando(false);
        }
    };

    if (!tienePermiso) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
                <Lock color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    Acceso Restringido
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    No cuentas con el permiso administrativo necesario (<code>UNIFICAR_CLIENTES</code>) para realizar consolidaciones de clientes.
                </Typography>
            </Paper>
        );
    }

    const listoParaComparar = Boolean(clienteLocal && clienteGlobal && clienteLocal.id !== clienteGlobal.id);

    return (
        <Box mt={2}>
            <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Consolidación y Unificación de Clientes</AlertTitle>
                Esta herramienta permite resolver registros duplicados de una misma persona entre este negocio y la plataforma global.
                Seleccione el cliente de origen dentro de este negocio y el cliente global correspondiente.
            </Alert>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <BuscadorClienteLocal selected={clienteLocal} onSelect={setClienteLocal} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <BuscadorClienteGlobal
                        selected={clienteGlobal}
                        localClienteId={clienteLocal?.id}
                        onSelect={setClienteGlobal}
                    />
                </Grid>
            </Grid>

            <Box mt={3} p={2} component={Paper} display="flex" justifyContent="center">
                <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={cargandoResumen ? <CircularProgress size={20} color="inherit" /> : <CompareArrows />}
                    disabled={!listoParaComparar || cargandoResumen}
                    onClick={handlePreparar}
                >
                    {cargandoResumen ? 'Analizando registros...' : 'Comparar y Revisar Unificación'}
                </Button>
            </Box>

            <ModalConfirmarUnificacion
                open={modalOpen}
                resumen={resumen}
                ejecutando={ejecutando}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmar}
            />
        </Box>
    );
};
