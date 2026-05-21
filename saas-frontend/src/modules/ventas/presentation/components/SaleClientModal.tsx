import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox, Box } from '@mui/material';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: { nit?: string | null, cf: boolean }) => void;
};

export default function SaleClientModal({ open, onClose, onConfirm }: Props) {
    const [nit, setNit] = useState('');
    const [cf, setCf] = useState(false);

    const handleConfirm = () => {
        onConfirm({ nit: nit || null, cf });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Cliente de la Venta</DialogTitle>
            <DialogContent>
                <Box mt={1}>
                    <TextField fullWidth label="NIT (mock)" value={nit} onChange={(e) => setNit(e.target.value)} disabled={cf} />
                </Box>
                <Box mt={2}>
                    <FormControlLabel control={<Checkbox checked={cf} onChange={(e) => setCf(e.target.checked)} />} label="Consumidor Final (C/F)" />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained">Confirmar</Button>
            </DialogActions>
        </Dialog>
    );
}
