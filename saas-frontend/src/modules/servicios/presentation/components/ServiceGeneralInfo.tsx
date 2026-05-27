import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Skeleton } from '@mui/material';
import { vehiculoRepository } from '../../../vehiculos/infrastructure/vehiculo.repository';
import { TipoServicioRepository } from '../../../tipos-servicio/infrastructure/repositories/tipo-servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import type { Vehiculo } from '../../../vehiculos/domain/interfaces/vehiculo.interface';
import type { TipoServicio } from '../../../tipos-servicio/domain/interfaces/tipo-servicio.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

import AssignMechanicModal from './AssignMechanicModal';

type Props = { servicio: Servicio; onEdit?: () => void; onMechanicUpdated?: (s: Servicio) => void };

const ServiceGeneralInfo: React.FC<Props> = ({ servicio, onEdit, onMechanicUpdated }) => {
    const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
    const [tipoServicio, setTipoServicio] = useState<TipoServicio | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                if (servicio.vehiculo_id) {
                    const v = await vehiculoRepository.obtener(servicio.vehiculo_id);
                    setVehiculo(v);
                }
                if (servicio.tipo_servicio_id) {
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
            <Box mt={2} display="flex" gap={2}>
                {servicio.mecanico ? (
                    <>
                        <Typography><strong>Mecánico:</strong> {servicio.mecanico.nombre ?? servicio.mecanico.id} - {servicio.mecanico.email ?? ''}</Typography>
                        <Button variant="outlined" onClick={() => setOpenAssign(true)}>Cambiar mecánico</Button>
                    </>
                ) : (
                    <Button variant="contained" onClick={() => setOpenAssign(true)}>Asociar mecánico</Button>
                )}
            </Box>

            <AssignMechanicModal open={openAssign} onClose={() => setOpenAssign(false)} servicio={servicio} onSuccess={handleSuccess} />
            <Box mt={3} display="grid" gap={2} gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
                <Typography>
                    <strong>Vehículo:</strong>{' '}
                    {vehiculo === null ? <Skeleton variant="text" width={120} /> : (vehiculo?.placa ?? 'No asignado')}
                </Typography>
                <Typography><strong>Cliente:</strong> {servicio.cliente?.nombre ?? 'No asignado'}</Typography>
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
