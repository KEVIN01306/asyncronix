import React, { useState } from 'react';
import { Box, Paper, Typography, Stack, IconButton, Menu, MenuItem, Divider, Chip } from '@mui/material';
import { 
    MoreVert as MoreVertIcon,
    Layers as LayersIcon,
} from '@mui/icons-material';
import type { Caja } from '../../domain/interfaces/caja.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

interface Action {
    name: string;
    icon: React.ReactNode;
    color?: string;
    onClick: (row: any) => void;
    visible?: (row: any) => boolean;
}

interface CajaCardItemProps {
    caja: Caja;
    actions?: Action[];
}

export const CajaCardItem: React.FC<CajaCardItemProps> = ({ caja, actions }) => {
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
                overflow: 'hidden',
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
            {/* ENCABEZADO: Estilo Home Banking Premium */}
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
                    {caja.tipo?.toUpperCase() || 'CAJA GENERAL'}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Chip
                        label={caja.activo ? "Abierta" : "Cerrada"}
                        size="small"
                        sx={{ 
                            borderRadius: '4px', 
                            fontWeight: 600, 
                            fontSize: '0.6rem',
                            height: '18px',
                            backgroundColor: caja.activo ? 'rgba(16, 163, 127, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: caja.activo ? '#10A37F' : '#EF4444',
                            border: 'none',
                        }}
                    />
                    
                    {actions && actions.length > 0 && (
                        <Box>
                            <IconButton onClick={handleMenuOpen} size="small" sx={{ color: '#FFFFFF', p: 0.5 }}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                PaperProps={{ sx: { minWidth: 160 } }}
                            >
                                {actions.map((action, index) => {
                                    const isVisible = !action.visible || action.visible(caja);
                                    if (!isVisible) return null;

                                    return (
                                        <MenuItem
                                            key={index}
                                            onClick={() => {
                                                action.onClick(caja);
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
                </Stack>
            </Box>

            {/* CUERPO INTERNO */}
            <Box p={2.5} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                
                {/* Saldo Efectivo */}
                <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                        Efectivo neto disponible
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
                        {formatMoney(caja.saldo)}
                    </Typography>
                </Box>

                <Divider sx={{ my: 1.5, opacity: 0.5 }} />

                {/* Metadatos */}
                <Stack spacing={1}>
                    <Typography 
                        variant="body2" 
                        fontWeight={600} 
                        sx={{ letterSpacing: '0.02em', color: 'text.primary', fontSize: '0.85rem' }}
                    >
                        {caja.nombre}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1} textTransform="uppercase">
                        <LayersIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap sx={{ fontSize: '0.7rem' }}>
                            {caja.tipo || 'Caja Chica / Operación Local'}
                        </Typography>
                    </Stack>
                </Stack>

            </Box>
        </Paper>
    );
};

export default CajaCardItem;