import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Stack,
    Button,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { CloudQueue, PhotoLibrary } from '@mui/icons-material';
import MediaGallery from './MediaGallery';

interface MediaTabProps {
    storage: {
        storage_bytes_used: number;
        storage_max_bytes: number | null;
    };
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MediaTab: React.FC<MediaTabProps> = ({ storage }) => {
    const [openGallery, setOpenGallery] = useState(false);

    const used = storage.storage_bytes_used || 0;
    const max = storage.storage_max_bytes;
    const isUnlimited = max === null || max === undefined || max < 0;

    let percentage = 0;
    if (!isUnlimited && max! > 0) {
        percentage = (used / max!) * 100;
    }

    const getProgressBarColor = (pct: number, theme: Theme) => {
        if (isUnlimited) return theme.palette.success.main;
        if (pct <= 50) return theme.palette.success.main;
        if (pct <= 75) return theme.palette.info.main;
        if (pct <= 90) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    return (
        <Box>
            <Card sx={{ mb: 4, overflow: 'hidden', position: 'relative' }}>
                {/* Decorative background blur */}
                <Box sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    filter: 'blur(50px)',
                    borderRadius: '50%',
                    zIndex: 0
                }} />

                <CardContent sx={{ p: { xs: 2, sm: 4 }, position: 'relative', zIndex: 1 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>Almacenamiento de Archivos (R2)</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Espacio utilizado por las imágenes subidas por el sistema
                            </Typography>
                        </Box>

                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 4, md: 3 }} component="div">
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{
                                        display: 'flex',
                                        p: 1.5,
                                        borderRadius: 2.5,
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}>
                                        <CloudQueue sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" fontWeight={600} color="text.primary">
                                            Almacenamiento
                                        </Typography>
                                        {!isUnlimited && (
                                            <Typography variant="caption" color="text.secondary">
                                                {percentage.toFixed(1)}% utilizado
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 5, md: 6 }} component="div">
                                {isUnlimited ? (
                                    <Box sx={{
                                        height: 8,
                                        borderRadius: 999,
                                        bgcolor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.06)
                                    }} />
                                ) : (
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(percentage, 100)}
                                        sx={(theme) => {
                                            const barColor = getProgressBarColor(percentage, theme);
                                            return {
                                                height: 8,
                                                borderRadius: 999,
                                                bgcolor: alpha(barColor, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 999,
                                                    bgcolor: barColor,
                                                    boxShadow: `0 0 10px ${alpha(barColor, 0.5)}`
                                                }
                                            };
                                        }}
                                    />
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }} component="div">
                                <Stack direction="row" justifyContent={{ xs: 'space-between', sm: 'flex-end' }} alignItems="center" spacing={2}>
                                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontFamily: 'monospace' }}>
                                        {formatBytes(used)} / {isUnlimited ? '∞' : formatBytes(max!)}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<PhotoLibrary />}
                                onClick={() => setOpenGallery(!openGallery)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`
                                }}
                            >
                                {openGallery ? 'Ocultar Medias' : 'Ver Medias'}
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {openGallery && (
                <MediaGallery />
            )}
        </Box>
    );
};

export default MediaTab;
