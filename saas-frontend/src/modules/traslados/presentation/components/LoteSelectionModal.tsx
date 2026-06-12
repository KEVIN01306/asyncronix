import React from 'react';
import type { Lote } from '../../../../modules/lotes/domain/interfaces/lote.interface';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Box,
    CircularProgress,
} from '@mui/material';

interface LoteSelectionModalProps {
    open: boolean;
    lotes: Lote[];
    loading?: boolean;
    onSelect: (lote: Lote, cantidad: number) => void;
    onClose: () => void;
}

export const LoteSelectionModal: React.FC<LoteSelectionModalProps> = ({
    open,
    lotes,
    loading = false,
    onSelect,
    onClose,
}) => {
    const [cantidad, setCantidad] = React.useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredLotes = lotes.filter(lote =>
        lote.codigo_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lote.variante?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lote.variante?.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (lote: Lote) => {
        const cant = cantidad[lote.id] || 1;
        if (cant > 0 && cant <= lote.cantidad_actual) {
            onSelect(lote, cant);
            setCantidad(prev => {
                const newState = { ...prev };
                delete newState[lote.id];
                return newState;
            });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Seleccionar Lotes</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2, mt: 1 }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por SKU, lote o producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                    />
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'background.paper' }}>
                                    <TableCell><strong>SKU</strong></TableCell>
                                    <TableCell><strong>Producto</strong></TableCell>
                                    <TableCell><strong>Lote</strong></TableCell>
                                    <TableCell align="right"><strong>Disponible</strong></TableCell>
                                    <TableCell align="center"><strong>Cantidad</strong></TableCell>
                                    <TableCell align="center"><strong>Acción</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLotes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                                            Sin resultados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLotes.map(lote => (
                                        <TableRow key={lote.id}>
                                            <TableCell>{lote.variante?.sku || '-'}</TableCell>
                                            <TableCell>{lote.variante?.producto_nombre || '-'}</TableCell>
                                            <TableCell>{lote.codigo_lote}</TableCell>
                                            <TableCell align="right">{lote.cantidad_actual}</TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={cantidad[lote.id] || 1}
                                                    onChange={(e) => setCantidad(prev => ({
                                                        ...prev,
                                                        [lote.id]: parseInt(e.target.value) || 0
                                                    }))}
                                                    inputProps={{
                                                        min: 1,
                                                        max: lote.cantidad_actual,
                                                        style: { width: '60px', textAlign: 'center' }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleSelect(lote)}
                                                    disabled={(cantidad[lote.id] || 0) < 1 || (cantidad[lote.id] || 0) > lote.cantidad_actual}
                                                >
                                                    Agregar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    );
};
