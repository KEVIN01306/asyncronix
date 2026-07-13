import { Box, Card, CardContent, Typography, Radio, RadioGroup, FormControlLabel, Slider, Divider, Button, Stack, Grid } from '@mui/material';
import { Palette as PaletteIcon, Tune as TuneIcon, NotificationsActive as NotificationsIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useUiStore } from '../../../../core/store/uiStore';
import type { ThemeVariant } from '../../../../core/theme/types';
import { toast } from 'sonner';

export const CustomPage = () => {
    const themeSource = useUiStore((state) => state.themeSource);
    const setThemeSource = useUiStore((state) => state.setThemeSource);
    const themeVariant = useUiStore((state) => state.themeVariant);
    const setThemeVariant = useUiStore((state) => state.setThemeVariant);
    const borderIntensity = useUiStore((state) => state.borderIntensity);
    const setBorderIntensity = useUiStore((state) => state.setBorderIntensity);
    const borderColorIntensity = useUiStore((state) => state.borderColorIntensity);
    const setBorderColorIntensity = useUiStore((state) => state.setBorderColorIntensity);
    const toasterPosition = useUiStore((state) => state.toasterPosition);
    const setToasterPosition = useUiStore((state) => state.setToasterPosition);
    const toasterStyle = useUiStore((state) => state.toasterStyle);
    const setToasterStyle = useUiStore((state) => state.setToasterStyle);

    const posiciones = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;

    const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setThemeSource(event.target.value as 'system' | 'light' | 'dark');
    };

    const handleIntensityChange = (_event: Event, newValue: number | number[]) => {
        setBorderIntensity(Array.isArray(newValue) ? newValue[0] : newValue);
    };

    const handleColorIntensityChange = (_event: Event, newValue: number | number[]) => {
        setBorderColorIntensity(Array.isArray(newValue) ? newValue[0] : newValue);
    };

    const handleToasterPositionChange = (position: any) => {
        setToasterPosition(position);
    };

    const handleToasterStyleChange = (style: 'colorful' | 'simple') => {
        setToasterStyle(style);
    };

    const handleVariantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const v = event.target.value as ThemeVariant;
        setThemeVariant(v);
    };

    const handleShowTestToast = () => {
        const styleText = toasterStyle === 'colorful' ? 'con colores' : 'simple';
        toast.success(`🎉 Toast de prueba en ${toasterPosition} (${styleText})`, {
            description: 'Este es un mensaje de prueba para ver dónde aparece el toast',
        });
    };

    const formatPosName = (pos: string) => {
        const [y, x] = pos.split('-');
        return `${y.charAt(0).toUpperCase() + y.slice(1)} ${x.charAt(0).toUpperCase() + x.slice(1)}`;
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, px: 2, pb: 6 }}>
            {/* Cabecera Estilo Preferencias del Sistema */}
            <Box mb={4}>
                <Typography variant="h2" color="text.primary" sx={{ mb: 1 }}>
                    Aspecto y Sistema
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Personaliza los elementos visuales de la interfaz de usuario, bordes y el comportamiento de las alertas globales.
                </Typography>
            </Box>

            <Grid container spacing={3}>

                {/* Bloque Izquierdo: Configuración del Tema de Color (Estilo Google Control Panel) */}
                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <Stack spacing={3}>
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h3" color="text.primary" sx={{ fontSize: '1.15rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <VisibilityIcon color="primary" fontSize="small" /> Modo de Pantalla
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Elige cómo se muestra el entorno visual de la aplicación.
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <RadioGroup value={themeSource} onChange={handleThemeChange}>
                                    <FormControlLabel value="system" control={<Radio size="small" />} label={<Typography variant="body2">Usar tema del sistema</Typography>} sx={{ mb: 0.5 }} />
                                    <FormControlLabel value="light" control={<Radio size="small" />} label={<Typography variant="body2">Modo Claro</Typography>} sx={{ mb: 0.5 }} />
                                    <FormControlLabel value="dark" control={<Radio size="small" />} label={<Typography variant="body2">Modo Oscuro</Typography>} />
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h3" color="text.primary" sx={{ fontSize: '1.15rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PaletteIcon color="primary" fontSize="small" /> Variante de Paleta
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Aplica esquemas de color alternativos preconfigurados.
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <RadioGroup value={themeVariant} onChange={handleVariantChange}>
                                    {['normal', 'marton', 'corport', 'brutalist', 'neumorphic'].map((variant) => (
                                        <FormControlLabel
                                            key={variant}
                                            value={variant}
                                            control={<Radio size="small" />}
                                            label={<Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{variant}</Typography>}
                                            sx={{ mb: 0.5 }}
                                        />
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                {/* Bloque Derecho: Interfaz de Usuario y Alertas (Estilo Menú Desplegado Apple) */}
                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <Stack spacing={3}>
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h3" color="text.primary" sx={{ fontSize: '1.15rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TuneIcon color="primary" fontSize="small" /> Geometría y Bordes
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Ajustes detallados sobre el contraste de contornos contenedores.
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" color="text.primary" fontWeight="500" mb={1}>
                                        Intensidad del Borde
                                    </Typography>
                                    <Slider
                                        value={borderIntensity}
                                        onChange={handleIntensityChange}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.primary" fontWeight="500" mb={1}>
                                        Tonalidad / Color Base
                                    </Typography>
                                    <Slider
                                        value={borderColorIntensity}
                                        onChange={handleColorIntensityChange}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                        0% oscurecido total, 50% gris neutral, 100% acento azul primario.
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h3" color="text.primary" sx={{ fontSize: '1.15rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <NotificationsIcon color="primary" fontSize="small" /> Centro de Notificaciones
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Configura los disparadores e interfaces visuales de avisos instantáneos (Toasts).
                                </Typography>

                                <Box mb={3}>
                                    <Typography variant="body2" color="text.primary" fontWeight="500" mb={1.5}>
                                        Diseño del Banner
                                    </Typography>
                                    <Stack direction="row" spacing={1} bgcolor="action.hover" p={0.5} borderRadius={3}>
                                        <Button
                                            variant={toasterStyle === 'colorful' ? 'contained' : 'text'}
                                            onClick={() => handleToasterStyleChange('colorful')}
                                            fullWidth
                                            size="small"
                                            sx={{ borderRadius: 2, py: 0.75, color: toasterStyle === 'colorful' ? 'primary.contrastText' : 'text.primary' }}
                                        >
                                            Con Colores
                                        </Button>
                                        <Button
                                            variant={toasterStyle === 'simple' ? 'contained' : 'text'}
                                            onClick={() => handleToasterStyleChange('simple')}
                                            fullWidth
                                            size="small"
                                            sx={{ borderRadius: 2, py: 0.75, color: toasterStyle === 'simple' ? 'primary.contrastText' : 'text.primary' }}
                                        >
                                            Muted / Mínimo
                                        </Button>
                                    </Stack>
                                </Box>

                                <Box mb={3}>
                                    <Typography variant="body2" color="text.primary" fontWeight="500" mb={1}>
                                        Ubicación de Salida
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {posiciones.map((pos) => (
                                            <Grid size={{ xs: 6, sm: 6, md: 6 }} key={pos}>
                                                <Button
                                                    fullWidth
                                                    onClick={() => handleToasterPositionChange(pos)}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        borderColor: toasterPosition === pos ? 'primary.main' : 'divider',
                                                        backgroundColor: toasterPosition === pos ? 'action.selected' : 'transparent',
                                                        color: 'text.primary',
                                                        fontWeight: toasterPosition === pos ? 600 : 400,
                                                        '&:hover': { borderColor: 'primary.main' }
                                                    }}
                                                >
                                                    {formatPosName(pos)}
                                                </Button>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleShowTestToast}
                                    sx={{ borderRadius: 999, py: 1 }}
                                >
                                    Lanzar Alerta de Prueba
                                </Button>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CustomPage;