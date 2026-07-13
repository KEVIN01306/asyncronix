import { Box, Typography, Paper } from '@mui/material';
import { useDeviceStore } from '../../../../core/store/deviceStore';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

const CajaStatusWidget = () => {
    const { cajaId, cajaNombre } = useDeviceStore();

    return (
        <Paper
            elevation={4}
            sx={{
                position: 'fixed',
                top: 100,
                right: 24,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: cajaId ? 'primary.main' : 'warning.main',
                boxShadow: (theme) => `0 8px 24px ${cajaId ? theme.palette.primary.main : theme.palette.warning.main}25`
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: cajaId ? 'primary.light' : 'warning.light',
                    color: cajaId ? 'primary.dark' : 'warning.dark',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                }}
            >
                {cajaId ? <PointOfSaleIcon /> : <CloudQueueIcon />}
            </Box>
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Caja en Uso
                </Typography>
                <Typography variant="body2" fontWeight={700} color={cajaId ? 'primary.main' : 'warning.main'}>
                    {cajaId ? cajaNombre : 'Virtual / En línea'}
                </Typography>
            </Box>
        </Paper>
    );
};

export default CajaStatusWidget;
