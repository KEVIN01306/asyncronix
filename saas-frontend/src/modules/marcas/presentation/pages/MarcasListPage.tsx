import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper, TableContainer, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { marcasRepository } from '../../infrastructure/marcas.repository';
import { Visibility } from '@mui/icons-material';

const MarcasListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [ { id: 'marca', name: 'Marca' } ];

    const actions = [ { name: 'Ver',icon:  <Visibility fontSize="small" /> , onClick: (row: any) => navigate(`/marcas/${row.id}`) } ];

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await marcasRepository.listar(limit, offset);
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [limit, offset]);

    useEffect(() => { fetch(); }, [fetch]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Box component={Paper} sx={{ p: 2, mb: 2 }}>Catálogo global de marcas</Box>
            <TableContainer>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
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

export default MarcasListPage;
