import React from 'react';
import { TablePagination, Paper, Box } from '@mui/material';

interface PaginationProps {
    total: number;
    limit: number;
    offset: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newLimit: number) => void;
    rowsPerPageOptions?: number[];
}

export const StandalonePagination: React.FC<PaginationProps> = ({
    total,
    limit,
    offset,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 25],
}) => {
    // Calculamos la página actual basándonos en tu lógica de offset / limit
    const currentPage = Math.floor(offset / limit);

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    p: 0.5,
                    // Mantiene consistencia visual con las tablas y inputs de tu tema Apple
                    overflow: 'hidden',
                }}
            >
                <TablePagination
                    component="div"
                    count={total}
                    rowsPerPage={limit}
                    page={currentPage}
                    rowsPerPageOptions={rowsPerPageOptions}
                    labelRowsPerPage="Filas por página:"
                    onPageChange={(_, newPage) => onPageChange(newPage)}
                    onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
                    sx={{
                        border: 'none', // Quitamos el borde nativo porque Paper ya tiene el suyo del tema
                        width: '100%',
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            fontWeight: 500,
                        },
                        '.MuiTablePagination-select': {
                            borderRadius: '8px',
                            paddingY: '4px',
                        },
                        // Estilo para los botones de navegación < >
                        '.MuiIconButton-root': {
                            color: 'text.primary',
                            '&.Mui-disabled': {
                                color: 'text.secondary',
                                opacity: 0.4,
                            },
                        },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default StandalonePagination;