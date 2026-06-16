import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import type { ServicioVehiculoEstado } from '../../domain/interfaces/servicio.interface';

interface ServicioStateGuardProps {
    children: React.ReactNode;
    requiredPermission?: string;
    validStates?: string[];
}

/**
 * Protector de rutas para el módulo de servicios.
 * Valida:
 * 1. Estado del servicio
 * 2. Redirige a /servicios/:id si no es válido
 */
export const ServicioStateGuard = ({
    children,
    validStates = []
}: ServicioStateGuardProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [, setServicio] = useState<ServicioVehiculoEstado | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const validateAccess = async () => {
            if (!id) {
                setError('ID de servicio no proporcionado');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const servicioData = await servicioRepository.obtenerEstado(id);
                setServicio(servicioData as any);

                if (validStates.length > 0 && !validStates.includes(servicioData.estado)) {
                    navigate(`/servicios/${id}`, { replace: true });
                    return;
                }
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el servicio');
            } finally {
                setLoading(false);
            }
        };

        validateAccess();
    }, [id, validStates, navigate]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <ErrorPageLoading
                text={error}
                navigate={() => navigate('/servicios')}
            />
        );
    }

    return <>{children}</>;
};
