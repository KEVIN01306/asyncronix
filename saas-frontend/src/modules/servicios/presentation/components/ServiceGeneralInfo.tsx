import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { vehiculoRepository } from '../../../vehiculos/infrastructure/vehiculo.repository';
import { TipoServicioRepository } from '../../../tipos-servicio/infrastructure/repositories/tipo-servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import type { Vehiculo } from '../../../vehiculos/domain/interfaces/vehiculo.interface';
import type { TipoServicio } from '../../../tipos-servicio/domain/interfaces/tipo-servicio.interface';
import { ESTADO_SERVICIO } from '../../domain/servicio.constants';
import { formatMoney } from '../../../../core/utils/formatMoney';

import AssignMechanicModal from './AssignMechanicModal';
import ExternalClientModal from './ExternalClientModal';

type Props = { servicio: Servicio; onEdit?: () => void; onMechanicUpdated?: (s: Servicio) => void };

const ServiceGeneralInfo: React.FC<Props> = ({ servicio, onEdit, onMechanicUpdated }) => {
    const navigate = useNavigate();
    const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
    const [tipoServicio, setTipoServicio] = useState<TipoServicio | null>(null);
    const canAssignMechanic = servicio.estado === ESTADO_SERVICIO.RECEPCION;

    useEffect(() => {
        const load = async () => {
            try {
                if (servicio.vehiculo_id) {
                    const v = await vehiculoRepository.obtener(servicio.vehiculo_id);
                    setVehiculo(v);
                }
                if (servicio.tipo_servicio) {
                    setTipoServicio(servicio.tipo_servicio as any);
                } else if (servicio.tipo_servicio_id) {
                    const t = await TipoServicioRepository.Obtener(servicio.tipo_servicio_id);
                    setTipoServicio(t);
                }
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [servicio.vehiculo_id, servicio.tipo_servicio_id]);

    const [openAssign, setOpenAssign] = useState(false);
    const [openExternalClient, setOpenExternalClient] = useState(false);
    const canUpdateExternalClient = servicio.estado === ESTADO_SERVICIO.RECEPCION;

    const handleSuccess = (s: Servicio) => {
        // bubble up
        if (typeof (onMechanicUpdated) === 'function') onMechanicUpdated(s as any);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Servicio #{servicio.id}</Typography>
                    <Typography color="text.secondary">Estado actual: {servicio.estado}</Typography>
                </Box>
                <Button variant="contained" onClick={onEdit}>Editar servicio</Button>
            </Box>
            <Box mt={2} display="flex" gap={2} flexWrap="wrap" alignItems="center">
                {servicio.mecanico ? (
                    <>
                        <Typography><strong>Mecánico:</strong> {servicio.mecanico.nombre ?? servicio.mecanico.id} - {servicio.mecanico.email ?? ''}</Typography>
                        <Button variant="outlined" disabled={!canAssignMechanic} onClick={() => setOpenAssign(true)}>Cambiar mecánico</Button>
                    </>
                ) : (
                    <Button variant="contained" disabled={!canAssignMechanic} onClick={() => setOpenAssign(true)}>Asociar mecánico</Button>
                )}
                <Button
                    variant={servicio.nombre_extra ? 'outlined' : 'contained'}
                    disabled={!canUpdateExternalClient}
                    onClick={() => setOpenExternalClient(true)}
                >
                    {servicio.nombre_extra ? 'Editar cliente externo' : 'Asociar cliente externo'}
                </Button>
            </Box>

            <AssignMechanicModal open={openAssign} onClose={() => setOpenAssign(false)} servicio={servicio} onSuccess={handleSuccess} />
            <ExternalClientModal open={openExternalClient} onClose={() => setOpenExternalClient(false)} servicio={servicio} onSuccess={handleSuccess} />
            <Box mt={3} display="grid" gap={2} gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
                <Typography>
                    <strong>Vehículo:</strong>{' '}
                    {vehiculo === null ? <Skeleton variant="text" width={120} /> : (vehiculo?.placa ?? 'No asignado')}
                </Typography>
                <Box>
                    <Typography component="span"><strong>Cliente:</strong> {servicio.cliente?.nombre ?? 'No asignado'}</Typography>
                    {servicio.cliente?.id ? (
                        <Button
                            size="small"
                            sx={{ ml: 1, textTransform: 'none' }}
                            onClick={() => navigate(`/clientes/${servicio.cliente?.id}`)}
                        >
                            Ver cliente asociado
                        </Button>
                    ) : null}
                </Box>
                {servicio.nombre_extra ? (
                    <Box>
                        <Typography><strong>Cliente externo:</strong></Typography>
                        <Typography variant="body2" color="text.secondary">Nombre: {servicio.nombre_extra}</Typography>
                        <Typography variant="body2" color="text.secondary">DPI: {servicio.documento_extra}</Typography>
                        <Typography variant="body2" color="text.secondary">Número extra: {servicio.numero_extra}</Typography>
                    </Box>
                ) : null}
                <Typography>
                    <strong>Tipo de servicio:</strong>{' '}
                    {tipoServicio === null ? <Skeleton variant="text" width={140} /> : (tipoServicio?.nombre ?? 'Sin tipo')}
                </Typography>
                <Typography><strong>Total estimado:</strong>{formatMoney(servicio.total ?? 0)}</Typography>
                <Typography><strong>Kilometraje:</strong> {servicio.kilometraje ?? 'N/A'}</Typography>
                <Typography><strong>Método de pago:</strong> {servicio.MetodoPago}</Typography>
            </Box>
        </Paper>
    );
};

export default ServiceGeneralInfo;
