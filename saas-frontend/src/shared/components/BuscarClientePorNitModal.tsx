import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    CircularProgress,
    InputAdornment,
    Alert
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteRepository } from '../../modules/clientes/infrastructure/clientes.repository';
import { toast } from 'sonner';

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: (cliente: { nit: string; nombre: string }) => void;
};

// Zod schema para validar el NIT
const nitSchema = z.object({
    nit: z.string().min(1, 'El NIT es obligatorio').regex(/^[0-9A-Za-z\-/]+$/, 'Formato de NIT inválido')
});

export default function BuscarClientePorNitModal({ open, onClose, onSuccess }: Props) {
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [nitConsultado, setNitConsultado] = useState('');
    const [nombreEncontrado, setNombreEncontrado] = useState('');

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(nitSchema),
        defaultValues: {
            nit: ''
        }
    });

    // Resetear estado al abrir/cerrar
    useEffect(() => {
        if (!open) {
            reset();
            setSearching(false);
            setSearchError('');
            setNitConsultado('');
            setNombreEncontrado('');
        }
    }, [open, reset]);

    const handleConsultar = async (data: { nit: string }) => {
        setSearchError('');
        setSearching(true);
        setNombreEncontrado('');

        const cleanNit = data.nit.trim();

        if (cleanNit.toUpperCase() === 'CF' || cleanNit.toUpperCase() === 'C/F') {
            onSuccess({
                nit: 'CF',
                nombre: 'Consumidor Final'
            });
            onClose();
            return;
        }

        try {
            const result = await clienteRepository.consultarNitDigifact(cleanNit);

            if (result.data) {
                setNitConsultado(result.data.nit);
                setNombreEncontrado(result.data.nombre);
                toast.success('Cliente encontrado exitosamente');
            }
        } catch (err: any) {
            const serverMsg = err.response?.data?.message || 'Error al consultar el NIT en Digifact';
            setSearchError(serverMsg);
            setNitConsultado('');
            setNombreEncontrado('');
        } finally {
            setSearching(false);
        }
    };

    const handleConfirm = () => {
        if (nitConsultado && nombreEncontrado) {
            onSuccess({
                nit: nitConsultado,
                nombre: nombreEncontrado
            });
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 600 }}>Buscar Cliente por NIT</DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={3} py={1}>
                    <Typography variant="body2" color="textSecondary">
                        Ingresa el NIT del cliente para consultar su nombre automáticamente a través de Digifact.
                    </Typography>

                    <form id="buscar-nit-form" onSubmit={handleSubmit(handleConsultar)}>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box display="flex" gap={2} alignItems="flex-start">
                                <Controller
                                    name="nit"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="NIT"
                                            placeholder="Ingresa el NIT"
                                            autoFocus
                                            error={!!errors.nit}
                                            helperText={errors.nit?.message as string}
                                            disabled={searching}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={searching}
                                    sx={{ height: 56, minWidth: 100 }}
                                >
                                    {searching ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
                                </Button>
                            </Box>

                            {searchError && (
                                <Alert severity="error">
                                    {searchError}
                                </Alert>
                            )}

                            {nombreEncontrado && (
                                <TextField
                                    fullWidth
                                    label="Nombre"
                                    value={nombreEncontrado}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    variant="filled"
                                    sx={{ mt: 1 }}
                                    helperText="Nombre obtenido desde Digifact"
                                />
                            )}
                        </Box>
                    </form>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={searching}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirm}
                    disabled={!nitConsultado || !nombreEncontrado || searching}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
