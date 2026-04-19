import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Box, Typography, Paper, Button, Divider, Stack, Grid, Chip, Breadcrumbs, Link,Avatar, Card, CardContent,
    Alert
} from '@mui/material';
import { 
    Edit, Delete, Category, Description, ArrowBack, Inventory2 
} from '@mui/icons-material';
import { toast } from 'sonner';

import ConfirmDialog from '../../../../shared/components/ui/dialog/ConfirmDialog';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { CategoriaRepository } from '../../infrastructure/repositories/categoria.repository';
import type { Categoria } from '../../domain/interfaces/categoria.interface';

const CategoriaDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();    
    const [categoria, setCategoria] = useState<Categoria | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategoria = useCallback(async () => {
        try {
            const data = await CategoriaRepository.Obtener(String(id));
            setCategoria(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchCategoria();
    }, [id, fetchCategoria]);

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            toast.success('Categoría eliminada correctamente');
            navigate('/categorias');
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar la categoría');
        } finally {
            setIsDeleting(false);
            setOpenDelete(false);
        }
    };

    if (loading) return <Loading />;
    if (!categoria) return <ErrorPageLoading text="Categoría no encontrada" navigate={() => navigate('/categorias')} />;

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link 
                            underline="hover" 
                            color="inherit" 
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} 
                            onClick={() => navigate('/categorias')}
                        >
                            <ArrowBack sx={{ fontSize: 16 }} /> Categorías
                        </Link>
                        <Typography color="text.primary">Detalle de Categoría</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        {categoria.nombre}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} width={{ xs: '100%', sm: 'auto' }}>
                    <Button 
                        variant="outlined" 
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                        startIcon={<Edit />} 
                        onClick={() => navigate(`/categorias/${id}/editar`)}
                    >
                        Editar
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                        startIcon={<Delete />} 
                        onClick={() => setOpenDelete(true)}
                    >
                        Eliminar
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" gap={3} mb={4}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, borderRadius: 2 }}>
                                <Category sx={{ fontSize: 35 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="overline" color="primary" fontWeight={700}>Módulo de Inventario</Typography>
                                <Typography variant="h5" fontWeight={700}>{categoria.nombre}</Typography>
                                <Chip label="Activo para Ventas" color="success" size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
                            </Box>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: 1 }}>
                                        <Description sx={{ fontSize: 16 }} /> DESCRIPCIÓN DE LA CATEGORÍA
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                        {categoria.descripcion || 'Sin descripción disponible para esta categoría.'}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom fontWeight={700}>Resumen de Impacto</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Stack spacing={2}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Inventory2 fontSize="small" color="action" />
                                            <Typography variant="body2">Productos vinculados</Typography>
                                        </Stack>
                                        <Typography variant="body2" fontWeight={700}>0</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                        <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
                            Al eliminar una categoría, asegúrate de que no existan productos asociados para evitar errores en el catálogo.
                        </Alert>
                    </Stack>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={openDelete}
                title="¿Eliminar categoría?"
                description={
                    <Typography variant="body2">
                        Estás a punto de eliminar <strong>{categoria.nombre}</strong>. 
                        Esta acción es irreversible y los productos bajo esta categoría quedarán sin clasificación.
                    </Typography>
                }
                onClose={() => !isDeleting && setOpenDelete(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default CategoriaDetailPage;