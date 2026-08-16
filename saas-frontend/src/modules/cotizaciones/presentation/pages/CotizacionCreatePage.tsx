import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { toast } from 'sonner';

import QuotationForm from '../components/QuotationForm';
import { cotizacionRepository } from '../../infrastructure/cotizacion.repository';
import type { CotizacionForm } from '../../domain/interfaces/cotizacion.interface';

export default function CotizacionCreatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: CotizacionForm) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data };
            if (payload.fecha_validez) {
                payload.fecha_validez = new Date(payload.fecha_validez).toISOString();
            }

            const response = await cotizacionRepository.crear(payload);
            toast.success('Cotización creada exitosamente');
            navigate(`/cotizaciones/${response.data.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Error al crear la cotización');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box p={0}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <IconButton onClick={() => navigate('/cotizaciones')}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4">Nueva Cotización</Typography>
            </Box>

            <QuotationForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </Box>
    );
}
