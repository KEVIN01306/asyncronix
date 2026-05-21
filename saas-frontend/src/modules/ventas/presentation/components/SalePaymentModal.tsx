import  { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { formatMoney } from '../../../../core/utils/formatMoney';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (metodo: string) => void;
    total: number;
    clienteLabel: string;
};

export default function SalePaymentModal({ open, onClose, onConfirm, total, clienteLabel }: Props) {
    const [metodo, setMetodo] = useState('EFECTIVO');

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
                            <MenuItem value="TARJETA_CREDITO">Tarjeta Crédito</MenuItem>
                            <MenuItem value="TARJETA_DEBITO">Tarjeta Débito</MenuItem>
                            <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                            <MenuItem value="OTROS">Otros</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onConfirm(metodo)} variant="contained">Confirmar</Button>
            </DialogActions>
        </Dialog>
    );
}
