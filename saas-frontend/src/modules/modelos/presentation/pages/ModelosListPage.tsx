import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper, TableContainer, useTheme, useMediaQuery, Autocomplete, TextField, Chip } from '@mui/material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { modelosRepository } from '../../infrastructure/modelos.repository';
import { marcasRepository } from '../../../marcas/infrastructure/marcas.repository';
import { lineasRepository } from '../../../lineas/infrastructure/lineas.repository';
import { cilindradasRepository } from '../../../cilindradas/infrastructure/cilindradas.repository';
import { Visibility } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ModelosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [marcas, setMarcas] = useState<any[]>([]);
    const [lineas, setLineas] = useState<any[]>([]);
    const [cilindradas, setCilindradas] = useState<any[]>([]);

    const marcaFilters = searchParams.getAll('marca_id');
    const lineaFilters = searchParams.getAll('linea_id');
    const cilindradaFilters = searchParams.getAll('cilindrada_id');

    const columns = [
        { id: 'modelo', name: 'Modelo' },
        { id: 'anio', name: 'Año' },
        { id: 'marca', name: 'Marca' },
        { id: 'linea', name: 'Línea' },
        { id: 'cilindrada', name: 'Cilindrada' },
    ];

    const actions = [ { name: 'Ver',icon:  <Visibility fontSize="small" /> , onClick: (row: any) => navigate(`/modelos/${row.id}`) } ];

    const fetchLists = useCallback(async () => {
        try {
            const [mRes, lRes, cRes] = await Promise.all([
                marcasRepository.listar(100, 0),
                lineasRepository.listar(100, 0),
                cilindradasRepository.listar(100, 0),
            ]);
            setMarcas(mRes.data);
            setLineas(lRes.data);
            setCilindradas(cRes.data);
        } catch (error) { console.error(error); }
    }, []);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const currentMarcaFilters = searchParams.getAll('marca_id');
            const currentLineaFilters = searchParams.getAll('linea_id');
            const currentCilindradaFilters = searchParams.getAll('cilindrada_id');
            const filters: any = {};

            if (currentMarcaFilters.length) filters.marca_id = currentMarcaFilters;
            if (currentLineaFilters.length) filters.linea_id = currentLineaFilters;
            if (currentCilindradaFilters.length) filters.cilindrada_id = currentCilindradaFilters;

            const res = await modelosRepository.listar(limit, offset, filters);
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [limit, offset, searchParams]);

    useEffect(() => { fetchLists(); }, [fetchLists]);
    useEffect(() => { fetch(); }, [fetch]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Box component={Paper} sx={{ p: 2, mb: 2 }}>Catálogo global de modelos</Box>

            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                <Autocomplete
                    multiple
                    options={marcas}
                    getOptionLabel={(option) => option.marca}
                    value={marcas.filter((item) => marcaFilters.includes(item.id))}
                    onChange={(_event, value) => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('marca_id');
                        value.forEach((item) => next.append('marca_id', item.id));
                        next.set('limit', limit.toString());
                        next.set('offset', '0');
                        setSearchParams(next);
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip label={option.marca} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => <TextField {...params} label="Marca" placeholder="Seleccionar marca" />}
                    sx={{ minWidth: 220, flex: 1, maxWidth: 360 }}
                />
                <Autocomplete
                    multiple
                    options={lineas}
                    getOptionLabel={(option) => option.linea}
                    value={lineas.filter((item) => lineaFilters.includes(item.id))}
                    onChange={(_event, value) => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('linea_id');
                        value.forEach((item) => next.append('linea_id', item.id));
                        next.set('limit', limit.toString());
                        next.set('offset', '0');
                        setSearchParams(next);
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip label={option.linea} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => <TextField {...params} label="Línea" placeholder="Seleccionar líneas" />}
                    sx={{ minWidth: 220, flex: 1, maxWidth: 360 }}
                />
                <Autocomplete
                    multiple
                    options={cilindradas}
                    getOptionLabel={(option) => String(option.cilindrada)}
                    value={cilindradas.filter((item) => cilindradaFilters.includes(item.id))}
                    onChange={(_event, value) => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('cilindrada_id');
                        value.forEach((item) => next.append('cilindrada_id', item.id));
                        next.set('limit', limit.toString());
                        next.set('offset', '0');
                        setSearchParams(next);
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip label={option.cilindrada} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => <TextField {...params} label="Cilindrada" placeholder="Seleccionar cilindradas" />}
                    sx={{ minWidth: 220, flex: 1, maxWidth: 360 }}
                />
            </Box>

            <TableContainer>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}>
                        <Loading />
                    </Box>
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

export default ModelosListPage;
