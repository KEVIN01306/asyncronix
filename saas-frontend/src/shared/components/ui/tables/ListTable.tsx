import React, { useState, useRef, useEffect } from 'react';
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
    Card,
    CardContent,
    Divider,
    Stack,
    Checkbox,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

export interface Column {
    id: string;
    name: string;
    format?: (value: any, row: any) => React.ReactNode;
}

export interface Action {
    name: string;
    icon: React.ReactNode;
    color?: string;
    onClick: (row: any) => void;
    visible?: (row: any) => boolean;
}

export interface PaginationProps {
    total: number;
    limit: number;
    offset: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newLimit: number) => void;
}

export interface SelectionProps {
    selectedIds: string[];
    onSelectAll?: (checked: boolean) => void;
    onSelectRow?: (id: any, checked: boolean) => void;
    onSelectionChange?: (selectedIds: string[]) => void;
    isAllSelected?: boolean;
    isIndeterminate?: boolean;
    enableMarqueeSelect?: boolean;
}

export interface ListTableProps {
    data: any[];
    columns: Column[];
    actions?: Action[];
    pagination?: PaginationProps;
    selection?: SelectionProps;
    emptyMessage?: string;
}

const ListTable: React.FC<ListTableProps> = ({
    data,
    columns,
    actions,
    pagination,
    selection,
    emptyMessage = 'No hay registros disponibles',
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuRow, setMenuRow] = useState<any>(null);

    // Marquee Drag Selection State
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isMarqueeActive, setIsMarqueeActive] = useState(false);
    const [marqueeBox, setMarqueeBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
    const isMouseDownRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const startPointRef = useRef<{ clientX: number; clientY: number } | null>(null);
    const initialSelectedIdsRef = useRef<string[]>([]);
    const justDraggedMarqueeRef = useRef(false);
    const selectionRef = useRef(selection);
    selectionRef.current = selection;

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setMenuRow(row);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuRow(null);
    };

    // Helper to check array equality to prevent unnecessary React re-renders during mouse move
    const areArraysEqual = (a: string[], b: string[]) => {
        if (a.length !== b.length) return false;
        const setA = new Set(a);
        return b.every((id) => setA.has(id));
    };

    // Marquee Drag Event Listeners
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0 || !selectionRef.current || selectionRef.current.enableMarqueeSelect === false) return;

        const target = event.target as HTMLElement | null;
        if (
            target?.closest('button') ||
            target?.closest('a') ||
            target?.closest('input') ||
            target?.closest('.MuiCheckbox-root') ||
            target?.closest('.MuiIconButton-root') ||
            target?.closest('.MuiTablePagination-root') ||
            target?.closest('.MuiMenu-root') ||
            target?.closest('[role="menuitem"]') ||
            target?.closest('[role="dialog"]')
        ) {
            return;
        }

        isMouseDownRef.current = true;
        hasDraggedRef.current = false;
        startPointRef.current = { clientX: event.clientX, clientY: event.clientY };
        const isModifier = event.shiftKey || event.ctrlKey || event.metaKey;
        initialSelectedIdsRef.current = isModifier ? [...(selectionRef.current.selectedIds || [])] : [];
    };

    useEffect(() => {
        let lastEmittedIds: string[] = [];

        const handleMouseMove = (event: MouseEvent) => {
            if (!isMouseDownRef.current || !startPointRef.current || !containerRef.current) return;

            const start = startPointRef.current;
            const currentX = event.clientX;
            const currentY = event.clientY;

            const dx = currentX - start.clientX;
            const dy = currentY - start.clientY;
            const distance = Math.hypot(dx, dy);

            if (distance > 4) {
                // Prevent native browser text selection highlight
                event.preventDefault();
                hasDraggedRef.current = true;
                setIsMarqueeActive(true);

                const minX = Math.min(start.clientX, currentX);
                const maxX = Math.max(start.clientX, currentX);
                const minY = Math.min(start.clientY, currentY);
                const maxY = Math.max(start.clientY, currentY);

                setMarqueeBox({
                    left: minX,
                    top: minY,
                    width: maxX - minX,
                    height: maxY - minY,
                });

                const rowElements = containerRef.current.querySelectorAll<HTMLElement>(
                    '[data-selectable-row-id], [data-row-id], .selectable-table-row, .selectable-card-row'
                );
                const intersectedIds = new Set<string>(initialSelectedIdsRef.current.map(String));

                rowElements.forEach((el) => {
                    const rawId = el.getAttribute('data-selectable-row-id') || el.getAttribute('data-row-id');
                    if (!rawId) return;
                    const id = String(rawId);

                    let rect = el.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) {
                        const cells = el.querySelectorAll('td');
                        if (cells.length > 0) {
                            const first = cells[0].getBoundingClientRect();
                            const last = cells[cells.length - 1].getBoundingClientRect();
                            rect = {
                                left: first.left,
                                top: first.top,
                                right: last.right,
                                bottom: Math.max(first.bottom, last.bottom),
                                width: last.right - first.left,
                                height: Math.max(first.bottom, last.bottom) - first.top,
                            } as DOMRect;
                        }
                    }

                    // Ignore elements with no visible dimensions (e.g. hidden responsive view)
                    if (rect.width === 0 || rect.height === 0) return;

                    const intersects = (
                        minX <= rect.right &&
                        maxX >= rect.left &&
                        minY <= rect.bottom &&
                        maxY >= rect.top
                    );

                    if (intersects) {
                        intersectedIds.add(id);
                    } else if (!initialSelectedIdsRef.current.map(String).includes(id)) {
                        intersectedIds.delete(id);
                    }
                });

                const newIds = Array.from(intersectedIds);
                const currentIds = (selectionRef.current?.selectedIds || []).map(String);

                if (!areArraysEqual(newIds, currentIds) && !areArraysEqual(newIds, lastEmittedIds)) {
                    lastEmittedIds = newIds;

                    if (selectionRef.current?.onSelectionChange) {
                        selectionRef.current.onSelectionChange(newIds);
                    } else if (selectionRef.current?.onSelectRow) {
                        newIds.forEach((id) => {
                            if (!currentIds.includes(id)) selectionRef.current?.onSelectRow?.(id, true);
                        });
                        currentIds.forEach((id) => {
                            if (!newIds.includes(id)) selectionRef.current?.onSelectRow?.(id, false);
                        });
                    }
                }
            }
        };

        const handleMouseUp = () => {
            if (isMouseDownRef.current) {
                if (hasDraggedRef.current) {
                    justDraggedMarqueeRef.current = true;
                    setTimeout(() => {
                        justDraggedMarqueeRef.current = false;
                        hasDraggedRef.current = false;
                    }, 200);
                }
                isMouseDownRef.current = false;
                startPointRef.current = null;
                setIsMarqueeActive(false);
                setMarqueeBox(null);
                lastEmittedIds = [];
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: false });
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleContainerClickCapture = (e: React.MouseEvent) => {
        if (justDraggedMarqueeRef.current || hasDraggedRef.current) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    const primaryColumn = columns[0];
    const secondaryColumns = columns.slice(1);

    const isAllSelected = selection ? (selection.isAllSelected ?? (data.length > 0 && selection.selectedIds.length === data.length)) : false;
    const isIndeterminate = selection ? (selection.isIndeterminate ?? (selection.selectedIds.length > 0 && selection.selectedIds.length < data.length)) : false;

    return (
        <Box
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onClickCapture={handleContainerClickCapture}
            sx={{
                width: '100%',
                mb: 4,
                position: 'relative',
                userSelect: isMarqueeActive ? 'none' : 'auto',
            }}
        >
            {/* Visual Marquee Selection Box (Fixed to Viewport to prevent layout shift bugs) */}
            {isMarqueeActive && marqueeBox && (
                <Box
                    sx={{
                        position: 'fixed',
                        left: `${marqueeBox.left}px`,
                        top: `${marqueeBox.top}px`,
                        width: `${marqueeBox.width}px`,
                        height: `${marqueeBox.height}px`,
                        backgroundColor: 'rgba(59, 130, 246, 0.18)',
                        border: '1.5px solid rgba(59, 130, 246, 0.9)',
                        borderRadius: '6px',
                        pointerEvents: 'none',
                        zIndex: 9999,
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
                    }}
                />
            )}

            {/* Desktop / Tablet Table View (Medium screens and up) */}
            <Paper
                elevation={0}
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: '100%',
                    overflowX: 'auto',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none',
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
                                {selection && (
                                    <TableCell padding="checkbox" sx={{ width: 48, pl: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                        <Checkbox
                                            size="small"
                                            checked={isAllSelected}
                                            indeterminate={isIndeterminate}
                                            onChange={(e) => selection.onSelectAll?.(e.target.checked)}
                                            sx={{ p: 0.5 }}
                                        />
                                    </TableCell>
                                )}
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
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + (actions && actions.length > 0 ? 1 : 0) + (selection ? 1 : 0)}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            {emptyMessage}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row, index) => {
                                    const rowId = row.id !== undefined && row.id !== null ? String(row.id) : String(index);
                                    const isSelected = Boolean(selection?.selectedIds?.map(String).includes(rowId));
                                    return (
                                        <TableRow
                                            key={row.id || index}
                                            selected={isSelected}
                                            data-selectable-row-id={rowId}
                                            data-row-id={rowId}
                                            className="selectable-table-row"
                                            sx={{
                                                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                                                '&:hover': {
                                                    backgroundColor: isSelected
                                                        ? (theme) =>
                                                            theme.palette.mode === 'dark'
                                                                ? 'rgba(59, 130, 246, 0.14)'
                                                                : 'rgba(59, 130, 246, 0.08)'
                                                        : (theme) => theme.palette.action.hover,
                                                },
                                                transition: 'background-color 0.2s',
                                                ...(isSelected && {
                                                    bgcolor: (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(59, 130, 246, 0.08)'
                                                            : 'rgba(59, 130, 246, 0.04)',
                                                }),
                                            }}
                                        >
                                            {selection && (
                                                <TableCell padding="checkbox" sx={{ pl: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                                    <Checkbox
                                                        size="small"
                                                        checked={isSelected}
                                                        onChange={(e) => selection.onSelectRow?.(row.id ?? rowId, e.target.checked)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{ p: 0.5 }}
                                                    />
                                                </TableCell>
                                            )}
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    sx={{
                                                        py: 2,
                                                        maxWidth: 220,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                                                    }}
                                                >
                                                    <Box sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.85rem' }}>
                                                        {column.format ? column.format(row[column.id], row) : row[column.id]}
                                                    </Box>
                                                </TableCell>
                                            ))}
                                            {actions && actions.length > 0 && (
                                                <TableCell align="right" sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                                    <IconButton onClick={(event) => handleMenuOpen(event, row)} size="small">
                                                        <MoreVert sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
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
                            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                            },
                            overflow: 'hidden',
                        }}
                    />
                )}
            </Paper>

            {/* Mobile Cards View (Small screens: xs to sm) */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {data.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            border: (theme) => `1px dashed ${theme.palette.divider}`,
                            borderRadius: 1,
                            backgroundColor: 'background.paper',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {emptyMessage}
                        </Typography>
                    </Paper>
                ) : (
                    <Stack spacing={1.75}>
                        {data.map((row, index) => {
                            const rowId = row.id !== undefined && row.id !== null ? String(row.id) : String(index);
                            const isSelected = Boolean(selection?.selectedIds?.map(String).includes(rowId));
                            return (
                                <Card
                                    key={row.id || index}
                                    data-selectable-row-id={rowId}
                                    data-row-id={rowId}
                                    className="selectable-card-row"
                                    elevation={0}
                                    sx={{
                                        border: (theme) =>
                                            `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                                        borderRadius: 1.5,
                                        backgroundColor: isSelected
                                            ? (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(59, 130, 246, 0.08)'
                                                    : 'rgba(59, 130, 246, 0.04)'
                                            : 'background.paper',
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            borderColor: (theme) =>
                                                isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        {/* Card Header: Checkbox + Primary Column Value + Action Menu */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, pr: 1, minWidth: 0 }}>
                                                {selection && (
                                                    <Checkbox
                                                        size="small"
                                                        checked={isSelected}
                                                        onChange={(e) => selection.onSelectRow?.(row.id ?? rowId, e.target.checked)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{ p: 0, mt: 0.25 }}
                                                    />
                                                )}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    {primaryColumn && (
                                                        <>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.04rem',
                                                                    display: 'block',
                                                                    mb: 0.25,
                                                                }}
                                                            >
                                                                {primaryColumn.name}
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    color: 'text.primary',
                                                                    fontWeight: 500,
                                                                    fontSize: '0.9rem',
                                                                    wordBreak: 'break-word',
                                                                }}
                                                            >
                                                                {primaryColumn.format
                                                                    ? primaryColumn.format(row[primaryColumn.id], row)
                                                                    : (row[primaryColumn.id] ?? '-')}
                                                            </Box>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                            {actions && actions.length > 0 && (
                                                <IconButton
                                                    onClick={(event) => handleMenuOpen(event, row)}
                                                    size="small"
                                                    sx={{
                                                        mt: -0.5,
                                                        mr: -0.5,
                                                        color: 'text.secondary',
                                                        '&:hover': {
                                                            backgroundColor: (theme) => theme.palette.action.hover,
                                                            color: 'text.primary',
                                                        },
                                                    }}
                                                    aria-label="actions"
                                                >
                                                    <MoreVert sx={{ fontSize: 20 }} />
                                                </IconButton>
                                            )}
                                        </Box>

                                        {/* Secondary Columns Grid / List */}
                                        {secondaryColumns.length > 0 && (
                                            <>
                                                <Divider sx={{ my: 1.25, borderColor: (theme) => theme.palette.divider }} />
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                                    {secondaryColumns.map((column) => (
                                                        <Box
                                                            key={column.id}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                py: 0.4,
                                                                gap: 1.5,
                                                                borderBottom: (theme) => `1px dashed ${theme.palette.divider}`,
                                                                '&:last-child': { borderBottom: 'none' },
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.03rem',
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {column.name}
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    color: 'text.primary',
                                                                    fontWeight: 500,
                                                                    fontSize: '0.85rem',
                                                                    textAlign: 'right',
                                                                    wordBreak: 'break-word',
                                                                }}
                                                            >
                                                                {column.format
                                                                    ? column.format(row[column.id], row)
                                                                    : (row[column.id] ?? '-')}
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                )}

                {/* Mobile Pagination */}
                {pagination && (
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            backgroundColor: 'background.paper',
                            overflow: 'hidden',
                        }}
                    >
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
                                '.MuiTablePagination-toolbar': {
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    px: 1,
                                    py: 0.5,
                                },
                                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                },
                            }}
                        />
                    </Paper>
                )}
            </Box>

            {/* Actions Menu (Shared between Desktop Table and Mobile Cards) */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        minWidth: 160,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        boxShadow: (theme) => theme.shadows[4],
                    },
                }}
            >
                {actions?.map((action, index) => {
                    const isVisible = !action.visible || (menuRow ? action.visible(menuRow) : true);
                    if (!isVisible) return null;
                    return (
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
                    );
                })}
            </Menu>
        </Box>
    );
};

export default ListTable;