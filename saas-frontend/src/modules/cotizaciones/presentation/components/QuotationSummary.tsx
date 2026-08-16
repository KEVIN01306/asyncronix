import { Paper, Typography, Box, Divider } from '@mui/material';
import { formatMoney } from '../../../../core/utils/formatMoney';

interface Props {
    subtotal: number;
    descuento_total: number;
    total: number;
}

const QuotationSummary = ({ subtotal, descuento_total, total }: Props) => {
    return (
        <Paper variant="outlined" sx={{ p: 2, minWidth: 250 }}>
            <Typography variant="h6" gutterBottom>
                Resumen
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Subtotal:</Typography>
                <Typography>{formatMoney(subtotal)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="error.main">Descuento:</Typography>
                <Typography color="error.main">-{formatMoney(descuento_total)}</Typography>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                <Typography variant="subtitle1" fontWeight="bold">{formatMoney(total)}</Typography>
            </Box>
        </Paper>
    );
};

export default QuotationSummary;
