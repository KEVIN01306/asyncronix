import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, TextField, Typography } from '@mui/material';
import QrProductScanner from '../../../ventas/presentation/components/lectorSkuQr';

type Props = { open: boolean; onClose: () => void; onCodigoCaptured: (codigo: string) => void };

export default function CodigoModal({ open, onClose, onCodigoCaptured }: Props) {
    const [tab, setTab] = useState(0);
    const [manual, setManual] = useState('');

    const handleConfirmManual = () => {
        if (manual.trim()) {
            onCodigoCaptured(manual.trim());
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Ingresar o escanear código</DialogTitle>
            <DialogContent>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Escanear" />
                    <Tab label="Manual" />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    {tab === 0 ? (
                        <Box>
                            <Typography sx={{ mb: 2 }}>
                                Usa la cámara para escanear el código de barras del producto.
                            </Typography>
                            <QrProductScanner inline open={open} onClose={onClose} onCodigoLeido={(c) => { onCodigoCaptured(c); onClose(); }} />
                        </Box>
                    ) : (
                        <TextField
                            label="Código"
                            fullWidth
                            value={manual}
                            onChange={(e) => setManual(e.target.value)}
                            helperText="Ingresa el código manualmente si no deseas escanear"
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                {tab === 1 && <Button variant="contained" onClick={handleConfirmManual}>Aceptar</Button>}
            </DialogActions>
        </Dialog>
    );
}
