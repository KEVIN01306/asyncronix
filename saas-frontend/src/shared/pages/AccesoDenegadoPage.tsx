import { Box, Typography, Button, Paper, Alert, AlertTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Block } from '@mui/icons-material';

export const AccesoDenegadoPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 800,
                    textAlign: 'center',
                    borderRadius: 2
                }}
            >
                <Block
                    sx={{
                        fontSize: 64,
                        color: 'error.main',
                        mb: 2
                    }}
                />
                <Typography variant="h4" gutterBottom color="error">
                    Acceso Denegado
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    No tienes permisos para acceder a esta página.
                </Typography>
                <Alert   severity="info" sx={{ mb: 3, textAlign: 'left', boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <AlertTitle>Informacion</AlertTitle>
                        Si crees que esto es un error, por favor contacta al administrador de tu cuenta para obtener acceso.
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ minWidth: 120 }}
                >
                    Ir al Inicio
                </Button>
            </Paper>
        </Box>
    );
};