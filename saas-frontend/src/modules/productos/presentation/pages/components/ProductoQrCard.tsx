import { Button, Card, CardContent, Divider, Stack, Typography, Box } from '@mui/material';
import { QrCode, Print, Download } from '@mui/icons-material';

interface ProductoQrCardProps {
    qrImageSource?: string;
    sku: string;
    generatingQr: boolean;
    onGenerateQr: () => void;
    onPrintQr: () => void;
    onDownloadQr: () => void;
}

const ProductoQrCard = ({ qrImageSource, generatingQr, onGenerateQr, onPrintQr, onDownloadQr }: ProductoQrCardProps) => (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
            <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Código QR
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {qrImageSource ? (
                <Stack spacing={2} alignItems="center">
                    <Box
                        component="img"
                        src={qrImageSource}
                        alt="QR Código"
                        sx={{ width: '100%', maxWidth: 260, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
                    />
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                        <Button variant="outlined" startIcon={<Print />} onClick={onPrintQr}>
                            Imprimir
                        </Button>
                        <Button variant="contained" startIcon={<Download />} onClick={onDownloadQr}>
                            Descargar
                        </Button>
                    </Stack>
                </Stack>
            ) : (
                <Stack spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: '100%',
                            height: 220,
                            bgcolor: 'background.default',
                            borderRadius: 2,
                            border: (theme) => `1px dashed ${theme.palette.divider}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            p: 2
                        }}
                    >
                        <QrCode sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            El producto no tiene un QR generado.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Genera el código para imprimirlo o descargarlo.
                        </Typography>
                    </Box>
                    <Button variant="contained" fullWidth startIcon={<QrCode />} onClick={onGenerateQr} disabled={generatingQr}>
                        {generatingQr ? 'Generando...' : 'Crear QR'}
                    </Button>
                </Stack>
            )}
        </CardContent>
    </Card>
);

export default ProductoQrCard;
