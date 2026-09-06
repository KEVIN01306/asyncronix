import { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, MenuItem, Select, FormControl, InputLabel, TextField, CircularProgress } from '@mui/material';
import { formatMoney } from '../../../../core/utils/formatMoney';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (payload: { metodo: string; efectivo_recibido: number | null; vuelto: number | null }) => void;
    total: number;
    clienteLabel: string;
    loading?: boolean;
};

export default function FormaPagoModal({ open, onClose, onConfirm, total, clienteLabel, loading = false }: Props) {
    const [metodo, setMetodo] = useState('EFECTIVO');
    const [efectivoRecibido, setEfectivoRecibido] = useState<string>('');

    const vuelto = useMemo(() => {
        const valor = Number(efectivoRecibido || 0);
        return Number.isFinite(valor) ? valor - total : 0;
    }, [efectivoRecibido, total]);

    const handleConfirm = () => {
        const recibido = metodo === 'EFECTIVO' ? Number(efectivoRecibido || 0) : 0;
        const vueltoFinal = metodo === 'EFECTIVO' ? Math.max(0, recibido - total) : null;
        onConfirm({ metodo, efectivo_recibido: metodo === 'EFECTIVO' ? recibido : null, vuelto: vueltoFinal });
    };

    const isCashInvalid = metodo === 'EFECTIVO' && Number(efectivoRecibido || 0) < total;

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (loading || isCashInvalid) return;
                e.preventDefault();
                handleConfirm();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, loading, isCashInvalid, handleConfirm]);

    return (
        <Dialog key={open ? 'open' : 'closed'} open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Finalizar Venta</DialogTitle>
            <DialogContent>
                <Box mt={1}>
                    <Typography>Cliente: {clienteLabel}</Typography>
                    <Typography mt={1}>Total: {formatMoney(total)}</Typography>
                </Box>

                <Box mt={2}>
                    <FormControl fullWidth>
                        <InputLabel>Método de Pago</InputLabel>
                        <Select value={metodo} label="Método de Pago" onChange={(e) => setMetodo(e.target.value)}>
                            <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                            <MenuItem value="TARJETA">Tarjeta</MenuItem>
                            <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                            <MenuItem value="OTRO">Otro</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                {metodo === 'EFECTIVO' && (
                    <Box mt={2} display="grid" gap={1}>
                        <TextField
                            fullWidth
                            label="Efectivo recibido"
                            type="number"
                            value={efectivoRecibido}
                            onChange={(e) => setEfectivoRecibido(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isCashInvalid && !loading) {
                                    e.preventDefault();
                                    handleConfirm();
                                }
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                        <Typography variant="body2" color={isCashInvalid ? 'error' : 'text.secondary'}>
                            Vuelto: {formatMoney(vuelto)}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={isCashInvalid || loading}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirmar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
