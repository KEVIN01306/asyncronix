import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertTitle, Box, Button, InputAdornment, Paper, TextField, useMediaQuery, useTheme } from '@mui/material';
import { Search, Visibility } from '@mui/icons-material';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { useAbortableFetch, isAbortError } from '../../../../core/hooks/useAbortableFetch';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { paisesRepository } from '../../infrastructure/paises.repository';
import type { Pais } from '../../domain/interface/pais.interface';

const PaisesListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams, setSearchParams] = useSearchParams();
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const abortableFetch = useAbortableFetch();

  const columns = [
    { id: 'nombre', name: 'País' },
    { id: 'codigo_iso', name: 'Código ISO' },
    { id: 'codigo_tel', name: 'Código telefónico' },
  ];

  const actions = [
    {
      name: 'Ver',
      icon: <Visibility fontSize="small" />,
      color: 'gray',
      onClick: (row: Pais) => navigate(`/paises/${row.id}`),
    },
  ];

  const fetchPaises = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const response = await paisesRepository.listar(limit, offset, debouncedSearchQuery || undefined, signal);
      setPaises(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      if (!isAbortError(error)) console.error(error);
    } finally {
      setLoading(false);
    }
  }, [limit, offset, debouncedSearchQuery]);

  useEffect(() => {
    abortableFetch(fetchPaises);
  }, [abortableFetch, fetchPaises]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== searchQuery) setSearchQuery(q);
  }, [searchParams, searchQuery]);

  return (
    <Box p={isMobile ? 2 : 4}>
      <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <AlertTitle>Información</AlertTitle>
        Consulta los países disponibles para asociar información de ubicación y contacto en el negocio.
      </Alert>

      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" gap={2} mb={2} sx={{ bgcolor: 'background.paper', p: 2 }} component={Paper}>
        <TextField
          fullWidth
          value={searchQuery}
          label="Buscar países"
          placeholder="Ej: Guatemala, México"
          onChange={(event) => {
            const value = event.target.value;
            setSearchQuery(value);
            setSearchParams({ limit: limit.toString(), offset: '0', ...(value.trim() ? { q: value } : {}) });
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment> }}
        />
        <Button variant="contained" disabled fullWidth={isMobile}>Catálogo global</Button>
      </Box>

      {loading ? <Loading /> : (
        <ListTable
          data={paises}
          columns={columns}
          actions={actions}
          pagination={{
            total,
            limit,
            offset,
            onPageChange: (newPage) => setSearchParams({ limit: limit.toString(), offset: (newPage * limit).toString(), ...(searchQuery ? { q: searchQuery } : {}) }),
            onRowsPerPageChange: (newLimit) => setSearchParams({ limit: newLimit.toString(), offset: '0', ...(searchQuery ? { q: searchQuery } : {}) }),
          }}
        />
      )}
    </Box>
  );
};

export default PaisesListPage;