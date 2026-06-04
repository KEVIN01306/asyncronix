import { Box, Card, CardContent, Typography, Radio, RadioGroup, FormControlLabel, Slider, Divider, Button, ButtonGroup, Stack } from '@mui/material';
import { useUiStore } from '../../../../core/store/uiStore';
import { toast } from 'sonner';

export const CustomPage = () => {
    const themeSource = useUiStore((state) => state.themeSource);
    const setThemeSource = useUiStore((state) => state.setThemeSource);
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

    const handleShowTestToast = () => {
        const styleText = toasterStyle === 'colorful' ? 'con colores' : 'simple';
        toast.success(`🎉 Toast de prueba en ${toasterPosition} (${styleText})`, {
            description: 'Este es un mensaje de prueba para ver dónde aparece el toast',
        });
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main" mb={3}>
                Configuración
            </Typography>

            {/* Sección Tema */}
            <Card elevation={3} sx={{ borderRadius: 2, mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Tema
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <RadioGroup
                        value={themeSource}
                        onChange={handleThemeChange}
                    >
                        <FormControlLabel
                            value="system"
                            control={<Radio />}
                            label="Sistema"
                            sx={{ mb: 1 }}
                        />
                        <FormControlLabel
                            value="light"
                            control={<Radio />}
                            label="Claro"
                            sx={{ mb: 1 }}
                        />
                        <FormControlLabel
                            value="dark"
                            control={<Radio />}
                            label="Oscuro"
                        />
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Sección UI */}
            <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Interfaz de Usuario
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                        Intensidad de Bordes
                    </Typography>
                    <Box sx={{ px: 2 }}>
                        <Slider
                            value={borderIntensity}
                            onChange={handleIntensityChange}
                            min={0}
                            max={1}
                            step={0.1}
                            marks={[
                                { value: 0, label: '0%' },
                                { value: 0.5, label: '50%' },
                                { value: 1, label: '100%' },
                            ]}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                            color="primary"
                        />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Ajusta la intensidad del borde para cambiar la visibilidad de los bordes en la interfaz.
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" mb={2} mt={3}>
                        Color del Borde
                    </Typography>
                    <Box sx={{ px: 2 }}>
                        <Slider
                            value={borderColorIntensity}
                            onChange={handleColorIntensityChange}
                            min={0}
                            max={1}
                            step={0.1}
                            marks={[
                                { value: 0, label: 'Negro' },
                                { value: 0.5, label: 'Gris' },
                                { value: 1, label: 'Azul' },
                            ]}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                            color="primary"
                        />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Ajusta el color del borde: 0% es negro, 50% es gris claro y 100% es azul primario.
                    </Typography>
                </CardContent>
            </Card>

            {/* Sección Alertas */}
            <Card elevation={3} sx={{ borderRadius: 2, mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Alertas
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                        Posición de Notificaciones
                    </Typography>
                    <ButtonGroup variant="outlined" fullWidth sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
                        {posiciones.map((pos) => (
                            <Button
                                key={pos}
                                onClick={() => handleToasterPositionChange(pos)}
                                variant={toasterPosition === pos ? 'contained' : 'outlined'}
                                size="small"
                                sx={{ fontSize: '12px', textTransform: 'none' }}
                            >
                                {pos.split('-')[0].charAt(0).toUpperCase() + pos.split('-')[0].slice(1).toLowerCase()}-{pos.split('-')[1].charAt(0).toUpperCase()}
                            </Button>
                        ))}
                    </ButtonGroup>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                        Selecciona dónde deseas que aparezcan las notificaciones.
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                        Estilo de Alertas
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <Button
                            variant={toasterStyle === 'colorful' ? 'contained' : 'outlined'}
                            onClick={() => handleToasterStyleChange('colorful')}
                            fullWidth
                        >
                            Con Colores
                        </Button>
                        <Button
                            variant={toasterStyle === 'simple' ? 'contained' : 'outlined'}
                            onClick={() => handleToasterStyleChange('simple')}
                            fullWidth
                        >
                            Simple
                        </Button>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                        Elige entre alertas con colores ricos o estilo simple y limpio.
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleShowTestToast}
                    >
                        Mostrar Toast de Prueba
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CustomPage;
