import React, { useState } from 'react';
import { Box, Paper, Typography, Stack, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { 
    MoreVert as MoreVertIcon,
    Person as PersonIcon, 
    AccountBalance as BankIcon 
} from '@mui/icons-material';
import type { CuentaBancaria } from '../../domain/interfaces/cuenta-bancaria.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

interface Action {
    name: string;
    icon: React.ReactNode;
    color?: string;
    onClick: (row: any) => void;
    visible?: (row: any) => boolean;
}

interface CuentaBancariaCardItemProps {
    cuenta: CuentaBancaria;
    actions?: Action[];
}

export const CuentaBancariaCardItem: React.FC<CuentaBancariaCardItemProps> = ({
    cuenta,
    actions
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', // Importante para que la franja superior respete el border-radius
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                    boxShadow: (theme) => 
                        theme.palette.mode === 'dark' 
                            ? '0 8px 24px rgba(0,0,0,0.5)' 
                            : '0 8px 24px rgba(0,0,0,0.06)',
                },
            }}
        >
            {/* ENCABEZADO: Franja sólida estilo Home Banking (Igual al detalle) */}
            <Box 
                sx={{ 
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#10141E' : '#0A2540',
                    color: '#FFFFFF',
                    px: 2,
                    py: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Typography variant="body2" fontWeight={700} sx={{ color: '#FFFFFF', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    {cuenta.tipo?.toUpperCase() || 'CUENTA CORRIENTE'}
                </Typography>

                {actions && actions.length > 0 && (
                    <Box>
                        <IconButton 
                            onClick={handleMenuOpen} 
                            size="small"
                            sx={{ color: '#FFFFFF', p: 0.5 }}
                        >
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                        
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    minWidth: 160,
                                    boxShadow: (theme) => 
                                        theme.palette.mode === 'dark' 
                                            ? '0 4px 16px rgba(0,0,0,0.5)' 
                                            : '0 4px 16px rgba(0,0,0,0.08)',
                                }
                            }}
                        >
                            {actions.map((action, index) => {
                                const isVisible = !action.visible || action.visible(cuenta);
                                if (!isVisible) return null;

                                return (
                                    <MenuItem
                                        key={index}
                                        onClick={() => {
                                            action.onClick(cuenta);
                                            handleMenuClose();
                                        }}
                                        sx={{ 
                                            fontSize: '0.85rem', 
                                            gap: 1.5, 
                                            color: action.color ? `${action.color}.main` : 'inherit' 
                                        }}
                                    >
                                        {action.icon}
                                        {action.name}
                                    </MenuItem>
                                );
                            })}
                        </Menu>
                    </Box>
                )}
            </Box>

            {/* CUERPO INTERNO COMPACTO */}
            <Box p={2.5} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                
                {/* Balance Principal */}
                <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                        Saldo disponible
                    </Typography>
                    <Typography 
                        variant="h2" 
                        sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            fontSize: '1.45rem',
                            letterSpacing: '-0.02em',
                            mt: 0.5
                        }}
                    >
                        {formatMoney(cuenta.saldo, cuenta.moneda?.codigo)}
                    </Typography>
                </Box>

                <Divider sx={{ my: 1.5, opacity: 0.5 }} />

                {/* Meta-datos de la cuenta */}
                <Stack spacing={1}>
                    <Typography 
                        variant="body2" 
                        fontWeight={600} 
                        sx={{ fontFamily: 'monospace', letterSpacing: '0.05em', color: 'text.primary', fontSize: '0.8rem' }}
                    >
                        {cuenta.numero_cuenta}
                    </Typography>

                    <Stack spacing={0.5} textTransform="uppercase">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap sx={{ fontSize: '0.7rem' }}>
                                {cuenta.nombre_titular}
                            </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <BankIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap sx={{ fontSize: '0.7rem' }}>
                                {cuenta.banco?.nombre_comercial ?? 'Banco Desconocido'}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>

            </Box>
        </Paper>
    );
};

export default CuentaBancariaCardItem;