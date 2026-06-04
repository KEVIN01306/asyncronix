import { Box, Card, CardContent, Typography, Radio, RadioGroup, FormControlLabel, Slider, Divider } from '@mui/material';
import { useUiStore } from '../../../../core/store/uiStore';

export const CustomPage = () => {
    const themeSource = useUiStore((state) => state.themeSource);
    const setThemeSource = useUiStore((state) => state.setThemeSource);
    const borderIntensity = useUiStore((state) => state.borderIntensity);
    const setBorderIntensity = useUiStore((state) => state.setBorderIntensity);
    const borderColorIntensity = useUiStore((state) => state.borderColorIntensity);
    const setBorderColorIntensity = useUiStore((state) => state.setBorderColorIntensity);

    const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setThemeSource(event.target.value as 'system' | 'light' | 'dark');
    };

    const handleIntensityChange = (_event: Event, newValue: number | number[]) => {
        setBorderIntensity(Array.isArray(newValue) ? newValue[0] : newValue);
    };

    const handleColorIntensityChange = (_event: Event, newValue: number | number[]) => {
        setBorderColorIntensity(Array.isArray(newValue) ? newValue[0] : newValue);
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
        </Box>
    );
};

export default CustomPage;
