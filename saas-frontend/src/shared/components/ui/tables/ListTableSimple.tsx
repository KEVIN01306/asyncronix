import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';


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
}


export const ListTableSimple = ({ columns, data, headerBgColor = '#1565c0', headerTextColor = '#ffffff' }: Props) => {
    return (
        <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: headerBgColor }}>
                        {columns.map((col) => (
                            <TableCell
                                key={col.id}
                                sx={{
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
    );
}