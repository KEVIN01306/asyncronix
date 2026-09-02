import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Card, CardMedia } from '@mui/material';
import { toast } from 'sonner';
import SignaturePadModal from './modals/SignaturePadModal';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { ESTADO_SERVICIO_VEHICULO} from '../../domain/servicio.constants';
import { formatImage } from '../../../../core/utils/formatImage';


type Props = { servicio: ServicioVehiculo; onUpdate: (s: ServicioVehiculo) => void; };

const ServiceSignatures: React.FC<Props> = ({ servicio, onUpdate }) => {
    const [openPad, setOpenPad] = useState(false);
    const [pendingBase64, setPendingBase64] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const handleFinalize = () => {
        setPendingBase64(null);
        setOpenPad(true);
    };

    const handleSaveBase64 = (base64: string | null) => setPendingBase64(base64);

    const handleConfirm = async () => {
        if (!pendingBase64) {
            toast.error('La firma es obligatoria');
            return;
        }
        setSaving(true);
        try {
            const blob = await fetch(pendingBase64).then(r => r.blob());
            const file = new File([blob], 'firma_entrada.png', { type: 'image/png' });
            const updated = await servicioRepository.guardarFirmaEntrada(servicio.id, file);
            onUpdate(updated);
            setOpenPad(false);
            setPendingBase64(null);
            toast.success('Firma registrada y servicio pasado a EN_SERVICIO');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo guardar la firma');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            {servicio.estado === ESTADO_SERVICIO_VEHICULO.RECEPCION ? (
                <Box>
                    <Typography variant="h6" mb={2}>Finalizar Recepción</Typography>
                    <Button variant="contained" color="primary" onClick={handleFinalize} disabled={saving}>Finalizar {ESTADO_SERVICIO_VEHICULO.RECEPCION}</Button>
                </Box>
            ) : (
                <Box>
                    <Typography variant="h6" mb={2}>Estado del Servicio</Typography>
                    <Typography><strong>Estado actual:</strong> {servicio.estado.replace('_', ' ')}</Typography>
                </Box>
            )}

            {(servicio.firma_entrada || servicio.firma_salida) && (
                <Box mt={2}>
                    <Typography variant="h6" mb={2}>Firmas del Servicio</Typography>
                    <Box display="grid" gap={3} gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
                        {servicio.firma_entrada && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} mb={1}>Firma de Entrada (Servicio)</Typography>
                                <Card sx={{ border: '1px solid #e0e0e0' }}>
                                    <CardMedia component="img" image={formatImage(servicio.firma_entrada)} alt="Firma de entrada" sx={{ height: 200, objectFit: 'contain', p: 1 }} />
                                </Card>
                            </Box>
                        )}
                        {servicio.firma_salida && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} mb={1}>Firma de Salida (Servicio)</Typography>
                                <Card sx={{ border: '1px solid #e0e0e0' }}>
                                    <CardMedia component="img" image={formatImage(servicio.firma_salida)} alt="Firma de salida" sx={{ height: 200, objectFit: 'contain', p: 1 }} />
                                </Card>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {servicio.servicioReparacion && servicio.servicioReparacion.length > 0 && (
                <Box mt={4}>
                    <Typography variant="h6" mb={2}>Firmas de Reparaciones</Typography>
                    {servicio.servicioReparacion.map((rep, index) => (
                        <Box key={rep.id} mb={3}>
                            <Typography variant="subtitle1" fontWeight={600} color="primary" mb={2}>Reparación #{index + 1}</Typography>
                            <Box display="grid" gap={3} gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
                                {rep.firma_entrada && (
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600} mb={1}>Firma Entrada (Reparación)</Typography>
                                        <Card sx={{ border: '1px solid #e0e0e0' }}>
                                            <CardMedia component="img" image={formatImage(rep.firma_entrada)} alt="Firma de entrada" sx={{ height: 150, objectFit: 'contain', p: 1 }} />
                                        </Card>
                                    </Box>
                                )}
                                {rep.firma_salida && (
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600} mb={1}>Firma Salida (Reparación)</Typography>
                                        <Card sx={{ border: '1px solid #e0e0e0' }}>
                                            <CardMedia component="img" image={formatImage(rep.firma_salida)} alt="Firma de salida" sx={{ height: 150, objectFit: 'contain', p: 1 }} />
                                        </Card>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {servicio.servicioCustodias && servicio.servicioCustodias.length > 0 && (
                <Box mt={4}>
                    <Typography variant="h6" mb={2}>Firmas de Custodias</Typography>
                    {servicio.servicioCustodias.map((cust, index) => (
                        <Box key={cust.id} mb={3}>
                            <Typography variant="subtitle1" fontWeight={600} color="primary" mb={2}>Custodia #{index + 1}</Typography>
                            <Box display="grid" gap={3} gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
                                {cust.firma_salida && (
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600} mb={1}>Firma Salida (Custodia)</Typography>
                                        <Card sx={{ border: '1px solid #e0e0e0' }}>
                                            <CardMedia component="img" image={formatImage(cust.firma_salida)} alt="Firma de salida" sx={{ height: 150, objectFit: 'contain', p: 1 }} />
                                        </Card>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            <SignaturePadModal open={openPad} onSave={handleSaveBase64} onCancel={() => setOpenPad(false)} onConfirm={handleConfirm} saving={saving} />
        </Paper>
    );
};

export default ServiceSignatures;
