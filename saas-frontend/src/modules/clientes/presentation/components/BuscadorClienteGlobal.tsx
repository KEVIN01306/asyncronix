import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, InputAdornment, Button, CircularProgress, Chip, Stack, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { Public, Person, Store } from '@mui/icons-material';
import { toast } from 'sonner';
import { clienteRepository } from '../../infrastructure/clientes.repository';
import type { Cliente } from '../../domain/interfaces/cliente.interface';

interface Props {
    selected: Cliente | null;
    localClienteId?: string;
    onSelect: (cliente: Cliente | null) => void;
}

export const BuscadorClienteGlobal = ({ selected, localClienteId, onSelect }: Props) => {
    const [busqueda, setBusqueda] = useState('');
    const [buscando, setBuscando] = useState(false);
    const [resultados, setResultados] = useState<Cliente[]>([]);

    const handleBuscar = async () => {
        const query = busqueda.trim();
        if (!query) {
            toast.error('Ingrese un DPI, NIT o nombre para buscar en la plataforma');
            return;
        }
        setBuscando(true);
        try {
            const res = await clienteRepository.buscarGlobal({
                documento: query,
                q: query,
                limit: 10,
            });
            const lista = res.data || [];
            const filtrados = localClienteId ? lista.filter((c) => c.id !== localClienteId) : lista;
            setResultados(filtrados);
            if (filtrados.length === 0) {
                toast.warning('No se encontraron clientes globales con ese criterio');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error en la búsqueda global');
        } finally {
            setBuscando(false);
        }
    };

    const handleElegir = (cliente: Cliente) => {
        onSelect(cliente);
        setResultados([]);
        toast.success('Cliente global seleccionado');
    };

    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom color="secondary">
                    2. Cliente a Unificar (Búsqueda Global)
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Buscar en toda la plataforma (otros negocios o sin negocio).
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                    <TextField
                        size="small"
                        fullWidth
                        label="DPI, NIT o nombre global"
                        placeholder="Buscar en todos los negocios"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Public fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
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
                            <Person color="secondary" />
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
                ) : resultados.length > 0 ? (
                    <Box sx={{ maxHeight: 240, overflowY: 'auto', border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1 }}>
                        <List dense disablePadding>
                            {resultados.map((c, i) => (
                                <Box key={c.id}>
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={() => handleElegir(c)}>
                                            <ListItemText
                                                primary={`${c.nombre} ${c.apellido || ''}`}
                                                secondary={`DPI: ${c.dpi || 'N/A'} | NIT: ${c.nit || 'N/A'} | Tel: ${c.telefono || 'N/A'}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    {i < resultados.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>
                    </Box>
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                            Ningún cliente global seleccionado.
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
