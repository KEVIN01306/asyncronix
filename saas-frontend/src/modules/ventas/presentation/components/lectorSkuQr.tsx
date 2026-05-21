import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

type QrProductScannerProps = {
    open: boolean;
    onClose: () => void;
    onCodigoLeido: (sku: string) => void;
};

export default function QrProductScanner({ open, onClose, onCodigoLeido }: QrProductScannerProps) {
    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;
        let timeoutId: number | null = null;

        if (!open) return;

        const initializeScanner = () => {
            const readerElement = document.getElementById('qr-reader');
            if (!readerElement) {
                timeoutId = window.setTimeout(initializeScanner, 100);
                return;
            }

            scanner = new Html5QrcodeScanner('qr-reader', {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            }, false);

            scanner.render(
                (decodedText) => {
                    toast.success(`Producto escaneado: ${decodedText}`);
                    onCodigoLeido(decodedText);
                    scanner?.clear().catch(error => console.error('Error al limpiar el escáner', error));
                    onClose();
                },
                () => {
                }
            );
        };

        timeoutId = window.setTimeout(initializeScanner, 50);

        return () => {
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
            if (scanner) {
                scanner.clear().catch(error => console.error('Error al limpiar el escáner', error));
            }
        };
    }, [open, onClose, onCodigoLeido]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Escáner de SKU</DialogTitle>
            <DialogContent>
                <Typography sx={{ mb: 2 }}>
                    Acerca la cámara al código QR o de barras del producto para capturar el SKU.
                </Typography>
                <Box id="qr-reader" sx={{ width: '100%', minHeight: 320 }} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancelar</Button>
            </DialogActions>
        </Dialog>
    );
}
