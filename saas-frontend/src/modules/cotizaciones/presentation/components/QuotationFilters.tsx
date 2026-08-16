import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, FormControl, InputLabel, Select, MenuItem, TextField, Grid
} from '@mui/material';
import { useState } from 'react';
import { EstadoCotizacion } from '../../domain/interfaces/cotizacion.interface';

interface Props {
    open: boolean;
    onClose: () => void;
    currentEstado: string | null;
    currentClienteId: string | null;
    onApply: (estado: string | null, clienteId: string | null) => void;
}

export default function QuotationFilters({ open, onClose, currentEstado, currentClienteId, onApply }: Props) {
    const [estado, setEstado] = useState<string>(currentEstado || '');
    const [clienteId, setClienteId] = useState<string>(currentClienteId || '');

    const handleApply = () => {
        onApply(estado || null, clienteId || null);
        onClose();
    };

    const handleClear = () => {
        setEstado('');
        setClienteId('');
        onApply(null, null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Filtros</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={estado}
                                label="Estado"
                                onChange={(e) => setEstado(e.target.value)}
                            >
                                <MenuItem value=""><em>Todos</em></MenuItem>
                                <MenuItem value={EstadoCotizacion.PENDIENTE}>Pendiente</MenuItem>
                                <MenuItem value={EstadoCotizacion.ACEPTADA}>Aceptada</MenuItem>
                                <MenuItem value={EstadoCotizacion.RECHAZADA}>Rechazada</MenuItem>
                                <MenuItem value={EstadoCotizacion.VENCIDA}>Vencida</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="ID del Cliente"
                            value={clienteId}
                            onChange={(e) => setClienteId(e.target.value)}
                            helperText="Opcional: ID de cliente exacto para filtrar"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClear} color="error">Limpiar Filtros</Button>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={handleApply} variant="contained" color="primary">Aplicar</Button>
            </DialogActions>
        </Dialog>
    );
}
