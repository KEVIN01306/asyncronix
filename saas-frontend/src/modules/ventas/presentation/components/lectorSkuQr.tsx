import { useEffect, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';

type QrProductScannerProps = {
    open: boolean;
    onClose: () => void;
    onCodigoLeido: (codigo: string) => void;
    inline?: boolean;
};

type CameraDevice = {
    id: string;
    label: string;
};

export default function QrProductScanner({ open, onClose, onCodigoLeido, inline = false }: QrProductScannerProps) {
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        let scanner: Html5QrcodeScanner | null = null;
        let initTimeout: number | null = null;

        const createScanner = () => {
            const readerElement = document.getElementById('qr-reader');
            if (!readerElement) {
                initTimeout = window.setTimeout(createScanner, 100);
                return;
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                videoConstraints: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : { facingMode: 'environment' }
            };

            scanner = new Html5QrcodeScanner('qr-reader', config, false);
            scanner.render(
                (decodedText) => {
                    toast.success(`Código escaneado: ${decodedText}`);
                    onCodigoLeido(decodedText);
                    scanner?.clear().catch(error => console.error('Error al limpiar el escáner', error));
                    onClose();
                },
                () => {
                    // Ignorar errores de lectura
                }
            );
        };

        createScanner();

        return () => {
            if (initTimeout !== null) {
                window.clearTimeout(initTimeout);
            }
            if (scanner) {
                scanner.clear().catch(error => console.error('Error al limpiar el escáner', error));
            }
        };
    }, [open, selectedCameraId, onClose, onCodigoLeido]);

    useEffect(() => {
        if (!open) return;

        Html5Qrcode.getCameras()
            .then((devices: Array<{ id: string; label: string }>) => {
                const available = devices.map(device => ({ id: device.id, label: device.label || `Cámara ${device.id}` }));
                setCameras(available);
                if (!selectedCameraId && available.length > 0) {
                    const preferred = available.find(device => /back|rear|environment/i.test(device.label));
                    setSelectedCameraId(preferred?.id ?? available[0].id);
                }
            })
            .catch((error: unknown) => {
                console.error('No se pudo obtener la lista de cámaras', error);
            });
    }, [open, selectedCameraId]);

    const content = (
        <Box>
            <Typography sx={{ mb: 2 }}>
                Acerca la cámara al código QR o de barras del producto para capturar el código.
            </Typography>
            {cameras.length > 1 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="camera-select-label">Cámara</InputLabel>
                    <Select
                        labelId="camera-select-label"
                        value={selectedCameraId || ''}
                        label="Cámara"
                        onChange={(event) => setSelectedCameraId(event.target.value as string)}
                    >
                        {cameras.map((camera) => (
                            <MenuItem key={camera.id} value={camera.id}>
                                {camera.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
            <Box id="qr-reader" sx={{ width: '100%', minHeight: 320 }} />
        </Box>
    );

    if (inline) {
        return open ? content : null;
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Escáner de código</DialogTitle>
            <DialogContent>
                {content}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancelar</Button>
            </DialogActions>
        </Dialog>
    );
}
