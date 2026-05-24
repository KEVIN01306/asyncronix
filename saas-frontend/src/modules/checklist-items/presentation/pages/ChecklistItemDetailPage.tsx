import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ChecklistItemRepository } from '../../infrastructure/repositories/checklist-item.repository';
import type { ChecklistItem } from '../../domain/interfaces/checklist-item.interface';

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

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    if (!item) return <Box p={4}><Typography>No se encontró el checklist item.</Typography></Box>;

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
