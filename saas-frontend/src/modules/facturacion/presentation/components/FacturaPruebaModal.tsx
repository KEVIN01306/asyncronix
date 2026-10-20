import React, { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Box, 
    Typography, 
    IconButton, 
    ToggleButton, 
    ToggleButtonGroup,
    Chip,
    Alert
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';
import { FacturaTermicaPreview } from '../../../../shared/components/ui/FacturaTermicaPreview';
import type { FacturaTermicaData } from '../../../../shared/interfaces/factura-termica.interface';
import { mockFacturaTermicaData } from '../../../../shared/mocks/factura-termica.mock';
import type { FacturacionConfigData } from '../../domain/interfaces/factura.interface';
import { useAuthStore } from '../../../../core/store/authStore';

interface Props {
    open: boolean;
    onClose: () => void;
    configFiscal: FacturacionConfigData | null;
    sucursal?: any;
    negocio?: any;
}

export const FacturaPruebaModal: React.FC<Props> = ({ 
    open, 
    onClose, 
    configFiscal, 
    sucursal, 
    negocio 
}) => {
    const user = useAuthStore(state => state.user);
    const [ticketWidth, setTicketWidth] = useState<'80mm' | '58mm'>('80mm');

    const handlePrint = () => {
        window.print();
    };

    if (!open) return null;

    // Construcción de datos de prueba identificados claramente
    const testData: FacturaTermicaData = {
        subtotal: mockFacturaTermicaData.subtotal ?? 175.89,
        iva: configFiscal?.afiliacion_iva === 'PEQ' ? 0 : (mockFacturaTermicaData.iva ?? 21.11),
        descuento: mockFacturaTermicaData.descuento ?? 0,
        total: mockFacturaTermicaData.total ?? 197.00,
        total_letras: mockFacturaTermicaData.total_letras ?? 'CIENTO NOVENTA Y SIETE QUETZALES CON 00/100',
        items: (mockFacturaTermicaData.items as any) || [],
        ...mockFacturaTermicaData,
        negocio_nombre: configFiscal?.nombre_comercial || negocio?.nombre_comercial || 'NEGOCIO DE PRUEBA',
        negocio_nit: configFiscal?.nit_emisor || negocio?.nit_rut || 'CF',
        negocio_telefono: sucursal?.telefono || '---',
        sucursal_direccion: sucursal?.direccion || 'Dirección de sucursal de prueba',
        slogan: negocio?.slogan || 'Documento de prueba no válido como factura tributaria',
        atendido_por: user?.nombre || 'Usuario Demo',
        cliente_nombre: 'CONSUMIDOR FINAL (PRUEBA)',
        cliente_nit: 'CF',
        uuid: '00000000-DEMO-TEST-PREVIEW-000000000000',
        serie: 'TEST-01',
        numero: 'PRUEBA-0001',
        fecha_emision: new Date().toISOString(),
        certificador_nombre: 'Digifact S.A. (Ambiente Pruebas)',
        certificador_nit: '77454820',
        frases: configFiscal?.afiliacion_iva === 'PEQ' 
            ? ['PEQUEÑO CONTRIBUYENTE NO GENERA DERECHO A CRÉDITO FISCAL']
            : ['SUJETO A PAGOS TRIMESTRALES ISR']
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    '@media print': {
                        boxShadow: 'none',
                        margin: 0,
                        maxWidth: '100% !important',
                        width: '100% !important'
                    }
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    pb: 1, 
                    '@media print': { display: 'none' } 
                }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight={700}>
                        Preview de Factura Térmica
                    </Typography>
                    <Chip label="Factura de Prueba" size="small" color="warning" sx={{ height: 22 }} />
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2 }}>
                <Box sx={{ '@media print': { display: 'none' }, mb: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Este ticket es generado con datos ficticios con fines de prueba y calibración de impresión. No genera registros en base de datos ni certifica en SAT/Digifact.
                    </Alert>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Ancho del papel térmico:
                        </Typography>
                        <ToggleButtonGroup
                            size="small"
                            value={ticketWidth}
                            exclusive
                            onChange={(_, newWidth) => {
                                if (newWidth) setTicketWidth(newWidth);
                            }}
                        >
                            <ToggleButton value="80mm">80 mm (Estándar)</ToggleButton>
                            <ToggleButton value="58mm">58 mm (Portátil)</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                <Box 
                    sx={{ 
                        backgroundColor: 'grey.100', 
                        p: 2, 
                        borderRadius: 1, 
                        display: 'flex', 
                        justifyContent: 'center',
                        overflowX: 'auto',
                        '@media print': {
                            backgroundColor: 'transparent',
                            p: 0
                        }
                    }}
                >
                    <FacturaTermicaPreview data={testData} width={ticketWidth} />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, '@media print': { display: 'none' } }}>
                <Button onClick={onClose} color="inherit">
                    Cerrar
                </Button>
                <Button 
                    variant="contained" 
                    startIcon={<PrintIcon />} 
                    onClick={handlePrint}
                >
                    Imprimir factura de prueba
                </Button>
            </DialogActions>
        </Dialog>
    );
};
