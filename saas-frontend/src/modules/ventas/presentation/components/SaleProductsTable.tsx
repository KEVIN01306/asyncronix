import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper } from '@mui/material';
import SaleDetailRow from './SaleDetailRow';
import type { VentaProductoInput } from '../../domain/interfaces/venta.interface';

type Props = {
    items: VentaProductoInput[];
    onDelete: (index: number, rowKey: string) => void;
    isEditable?: boolean;
    deletingRows?: Record<string, boolean>;
};

export default function SaleProductsTable({ items, onDelete, isEditable = true, deletingRows = {} }: Props) {
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
                sx={{ width: '100%', minWidth: 300, tableLayout: 'auto' }}
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
                    { items && items.length > 0 ?  items.map((it, idx) => {
                        const rowKey = `${it.producto_id}-${idx}`;
                        return (
                        <SaleDetailRow
                            key={rowKey}
                            item={it}
                            onDelete={() => onDelete(idx, rowKey)}
                            isEditable={isEditable}
                            isDeleting={Boolean(deletingRows[rowKey])}
                        />
                    );
                    }) : 
                    <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            No hay productos agregados
                        </TableCell>
                    </TableRow>
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}
