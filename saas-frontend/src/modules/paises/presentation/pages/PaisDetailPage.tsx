import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Card, CardContent, Chip, Divider, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { ArrowBack, Public } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { paisesRepository } from '../../infrastructure/paises.repository';
import type { Pais } from '../../domain/interface/pais.interface';

const PaisDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pais, setPais] = useState<Pais | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPais = async () => {
      if (!id) return;
      try {
        const response = await paisesRepository.obtener(id);
        setPais(response.data);
      } catch (error) {
        console.error(error);
        setPais(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPais();
  }, [id]);

  if (loading) return <Loading />;
  if (!pais) return <ErrorPageLoading text="País no encontrado" navigate={() => navigate('/paises')} />;

  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
            <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={() => navigate('/paises')}>
              <ArrowBack sx={{ fontSize: 16 }} /> Paises
            </Link>
            <Typography color="text.primary">Detalle del país</Typography>
          </Breadcrumbs>
          <Typography variant="h4" fontWeight={800}>{pais.nombre}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Public />} onClick={() => navigate('/paises')}>Volver</Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box display="flex" alignItems="center" gap={3} mb={4}>
              <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: 'white' }}>
                <Public sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="overline" color="primary" fontWeight={700}>Catálogo global</Typography>
                <Typography variant="h5" fontWeight={700}>{pais.nombre}</Typography>
                <Chip variant="outlined" label={pais.activo ? 'Activo' : 'Inactivo'} color={pais.activo ? 'success' : 'default'} size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
              </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Código ISO</Typography>
                <Typography variant="body1">{pais.codigo_iso}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Código telefónico</Typography>
                <Typography variant="body1">{pais.codigo_tel}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>Resumen del país</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Estado</Typography><Typography variant="body2">{pais.activo ? 'Activo' : 'Inactivo'}</Typography></Box>
                <Box display="flex" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Moneda asociada</Typography><Typography variant="body2">{pais.moneda_id}</Typography></Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaisDetailPage;