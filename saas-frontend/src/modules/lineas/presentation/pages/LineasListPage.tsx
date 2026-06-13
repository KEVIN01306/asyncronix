import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper, TableContainer, useTheme, useMediaQuery } from '@mui/material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { lineasRepository } from '../../infrastructure/lineas.repository';
import { Visibility } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const LineasListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [ { id: 'linea', name: 'Línea' } ];

    const actions = [ { name: 'Ver',icon:  <Visibility fontSize="small" /> , onClick: (row: any) => navigate(`/lineas/${row.id}`) } ];

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await lineasRepository.listar(limit, offset);
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [limit, offset]);

    useEffect(() => { fetch(); }, [fetch]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Box component={Paper} sx={{ p: 2, mb: 2 }}>Catálogo global de líneas</Box>
            <TableContainer>
                {loading ? (
                    <Loading />
                ) : (
                    <ListTable
                        data={items}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => {
                                const newOffset = newPage * limit;
                                setSearchParams({ limit: limit.toString(), offset: newOffset.toString() });
                            },
                            onRowsPerPageChange: (newLimit) => {
                                setSearchParams({ limit: newLimit.toString(), offset: '0' });
                            },
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default LineasListPage;
