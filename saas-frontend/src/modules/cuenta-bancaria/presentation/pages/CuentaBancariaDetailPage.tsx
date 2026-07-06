import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { cuentaBancariaRepository } from '../../infrastructure/cuenta-bancaria.repository';
import type { CuentaBancaria } from '../../domain/interfaces/cuenta-bancaria.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

export default function CuentaBancariaDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cuenta, setCuenta] = useState<CuentaBancaria | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            cuentaBancariaRepository.obtener(id)
                .then((res) => setCuenta(res.data))
                .catch(() => navigate('/cuentas-bancarias'))
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

    if (loading) return <Loading />;
    if (!cuenta) return <Box p={4}>Cuenta no encontrada.</Box>;

    return (
        <Box p={4}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/cuentas-bancarias')} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700}>Detalle de Cuenta Bancaria</Typography>
                <Box mt={2}>
                    <Typography variant="subtitle2">Número de cuenta</Typography>
                    <Typography variant="body1">{cuenta.numero_cuenta}</Typography>

                    <Typography variant="subtitle2" mt={2}>Titular</Typography>
                    <Typography variant="body1">{cuenta.nombre_titular}</Typography>

                    <Typography variant="subtitle2" mt={2}>Tipo</Typography>
                    <Typography variant="body1">{cuenta.tipo}</Typography>

                    <Typography variant="subtitle2" mt={2}>Saldo</Typography>
                    <Typography variant="body1">{cuenta.saldo}</Typography>

                    <Typography variant="subtitle2" mt={2}>Activo</Typography>
                    <Typography variant="body1">{cuenta.activo ? 'Sí' : 'No'}</Typography>
                </Box>
            </Paper>
        </Box>
    );
}
