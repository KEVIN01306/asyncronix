import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ChecklistItemRepository } from '../../infrastructure/repositories/checklist-item.repository';
import type { ChecklistItem } from '../../domain/interfaces/checklist-item.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';

const ChecklistItemDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState<ChecklistItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        ChecklistItemRepository.Obtener(id)
            .then(setItem)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Loading />


    if (!item) return <ErrorPageLoading text="No se pudo cargar el checklist item" textReturn='Volver a Checklist' navigate={() => navigate('/checklist')} />;

    return (
        <Box p={4} maxWidth="720px" mx="auto">
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={700}>{item.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Activo:</strong> {item.activo ? 'Sí' : 'No'}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Creado:</strong> {new Date(item.created_at).toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Última actualización:</strong> {new Date(item.updated_at).toLocaleString()}</Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

export default ChecklistItemDetailPage;
