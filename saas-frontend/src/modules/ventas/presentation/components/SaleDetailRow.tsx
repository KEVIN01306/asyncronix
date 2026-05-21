import { TableRow, TableCell, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { formatMoney } from '../../../../core/utils/formatMoney';
import type { VentaProductoInput } from '../../domain/interfaces/venta.interface';

type Props = {
    item: VentaProductoInput;
    onDelete?: () => void;
    isEditable?: boolean;
};

export default function SaleDetailRow({ item, onDelete, isEditable = true }: Props) {
    return (
        <TableRow>
            <TableCell>{item.nombre}</TableCell>
            <TableCell align="right">{item.cantidad}</TableCell>
            <TableCell align="right">{formatMoney(item.precio_sugerido || 0)}</TableCell>
            <TableCell align="right">{formatMoney(item.subtotal || 0)}</TableCell>
            <TableCell align="center">
                <IconButton color="error" onClick={onDelete} size="small" disabled={!isEditable}>
                    <DeleteIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
