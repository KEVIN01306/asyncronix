import React, { useState, useRef, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Chip
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export interface Column {
    id: string;
    name: string;
    format?: (value: any, row?: any) => React.ReactNode;
}

export interface Props {
    columns: Column[];
    data: any[];
    headerBgColor?: string;
    headerTextColor?: string;
    disableVerticalScroll?: boolean;
    maxTableHeight?: number | string;
}

export const ListTableSimple = ({
    columns,
    data,
    headerBgColor = '#1565c0',
    headerTextColor = '#ffffff',
    disableVerticalScroll = false,
    maxTableHeight = 520,
}: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);

    const checkScroll = () => {
        if (disableVerticalScroll || !containerRef.current) {
            setShowScrollIndicator(false);
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const hasMoreToScroll = scrollHeight - scrollTop - clientHeight > 5;

        setShowScrollIndicator(hasMoreToScroll);
    };

    useEffect(() => {
        const handleInitialCheck = requestAnimationFrame(() => {
            checkScroll();
        });

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }

        return () => {
            cancelAnimationFrame(handleInitialCheck);
            if (container) {
                container.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, [data, disableVerticalScroll]);

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            <TableContainer
                ref={containerRef}
                component={Paper}
                sx={{
                    overflowX: 'auto',
                    overflowY: disableVerticalScroll ? 'visible' : 'auto',
                    maxHeight: disableVerticalScroll ? 'none' : maxTableHeight,
                }}
            >
                <Table stickyHeader={!disableVerticalScroll} sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell
                                    key={col.id}
                                    sx={{
                                        backgroundColor: headerBgColor,
                                        color: headerTextColor,
                                        fontWeight: 'bold',
                                        fontSize: '0.95rem',
                                        borderBottom: 'none'
                                    }}
                                >
                                    {col.name}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data && data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <TableRow
                                    key={row.id || rowIndex}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    {columns.map((col) => {
                                        const value = row[col.id];
                                        return (
                                            <TableCell key={col.id} sx={{ py: 1.5 }}>
                                                {col.format ? col.format(value, row) : (value ?? 'N/A')}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        No hay registros disponibles.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {showScrollIndicator && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        pointerEvents: 'none',
                        animation: 'bounce 2s infinite',
                        '@keyframes bounce': {
                            '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0) translateX(-50%)' },
                            '40%': { transform: 'translateY(-6px) translateX(-50%)' },
                            '60%': { transform: 'translateY(-3px) translateX(-50%)' },
                        },
                    }}
                >
                    <Chip
                        icon={<ArrowDownwardIcon style={{ color: '#fff' }} />}
                        label="Desliza para ver más"
                        sx={{
                            boxShadow: 4,
                            fontWeight: 'bold',
                            backgroundColor: headerBgColor,
                            color: '#ffffff',
                            '& .MuiChip-icon': { marginLeft: '8px' }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};