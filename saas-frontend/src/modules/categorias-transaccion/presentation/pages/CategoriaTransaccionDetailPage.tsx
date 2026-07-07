import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardHeader, Chip, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { toast } from 'sonner';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { categoriaTransaccionRepository } from '../../infrastructure/categoria-transaccion.repository';
import type { CategoriaTransaccion } from '../../domain/interfaces/categoria-transaccion.interface';

const CategoriaTransaccionDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categoria, setCategoria] = useState<CategoriaTransaccion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoria = async () => {
      setLoading(true);
      try {
        const response = await categoriaTransaccionRepository.obtener(id!);
        setCategoria(response.data);
      } catch (error) {
        toast.error('No se pudo cargar la categoría');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoria();
  }, [id]);

  if (loading) return <Loading />;
  if (!categoria) return null;

  return (
    <Box maxWidth={700} mx="auto" p={3}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/categorias-transaccion')} sx={{ mb: 2 }}>
        Volver
      </Button>
      <Card>
        <CardHeader title={categoria.nombre} subheader="Detalle de la categoría" />
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body1"><strong>Tipo:</strong> {categoria.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}</Typography>
            <Typography variant="body1"><strong>Estado:</strong> <Chip label={categoria.activo ? 'Activo' : 'Inactivo'} color={categoria.activo ? 'success' : 'default'} size="small" /></Typography>
            <Typography variant="body2" color="text.secondary">Creado: {new Date(categoria.created_at).toLocaleString('es-ES')}</Typography>
            <Typography variant="body2" color="text.secondary">Actualizado: {new Date(categoria.updated_at).toLocaleString('es-ES')}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CategoriaTransaccionDetailPage;
