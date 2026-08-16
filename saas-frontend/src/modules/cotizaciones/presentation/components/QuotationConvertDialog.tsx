import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, Autocomplete, TextField, CircularProgress, Chip
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { ConvertirCotizacionForm } from '../../domain/interfaces/cotizacion.interface';
import { TipoServicioRepository } from '../../../tipos-servicio/infrastructure/repositories/tipo-servicio.repository';
import type { TipoServicio } from '../../../tipos-servicio/domain/interfaces/tipo-servicio.interface';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    cotizacion?: any;
    onClose: () => void;
    onConfirm: (data: ConvertirCotizacionForm) => void;
}

export default function QuotationConvertDialog({ open, cotizacion, onClose, onConfirm }: Props) {
    const [tipoServicios, setTipoServicios] = useState<TipoServicio[]>([]);
    const [loadingTipos, setLoadingTipos] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState<TipoServicio | null>(null);

    const requiresTipoServicio = cotizacion?.tipo_destino === 'TALLER' && 
        !(cotizacion?.detalles || []).some((d: any) => d.tipo_servicio_id);

    useEffect(() => {
        if (open && requiresTipoServicio) {
            setLoadingTipos(true);
            TipoServicioRepository.listar(100, 0)
                .then(res => {
                    // Solo tipos sin opciones asociadas
                    const simples = res.data.filter(t => !t.opciones || t.opciones.length === 0);
                    setTipoServicios(simples);
                })
                .catch(() => toast.error('Error al cargar tipos de servicio'))
                .finally(() => setLoadingTipos(false));
        } else {
            setSelectedTipo(null);
            setTipoServicios([]);
        }
    }, [open, requiresTipoServicio]);

    const handleConfirm = () => {
        if (requiresTipoServicio && !selectedTipo) {
            toast.error('Debe seleccionar un tipo de servicio');
            return;
        }
        onConfirm({
            tipo_servicio_id: selectedTipo?.id
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Convertir Cotización</DialogTitle>
            <DialogContent dividers>
                <Typography mb={2}>
                    Al convertir esta cotización se generará automáticamente una Preventa (Venta Pendiente) o un Servicio (Recepción) dependiendo del destino para que puedas completar los datos.
                </Typography>

                {requiresTipoServicio && (
                    <Box mt={3}>
                        <Typography variant="subtitle2" color="error" gutterBottom>
                            Falta un tipo de servicio
                        </Typography>
                        <Typography variant="body2" mb={2}>
                            La cotización no tiene un tipo de servicio asociado. Selecciona uno para poder crear la orden de taller.
                        </Typography>

                        <Autocomplete
                            options={tipoServicios}
                            getOptionLabel={(option) => option.nombre}
                            loading={loadingTipos}
                            value={selectedTipo}
                            onChange={(_, newValue) => setSelectedTipo(newValue)}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} display="flex" justifyContent="space-between" alignItems="center">
                                    <span>{option.nombre}</span>
                                    {option.checklist && (
                                        <Chip label="Checklist Activo" size="small" color="primary" variant="outlined" />
                                    )}
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tipo de Servicio"
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingTipos ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    Confirmar Conversión
                </Button>
            </DialogActions>
        </Dialog>
    );
}
