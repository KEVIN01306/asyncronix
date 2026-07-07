import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Add, Delete, Edit, Search, Visibility } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, Paper, Stack, TableContainer, TextField, useMediaQuery, useTheme } from '@mui/material';
import { toast } from 'sonner';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useAbortableFetch, isAbortError } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import ConfirmDialog from '../../../../shared/components/ui/dialog/ConfirmDialog';
import { categoriaTransaccionRepository } from '../../infrastructure/categoria-transaccion.repository';
import type { CategoriaTransaccion } from '../../domain/interfaces/categoria-transaccion.interface';

const CategoriaTransaccionListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams, setSearchParams] = useSearchParams();
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [tipoFilter, setTipoFilter] = useState(searchParams.get('tipo') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const abortableFetch = useAbortableFetch();
  const [categorias, setCategorias] = useState<CategoriaTransaccion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CategoriaTransaccion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const columns = useMemo(() => [
    { id: 'nombre', name: 'Nombre' },
    { id: 'tipo', name: 'Tipo', format: (value: string) => value === 'INGRESO' ? 'Ingreso' : 'Egreso' },
    { id: 'activo', name: 'Estado', format: (_value: boolean, row: CategoriaTransaccion) => <Chip variant="outlined" label={row.activo ? 'Activo' : 'Inactivo'} color={row.activo ? 'success' : 'default'} size="small" /> },
    { id: 'created_at', name: 'Creación', format: (value: string) => new Date(value).toLocaleDateString('es-ES') },
  ], []);

  const actions = [
    { name: 'Ver', icon: <Visibility fontSize="small" />, color: 'info', onClick: (row: CategoriaTransaccion) => navigate(`/categorias-transaccion/${row.id}`) },
    { name: 'Editar', icon: <Edit fontSize="small" />, color: 'primary', onClick: (row: CategoriaTransaccion) => navigate(`/categorias-transaccion/${row.id}/editar`) },
    { name: 'Eliminar', icon: <Delete fontSize="small" />, color: 'error', onClick: (row: CategoriaTransaccion) => setDeleteTarget(row) },
  ];

  const updateSearchParams = (override: { limit?: string; offset?: string; q?: string; tipo?: string }) => {
    const params: Record<string, string> = { limit: override.limit ?? limit.toString(), offset: override.offset ?? offset.toString() };
    const queryValue = override.q ?? searchQuery;
    const tipoValue = override.tipo ?? tipoFilter;
    if (queryValue.trim()) params.q = queryValue;
    else delete params.q;
    if (tipoValue) params.tipo = tipoValue;
    else delete params.tipo;
    setSearchParams(params);
  };

  const fetchCategorias = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const response = await categoriaTransaccionRepository.listar(limit, offset, debouncedSearchQuery || undefined, tipoFilter || undefined, signal);
      setCategorias(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      if (isAbortError(error)) return;
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, limit, offset, tipoFilter]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo') || '';
    if (q !== searchQuery) setSearchQuery(q);
    if (tipo !== tipoFilter) setTipoFilter(tipo);
  }, [searchParams, searchQuery, tipoFilter]);

  useEffect(() => {
    abortableFetch(fetchCategorias);
  }, [abortableFetch, fetchCategorias]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoriaTransaccionRepository.eliminar(deleteTarget.id);
      toast.success('Categoría eliminada con éxito');
      setDeleteTarget(null);
      abortableFetch(fetchCategorias);
    } catch (error) {
      toast.error('No se pudo eliminar la categoría');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box p={isMobile ? 2 : 4}>
      <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <AlertTitle>Información</AlertTitle>
        Administra las categorías que se usarán para clasificar ingresos y egresos del negocio.
      </Alert>

      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" gap={2} mb={2} component={Paper} sx={{ bgcolor: 'background.paper', p: 2 }}>
        <TextField
          fullWidth
          label="Buscar categorías"
          placeholder="Ej: planilla"
          value={searchQuery}
          onChange={(event) => {
            const value = event.target.value;
            setSearchQuery(value);
            updateSearchParams({ offset: '0', q: value });
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment> }}
        />
        <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ width: isMobile ? '100%' : 'auto' }}>
          <Button variant="outlined" onClick={() => setFiltersOpen(true)}>
            Más filtros
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/categorias-transaccion/nuevo')}>
            Nueva categoría
          </Button>
        </Stack>
      </Box>

      <TableContainer>
        {loading ? <Loading /> : <ListTable data={categorias} columns={columns} actions={actions} pagination={{ total, limit, offset, onPageChange: (newPage) => updateSearchParams({ offset: (newPage * limit).toString() }), onRowsPerPageChange: (newLimit) => updateSearchParams({ limit: newLimit.toString(), offset: '0' }) }} />}
      </TableContainer>

      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Más filtros</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Tipo de movimiento" value={tipoFilter} onChange={(event) => setTipoFilter(event.target.value)} sx={{ mt: 2 }}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="INGRESO">Ingreso</MenuItem>
            <MenuItem value="EGRESO">Egreso</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setTipoFilter(''); setFiltersOpen(false); updateSearchParams({ offset: '0', tipo: '' }); }}>Limpiar</Button>
          <Button variant="contained" onClick={() => { setFiltersOpen(false); updateSearchParams({ offset: '0', tipo: tipoFilter }); }}>Aplicar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Eliminar categoría" description={`¿Deseas eliminar la categoría "${deleteTarget?.nombre}"?`} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} confirmText="Eliminar" confirmColor="error" />
    </Box>
  );
};

export default CategoriaTransaccionListPage;
