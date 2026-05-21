import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper } from '@mui/material';
import SaleDetailRow from './SaleDetailRow';
import type { VentaProductoInput } from '../../domain/interfaces/venta.interface';

type Props = {
    items: VentaProductoInput[];
    onDelete: (index: number) => void;
    isEditable?: boolean;
};

export default function SaleProductsTable({ items, onDelete, isEditable = true }: Props) {
    return (
        <TableContainer component={Paper} variant="outlined" elevation={0}>
            <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                        <TableCell><strong>Producto</strong></TableCell>
                        <TableCell align="right"><strong>Cant.</strong></TableCell>
                        <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                        <TableCell align="right"><strong>Subtotal</strong></TableCell>
                        <TableCell align="center"><strong>Acción</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((it, idx) => (
                        <SaleDetailRow key={it.producto_id + '-' + idx} item={it} onDelete={() => onDelete(idx)} isEditable={isEditable} />
                    ))}
                    {items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">No se han agregado productos a la venta</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
