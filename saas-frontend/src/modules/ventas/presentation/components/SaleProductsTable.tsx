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
        <TableContainer
            component={Paper}
            variant="outlined"
            elevation={0}
            sx={{
                width: '100%',
                overflowX: 'auto',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
            }}
        >
            <Table
                sx={{ width: '100%', minWidth: 650, tableLayout: 'auto' }}
            >
                <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow sx={{ height: 55 }}>
                        <TableCell
                            sx={{
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            Producto
                        </TableCell>

                        <TableCell
                            align="right"
                            sx={{
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            Cant.
                        </TableCell>

                        <TableCell
                            align="right"
                            sx={{
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            Precio Unit.
                        </TableCell>

                        <TableCell
                            align="right"
                            sx={{
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            Subtotal
                        </TableCell>

                        <TableCell
                            align="center"
                            sx={{
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            Acción
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {items.map((it, idx) => (
                        <SaleDetailRow
                            key={it.producto_id + '-' + idx}
                            item={it}
                            onDelete={() => onDelete(idx)}
                            isEditable={isEditable}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
