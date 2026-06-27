import { TableRow, TableCell, IconButton, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { formatMoney } from '../../../../core/utils/formatMoney';
import type { VentaProductoInput } from '../../domain/interfaces/venta.interface';

type Props = {
    item: VentaProductoInput;
    onDelete?: () => void;
    isEditable?: boolean;
    isDeleting?: boolean;
};

export default function SaleDetailRow({ item, onDelete, isEditable = true, isDeleting = false }: Props) {
    return (
        <TableRow sx={{ height: 55 }}>
            <TableCell
                sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}
            >
                {item.nombre}
            </TableCell>

            <TableCell align="right">
                {item.cantidad}
            </TableCell>

            <TableCell align="right">
                {formatMoney(item.precio_sugerido || 0)}
            </TableCell>

            <TableCell align="right">
                {formatMoney(item.subtotal || 0)}
            </TableCell>

            <TableCell align="center">
                <IconButton
                    color="error"
                    onClick={onDelete}
                    size="small"
                    disabled={!isEditable || isDeleting}
                >
                    {isDeleting ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />}
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
