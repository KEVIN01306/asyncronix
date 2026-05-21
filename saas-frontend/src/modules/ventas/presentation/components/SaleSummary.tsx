import { Box, Typography, Button } from '@mui/material';
import { formatMoney } from '../../../../core/utils/formatMoney';

type Props = {
    total: number;
    clienteLabel?: string;
    onFinalize?: () => void;
    disabled?: boolean;
};

export default function SaleSummary({ total, clienteLabel = 'C/F', onFinalize, disabled }: Props) {
    return (
        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mt={3}>
            <Box textAlign="right">
                <Typography variant="body2">Cliente: {clienteLabel}</Typography>
                <Typography variant="h5" fontWeight="bold">Total: {formatMoney(total)}</Typography>
            </Box>
            {onFinalize && (
                <Button variant="contained" color="primary" onClick={onFinalize} disabled={disabled}>
                    Finalizar Venta
                </Button>
            )}
        </Box>
    );
}
