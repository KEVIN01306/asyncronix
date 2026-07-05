import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField,
    CircularProgress,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import { toast } from 'sonner';
import { negocioRepository } from '../../infrastructure/repositories/negocio.repository';
import { monedasRepository } from '../../../monedas/infrastructure/monedas.repository';
import type { Moneda } from '../../../monedas/domain/interface/moneda.interface';

interface CambiarMonedaModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CambiarMonedaModal = ({ open, onClose, onSuccess }: CambiarMonedaModalProps) => {
    const [monedas, setMonedas] = useState<Moneda[]>([]);
    const [selectedMoneda, setSelectedMoneda] = useState<Moneda | null>(null);
    const [loadingMonedas, setLoadingMonedas] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;

        const fetchMonedas = async () => {
            setLoadingMonedas(true);
            try {
                const response = await monedasRepository.listar(100, 0);
                setMonedas(response.data);
            } catch (error) {
                console.error(error);
                toast.error('No se pudieron cargar las monedas');
            } finally {
                setLoadingMonedas(false);
            }
        };

        fetchMonedas();
    }, [open]);

    const handleCambiar = async () => {
        if (!selectedMoneda) {
            toast.error('Selecciona una moneda');
            return;
        }

        setIsSubmitting(true);
        try {
            await negocioRepository.cambiarMoneda(selectedMoneda.id);
            toast.success('Moneda actualizada correctamente');
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar la moneda');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cambiar moneda del negocio</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Selecciona la moneda que deseas utilizar para tu negocio. Esta decisión afectará el formato de visualización de precios.
                </Alert>

                {loadingMonedas ? (
                    <Box display="flex" justifyContent="center" py={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Autocomplete
                        options={monedas}
                        getOptionLabel={(option) => `${option.nombre} (${option.simbolo})`}
                        value={selectedMoneda}
                        onChange={(_, newValue) => setSelectedMoneda(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Moneda"
                                placeholder="Busca y selecciona una moneda"
                            />
                        )}
                        noOptionsText="No hay monedas disponibles"
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                )}

                {selectedMoneda && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">Detalles de la moneda seleccionada</Typography>
                        <Typography variant="body2" fontWeight={700}>{selectedMoneda.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Código: {selectedMoneda.codigo} | Símbolo: {selectedMoneda.simbolo}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleCambiar}
                    variant="contained"
                    disabled={!selectedMoneda || isSubmitting}
                    loading={isSubmitting}
                >
                    {isSubmitting ? 'Guardando...' : 'Cambiar moneda'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CambiarMonedaModal;
