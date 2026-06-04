import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    MenuItem,
    Menu,
    Typography,
    TablePagination,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

interface Column {
    id: string;
    name: string;
    format?: (value: any, row: any) => React.ReactNode;
}

interface Action {
    name: string;
    icon: React.ReactNode;
    color?: string;
    onClick: (row: any) => void;
    visible?: (row: any) => boolean;
}

interface PaginationProps {
    total: number;
    limit: number;
    offset: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newLimit: number) => void;
}

interface ListTableProps {
    data: any[];
    columns: Column[];
    actions?: Action[];
    pagination?: PaginationProps;
}

const ListTable: React.FC<ListTableProps> = ({
    data,
    columns,
    actions,
    pagination
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuRow, setMenuRow] = useState<any>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
        setAnchorEl(event.currentTarget);
        setMenuRow(row);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuRow(null);
    };

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Paper 
            sx={{ 
                width: '100%', 
                overflowX: 'auto', 
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: 'none' 
            }}
        >
            <TableContainer
                sx={{
                    backgroundColor: 'background.paper',
                    overflowX: 'auto',
                    width: '100%',
                }}
            >
                <Table sx={{ width: '100%', minWidth: 650, tableLayout: 'auto' }} aria-label="list table">
                    <TableHead sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                        <TableRow sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05rem',
                                        py: 2,
                                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {column.name}
                                </TableCell>
                            ))}
                            {actions && actions.length > 0 && (
                                <TableCell align="right" sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
                                        ACCIÓN
                                    </Typography>
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow
                                key={row.id || index}
                                sx={{
                                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                                    '&:hover': { backgroundColor: (theme) => theme.palette.action.hover },
                                    transition: 'background-color 0.2s',

                                }}
                            >
                                {columns.map((column) => (
                                    <TableCell key={column.id} sx={{ py: 2, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Box sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.85rem' }}>
                                            {column.format ? column.format(row[column.id], row) : row[column.id]}
                                        </Box>
                                    </TableCell>
                                ))}
                                {actions && actions.length > 0 && (
                                    <TableCell align="right">
                                        <IconButton onClick={(event) => handleMenuOpen(event, row)} size="small">
                                            <MoreVert sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
                {pagination && (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={pagination.total}
                        rowsPerPage={pagination.limit}
                        page={Math.floor(pagination.offset / pagination.limit)}
                        onPageChange={(_, newPage) => pagination.onPageChange(newPage)}
                        onRowsPerPageChange={(event) => pagination.onRowsPerPageChange(parseInt(event.target.value, 10))}
                        labelRowsPerPage="Filas:"
                        sx={{
                            borderTop: '1px solid #f1f5f9',
                            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                            },
                            overflow: 'hidden',
                        }}
                    />
                )}

            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        boxShadow: '0 5px 5px -3px rgba(0,0,0,0.1)',
                        borderRadius: '2px',
                        minWidth: 160,
                        border: '1px solid #dadada'
                    }
                }}
            >
                {actions?.map((action, index) => {
                    const isVisible = !action.visible || (menuRow ? action.visible(menuRow) : true);
                    if (!isVisible) return null;
                    return (
                        <>
                            <MenuItem
                                key={index}
                                onClick={() => {
                                    action.onClick(menuRow);
                                    handleMenuClose();
                                }}
                                sx={{ fontSize: '0.85rem', gap: 1.5, color: action.color || 'inherit' }}
                            >
                                {action.icon}
                                {action.name}
                            </MenuItem>
                            
                        </>
                    );
                })}
            </Menu>
        </Box>
    );
};

export default ListTable;