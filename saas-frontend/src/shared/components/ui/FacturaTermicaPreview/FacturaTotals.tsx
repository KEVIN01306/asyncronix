import { Box, Typography } from '@mui/material';
import type { FacturaTermicaData } from '../../../interfaces/factura-termica.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

interface Props {
    data: FacturaTermicaData;
}

export const FacturaTotals = ({ data }: Props) => {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>DESCUENTO:</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>{formatMoney(data.descuento)}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>IVA:</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>{formatMoney(data.iva)}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', fontSize: '17px' }}>TOTAL:</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', fontSize: '17px' }}>{formatMoney(data.total)}</Typography>
            </Box>

            <Box mb={2}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    TOTAL EN LETRAS:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.2 }}>
                    {data.total_letras}
                </Typography>
            </Box>

            {(data.efectivo_recibido !== undefined && data.efectivo_recibido !== null) && (
                <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>TOTAL RECIBIDO:</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>{formatMoney(data.efectivo_recibido)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>CAMBIO:</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>{formatMoney(data.cambio || 0)}</Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
