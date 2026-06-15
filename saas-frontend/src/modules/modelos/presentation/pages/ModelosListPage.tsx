import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper, TableContainer, useTheme, useMediaQuery, Autocomplete, TextField, Chip, Button, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
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
    const [marcaInput, setMarcaInput] = useState('');
    const [lineaInput, setLineaInput] = useState('');
    const [cilindradaInput, setCilindradaInput] = useState('');
    const debouncedMarca = useDebounce(marcaInput, 300);
    const debouncedLinea = useDebounce(lineaInput, 300);
    const abortableFetch = useAbortableFetch();
    const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('q') || '');
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [tempMarcaIds, setTempMarcaIds] = useState<string[]>([]);
    const [tempLineaIds, setTempLineaIds] = useState<string[]>([]);
    const [tempCilindradaIds, setTempCilindradaIds] = useState<string[]>([]);
    const [tempAnio, setTempAnio] = useState<string>('');

    

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

    useEffect(() => {
        abortableFetch(async (signal) => {
            try {
                const res = await marcasRepository.listar(10, 0, debouncedMarca, signal);
                if (res) setMarcas(res.data);
            } catch (error) {
                if (!isAbortError(error)) console.error(error);
            }
        });
    }, [debouncedMarca, abortableFetch]);

    useEffect(() => {
        abortableFetch(async (signal) => {
            try {
                const res = await lineasRepository.listar(10, 0, debouncedLinea, signal);
                if (res) setLineas(res.data);
            } catch (error) {
                if (!isAbortError(error)) console.error(error);
            }
        });
    }, [debouncedLinea, abortableFetch]);

    // cilindradas repo doesn't support q/signal; we preload full list on mount

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const currentMarcaFilters = searchParams.getAll('marca_id');
            const currentLineaFilters = searchParams.getAll('linea_id');
            const currentCilindradaFilters = searchParams.getAll('cilindrada_id');
            const q = searchParams.get('q') || '';
            const anio = searchParams.get('anio');
            const filters: any = {};

            if (currentMarcaFilters.length) filters.marca_id = currentMarcaFilters;
            if (currentLineaFilters.length) filters.linea_id = currentLineaFilters;
            if (currentCilindradaFilters.length) filters.cilindrada_id = currentCilindradaFilters;
            if (q) filters.q = q;
            if (anio) filters.anio = parseInt(anio, 10);

            const res = await modelosRepository.listar(limit, offset, filters);
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [limit, offset, searchParams]);

    useEffect(() => { fetchLists(); }, [fetchLists]);
    useEffect(() => { fetch(); }, [fetch]);

    useEffect(() => {
        const q = searchParams.get('q') || '';
        if (q !== searchQuery) setSearchQuery(q);
    }, [searchParams, searchQuery]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Box component={Paper} sx={{ p: 2, mb: 2 }}>Catálogo global de modelos</Box>

            <Box display="flex" gap={2} flexWrap="wrap" mb={2} alignItems="center">
                <TextField
                    label="Buscar modelo"
                    placeholder="Buscar por modelo"
                    value={searchQuery}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        const next = new URLSearchParams(searchParams);
                        if (value.trim().length > 0) next.set('q', value);
                        else next.delete('q');
                        next.set('limit', limit.toString());
                        next.set('offset', '0');
                        setSearchParams(next);
                    }}
                    sx={{ minWidth: 220, flex: 1, maxWidth: 360 }}
                />

                <Button variant="outlined" onClick={() => {
                    // initialize temp filters from current params
                    setTempMarcaIds(searchParams.getAll('marca_id'));
                    setTempLineaIds(searchParams.getAll('linea_id'));
                    setTempCilindradaIds(searchParams.getAll('cilindrada_id'));
                    setTempAnio(searchParams.get('anio') || '');
                    // reset input typing state so user can type immediately
                    setMarcaInput('');
                    setLineaInput('');
                    setCilindradaInput('');
                    setFilterModalOpen(true);
                }}>Más filtros</Button>
                <Button variant="text" onClick={() => {
                    // clear all filters (keeps pagination)
                    const next = new URLSearchParams();
                    next.set('limit', limit.toString());
                    next.set('offset', '0');
                    const q = searchParams.get('q');
                    if (q) next.set('q', q);
                    setSearchParams(next);
                }}>Limpiar filtros</Button>
            </Box>

            <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Filtros adicionales</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Autocomplete
                        multiple
                        options={marcas}
                        inputValue={marcaInput}
                        onInputChange={(_e, value) => setMarcaInput(value)}
                        getOptionLabel={(option) => option.marca}
                        value={marcas.filter((m) => tempMarcaIds.includes(m.id))}
                        onChange={(_e, value) => setTempMarcaIds(value.map((v: any) => v.id))}
                        renderTags={(value, getTagProps) => value.map((option, index) => <Chip label={option.marca} {...getTagProps({ index })} />)}
                        renderInput={(params) => <TextField {...params} label="Marca" placeholder="Seleccionar marca" />}
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                    />
                    <Autocomplete
                        multiple
                        options={lineas}
                        inputValue={lineaInput}
                        onInputChange={(_e, value) => setLineaInput(value)}
                        getOptionLabel={(option) => option.linea}
                        value={lineas.filter((l) => tempLineaIds.includes(l.id))}
                        onChange={(_e, value) => setTempLineaIds(value.map((v: any) => v.id))}
                        renderTags={(value, getTagProps) => value.map((option, index) => <Chip label={option.linea} {...getTagProps({ index })} />)}
                        renderInput={(params) => <TextField {...params} label="Línea" placeholder="Seleccionar líneas" />}
                        sx={{ mt: 2 }}
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                    />
                    <Autocomplete
                        multiple
                        options={cilindradas}
                        inputValue={cilindradaInput}
                        onInputChange={(_e, value) => setCilindradaInput(value)}
                        getOptionLabel={(option) => String(option.cilindrada)}
                        value={cilindradas.filter((c) => tempCilindradaIds.includes(c.id))}
                        onChange={(_e, value) => setTempCilindradaIds(value.map((v: any) => v.id))}
                        renderTags={(value, getTagProps) => value.map((option, index) => <Chip label={option.cilindrada} {...getTagProps({ index })} />)}
                        renderInput={(params) => <TextField {...params} label="Cilindrada" placeholder="Seleccionar cilindradas" />}
                        sx={{ mt: 2 }}
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                    />
                    <TextField
                        label="Año"
                        placeholder="Año"
                        value={tempAnio}
                        onChange={(e) => setTempAnio(e.target.value)}
                        sx={{ mt: 2, width: 160 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        const preserved: Record<string, string> = { limit: limit.toString(), offset: '0' };
                        const q = searchParams.get('q') || '';
                        if (q) preserved.q = q;
                        setTempMarcaIds([]);
                        setTempLineaIds([]);
                        setTempCilindradaIds([]);
                        setTempAnio('');
                        setSearchParams(preserved);
                        setFilterModalOpen(false);
                    }}>Limpiar</Button>
                    <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('marca_id');
                        next.delete('linea_id');
                        next.delete('cilindrada_id');
                        if (tempMarcaIds.length) tempMarcaIds.forEach(id => next.append('marca_id', id));
                        if (tempLineaIds.length) tempLineaIds.forEach(id => next.append('linea_id', id));
                        if (tempCilindradaIds.length) tempCilindradaIds.forEach(id => next.append('cilindrada_id', id));
                        if (tempAnio) next.set('anio', tempAnio); else next.delete('anio');
                        next.set('limit', limit.toString());
                        next.set('offset', '0');
                        setSearchParams(next);
                        setFilterModalOpen(false);
                    }}>Aplicar</Button>
                </DialogActions>
            </Dialog>

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
