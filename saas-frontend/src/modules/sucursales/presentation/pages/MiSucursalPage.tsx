import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Tabs,
    Tab,
} from '@mui/material';
import { ArrowBack, StoreMallDirectoryOutlined } from '@mui/icons-material';
import { toast } from 'sonner';

import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { sucursalRepository } from '../../infrastructure/repositories/sucursal.repository';
import type { SucursalMiDetalle } from '../../domain/interfaces/sucursal.interface';

import SucursalInformacionTab from '../components/tabs/SucursalInformacionTab';
import SucursalCajasTab from '../components/tabs/SucursalCajasTab';
import SucursalCuentasBancariasTab from '../components/tabs/SucursalCuentasBancariasTab';

const MiSucursalPage = () => {
    const navigate = useNavigate();
    const [sucursal, setSucursal] = useState<SucursalMiDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const fetchSucursal = useCallback(async () => {
        try {
            const data = await sucursalRepository.obtenerMiSucursal();
            setSucursal(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar la sucursal actual');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSucursal();
    }, [fetchSucursal]);

    const activeTab = useMemo(() => {
        const tabValue = Number(searchParams.get('tab'));
        return [0, 1, 2].includes(tabValue) ? tabValue : 0;
    }, [searchParams]);

    const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('tab', String(newValue));
        setSearchParams(nextParams, { replace: true });
    };

    if (loading) {
        return <Loading />;
    }

    if (!sucursal) {
        return <ErrorPageLoading text="Sucursal no encontrada" navigate={() => navigate('/dashboard')} />;
    }

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} gap={2}>
                <Box>
                    <Typography variant="overline" color="primary" fontWeight={700} display="flex" alignItems="center" gap={1}>
                        <StoreMallDirectoryOutlined fontSize="small" /> Mi Sucursal
                    </Typography>
                    <Typography variant="h4" fontWeight={800} mt={1}>
                        {sucursal.nombre}
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/sucursales')}>
                    Volver a sucursales
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
                    <Tab label="Información" />
                    <Tab label="Cajas" />
                    <Tab label="Cuentas bancarias" />
                </Tabs>
            </Paper>

            {activeTab === 0 && <SucursalInformacionTab sucursal={sucursal} />}
            {activeTab === 1 && <SucursalCajasTab sucursal={sucursal} setSucursal={setSucursal} />}
            {activeTab === 2 && <SucursalCuentasBancariasTab sucursal={sucursal} setSucursal={setSucursal} />}
        </Box>
    );
};

export default MiSucursalPage;
