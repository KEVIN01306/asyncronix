import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Card, CardContent, Chip, Divider, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { ArrowBack, CurrencyExchange } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { monedasRepository } from '../../infrastructure/monedas.repository';
import type { Moneda } from '../../domain/interface/moneda.interface';

const MonedaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [moneda, setMoneda] = useState<Moneda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoneda = async () => {
      if (!id) return;
      try {
        const response = await monedasRepository.obtener(id);
        setMoneda(response.data);
      } catch (error) {
        console.error(error);
        setMoneda(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMoneda();
  }, [id]);

  if (loading) return <Loading />;
  if (!moneda) return <ErrorPageLoading text="Moneda no encontrada" navigate={() => navigate('/monedas')} />;

  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
            <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={() => navigate('/monedas')}>
              <ArrowBack sx={{ fontSize: 16 }} /> Monedas
            </Link>
            <Typography color="text.primary">Detalle de moneda</Typography>
          </Breadcrumbs>
          <Typography variant="h4" fontWeight={800}>{moneda.nombre}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<CurrencyExchange />} onClick={() => navigate('/monedas')}>Volver</Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box display="flex" alignItems="center" gap={3} mb={4}>
              <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'secondary.main', display: 'grid', placeItems: 'center', color: 'white' }}>
                <CurrencyExchange sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="overline" color="secondary" fontWeight={700}>Catálogo global</Typography>
                <Typography variant="h5" fontWeight={700}>{moneda.nombre}</Typography>
                <Chip variant="outlined" label={moneda.activo ? 'Activo' : 'Inactivo'} color={moneda.activo ? 'success' : 'default'} size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
              </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Código</Typography>
                <Typography variant="body1">{moneda.codigo}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Símbolo</Typography>
                <Typography variant="body1">{moneda.simbolo}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>Resumen de la moneda</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Estado</Typography><Typography variant="body2">{moneda.activo ? 'Activo' : 'Inactivo'}</Typography></Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonedaDetailPage;