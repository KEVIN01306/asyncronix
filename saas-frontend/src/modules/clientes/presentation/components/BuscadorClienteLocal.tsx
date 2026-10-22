import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, InputAdornment, Button, CircularProgress, Chip, Stack } from '@mui/material';
import { Search, Person, Store } from '@mui/icons-material';
import { toast } from 'sonner';
import { clienteRepository } from '../../infrastructure/clientes.repository';
import type { Cliente } from '../../domain/interfaces/cliente.interface';

interface Props {
    selected: Cliente | null;
    onSelect: (cliente: Cliente | null) => void;
}

export const BuscadorClienteLocal = ({ selected, onSelect }: Props) => {
    const [busqueda, setBusqueda] = useState('');
    const [buscando, setBuscando] = useState(false);

    const handleBuscar = async () => {
        const query = busqueda.trim();
        if (!query) {
            toast.error('Ingrese un DPI o NIT para buscar');
            return;
        }
        setBuscando(true);
        try {
            const res = await clienteRepository.buscarPorDocumento({
                dpi: query,
                nit: query,
            });
            if (res.data) {
                onSelect(res.data);
                toast.success('Cliente local seleccionado');
            } else {
                toast.warning('No se encontró un cliente asociado a este negocio con ese documento');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al buscar cliente local');
        } finally {
            setBuscando(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom color="primary">
                    1. Cliente de Origen (Negocio Actual)
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Buscar dentro de los clientes ya asociados a este negocio.
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                    <TextField
                        size="small"
                        fullWidth
                        label="DPI o NIT del cliente local"
                        placeholder="Ej: 1234567890101 o 1234567"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleBuscar}
                        disabled={buscando}
                        sx={{ minWidth: 100 }}
                    >
                        {buscando ? <CircularProgress size={20} color="inherit" /> : 'Buscar'}
                    </Button>
                </Box>

                {selected ? (
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: (t) => `1px solid ${t.palette.divider}` }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <Person color="primary" />
                            <Typography variant="subtitle2" fontWeight={700}>
                                {selected.nombre} {selected.apellido || ''}
                            </Typography>
                        </Stack>
                        <Typography variant="caption" display="block"><strong>DPI:</strong> {selected.dpi || 'Sin DPI'}</Typography>
                        <Typography variant="caption" display="block"><strong>NIT:</strong> {selected.nit || 'Sin NIT'}</Typography>
                        <Typography variant="caption" display="block"><strong>Teléfono:</strong> {selected.telefono || 'Sin teléfono'}</Typography>
                        <Typography variant="caption" display="block"><strong>Email:</strong> {selected.email || 'Sin correo'}</Typography>

                        {selected.negocios && selected.negocios.length > 0 && (
                            <Box mt={1}>
                                <Typography variant="caption" color="textSecondary" display="block" mb={0.5}>
                                    Negocios asociados:
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                    {selected.negocios.map((neg) => (
                                        <Chip key={neg.id} size="small" icon={<Store />} label={neg.nombre} variant="outlined" />
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        <Button size="small" color="error" sx={{ mt: 1.5 }} onClick={() => onSelect(null)}>
                            Cambiar selección
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                            Ningún cliente local seleccionado.
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
