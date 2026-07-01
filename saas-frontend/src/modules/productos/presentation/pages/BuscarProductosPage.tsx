import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Grid, InputAdornment, Paper, Stack, TextField, Typography, useMediaQuery, useTheme, Divider, Tooltip } from '@mui/material';
import { QrCodeScanner as QrCodeScannerIcon, Search as SearchIcon, QrCode2 } from '@mui/icons-material';
import { toast } from 'sonner';
import QrProductScanner from '../../../ventas/presentation/components/lectorSkuQr';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import { VarianteRepository } from '../../infrastructure/repositories/variante.repository';
import type { ProductoBusquedaDetalle, Variante } from '../../domain/interfaces/producto.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

type AttributeOptions = Record<string, string[]>;

type AttributeFilterProps = {
    attributeName: string;
    values: string[];
    selectedValue?: string;
    onSelect: (attributeName: string, value: string) => void;
    isOptionDisabled: (attributeName: string, value: string) => boolean;
    theme: any;
};

const COLOR_MAP: Record<string, { background: string }> = {
    // Básicos
    'rojo': { background: '#E53935' },
    'azul': { background: '#1E88E5' },
    'negro': { background: '#111111' },
    'blanco': { background: '#FFFFFF' },
    'gris': { background: '#757575' },
    'verde': { background: '#43A047' },
    'amarillo': { background: '#FDD835' },
    'naranja': { background: '#FB8C00' },
    'morado': { background: '#8E24AA' },
    'violeta': { background: '#7E57C2' },
    'rosado': { background: '#D81B60' },
    'rosa': { background: '#F48FB1' },

    // Metálicos
    'dorado': { background: '#FFD700' },
    'oro': { background: '#FFD700' },
    'plata': { background: '#C0C0C0' },
    'bronce': { background: '#CD7F32' },
    'cobre': { background: '#B87333' },

    // Tonos tierra
    'cafe': { background: '#6D4C41' },
    'café': { background: '#6D4C41' },
    'marron': { background: '#5D4037' },
    'marrón': { background: '#5D4037' },
    'beige': { background: '#F5F5DC' },
    'crema': { background: '#FFFDD0' },
    'caqui': { background: '#C3B091' },
    'khaki': { background: '#C3B091' },
    'arena': { background: '#D2B48C' },
    'camel': { background: '#C19A6B' },
    'caramelo': { background: '#AF6F09' },
    'chocolate': { background: '#5D4037' },
    'terracota': { background: '#E2725B' },

    // Azules
    'celeste': { background: '#4FC3F7' },
    'azul cielo': { background: '#87CEEB' },
    'azul marino': { background: '#1A237E' },
    'azul rey': { background: '#4169E1' },
    'azul eléctrico': { background: '#2962FF' },
    'azul electrico': { background: '#2962FF' },
    'azul petróleo': { background: '#01579B' },
    'azul petroleo': { background: '#01579B' },
    'turquesa': { background: '#40E0D0' },

    // Verdes
    'verde limón': { background: '#AEEA00' },
    'verde limon': { background: '#AEEA00' },
    'verde oliva': { background: '#556B2F' },
    'oliva': { background: '#556B2F' },
    'verde militar': { background: '#4B5320' },
    'verde agua': { background: '#7FFFD4' },
    'menta': { background: '#98FF98' },
    'esmeralda': { background: '#50C878' },
    'jade': { background: '#00A86B' },

    // Rojos y rosados
    'vino': { background: '#722F37' },
    'borgoña': { background: '#800020' },
    'borgona': { background: '#800020' },
    'granate': { background: '#8B0000' },
    'coral': { background: '#FF7F50' },
    'salmón': { background: '#FA8072' },
    'salmon': { background: '#FA8072' },
    'fucsia': { background: '#FF00FF' },
    'magenta': { background: '#FF00FF' },

    // Morados
    'lila': { background: '#C8A2C8' },
    'lavanda': { background: '#E6E6FA' },
    'ciruela': { background: '#8E4585' },

    // Amarillos y naranjas
    'mostaza': { background: '#D4A017' },
    'ambar': { background: '#FFBF00' },
    'ámbar': { background: '#FFBF00' },
    'durazno': { background: '#FFCBA4' },
    'melocotón': { background: '#FFCBA4' },
    'melocoton': { background: '#FFCBA4' },

    // Blancos y neutros
    'marfil': { background: '#FFFFF0' },
    'hueso': { background: '#F9F6EE' },
    'perla': { background: '#F8F6F0' },
    'gris claro': { background: '#BDBDBD' },
    'gris oscuro': { background: '#424242' },
    'gris grafito': { background: '#383838' },
    'antracita': { background: '#293133' },

    // Negros especiales
    'carbon': { background: '#212121' },
    'carbón': { background: '#212121' },

    // Otros comunes en retail
    'transparente': { background: '#E0E0E080' },
    'multicolor': {
        background:
            'linear-gradient(45deg, #E53935, #FB8C00, #FDD835, #43A047, #1E88E5, #8E24AA)',
    },    
    'animal print': { background: '#A1887F' },
    'leopardo': { background: '#A1887F' },
    'camuflaje': { background: '#6B8E23' },
};

// Helper seguro para extraer el color CSS correspondiente
const getColorHex = (colorName: string): string => {
    const normalized = colorName.trim().toLowerCase();
    return COLOR_MAP[normalized]?.background || colorName; 
};

const AttributeFilterGroup = ({ 
    attributeName, 
    values, 
    selectedValue, 
    onSelect, 
    isOptionDisabled, 
    theme 
}: AttributeFilterProps) => {
    
    const isColorAttribute = attributeName.toLowerCase().includes('color');

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5} textTransform="uppercase" letterSpacing={0.5}>
                {attributeName}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
                {values.map((value) => {
                    const selected = value === selectedValue;
                    const disabled = isOptionDisabled(attributeName, value);

                    // --- RENDERIZADO CUANDO ES ATRIBUTO COLOR ---
                    if (isColorAttribute) {
                        const hexColor = getColorHex(value);
                        // Detectamos si es blanco o muy claro para pintarle un borde sutil y que no se pierda en fondos claros
                        const isClearColor = ['#ffffff', 'blanco', '#fff', '#fffdd0', 'crema', 'beige', '#f5f5dc'].includes(hexColor.toLowerCase());

                        return (
                            <Tooltip key={value} title={value} placement="top">
                            <Box
                                key={value}
                                onClick={() => !disabled && onSelect(attributeName, value)}
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '50%',
                                    background: hexColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    opacity: disabled ? 0.3 : 1,
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    
                                    // Efecto de anillo exterior si está seleccionado
                                    border: selected 
                                        ? `2px solid ${theme.palette.text.primary}` 
                                        : isClearColor 
                                            ? `1px solid ${theme.palette.divider}` 
                                            : '1px solid transparent',
                                    
                                    // Crea una separación limpia entre el aro exterior y el color del círculo
                                    boxShadow: selected ? `0 0 0 3px ${theme.palette.background.paper} inset` : 'none',
                                    
                                    '&:hover': {
                                        transform: disabled ? 'none' : 'scale(1.12)',
                                        border: disabled ? 'none' : `1px solid ${theme.palette.text.primary}`,
                                    }
                                }}
                                title={value}
                            />
                            </Tooltip>
                        );
                    }

                    // --- RENDERIZADO POR DEFECTO (TALLES, SKU, ETC.) ---
                    return (
                        <Button
                            key={value}
                            variant={selected ? 'contained' : 'outlined'}
                            onClick={() => onSelect(attributeName, value)}
                            disabled={disabled}
                            sx={{
                                minWidth: 54,
                                height: 48,
                                borderRadius: 0, // Estética Adidas / Minimalista
                                border: selected 
                                    ? `2px solid ${theme.palette.primary}` 
                                    : `1px solid ${theme.palette.divider}`,
                                bgcolor: selected ? theme.palette.primary : 'transparent',
                                color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
                                textTransform: 'none',
                                fontWeight: selected ? 700 : 400,
                                px: 2,
                                transition: 'all 0.15s ease',
                                '&:disabled': {
                                    border: `1px solid ${theme.palette.action.disabledBackground}`,
                                    color: theme.palette.text.disabled
                                }
                            }}
                        >
                            {value}
                        </Button>
                    );
                })}
            </Stack>
        </Box>
    );
};

const BuscarProductosPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [codigo, setCodigo] = useState('');
    const [searchResult, setSearchResult] = useState<ProductoBusquedaDetalle | null>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [openScanner, setOpenScanner] = useState(false);

    useEffect(() => {
        if (!searchResult) {
            setSelectedAttributes({});
            return;
        }

        const initialAttributes: Record<string, string> = {};
        searchResult.varianteSeleccionada.valores?.forEach((valor) => {
            const atributoNombre = valor.atributo?.nombre;
            if (atributoNombre && valor.valor) {
                initialAttributes[atributoNombre] = valor.valor;
            }
        });

        setSelectedAttributes(initialAttributes);
    }, [searchResult]);

    const attributeOptions = useMemo<AttributeOptions>(() => {
        if (!searchResult) return {};

        const options: AttributeOptions = {};
        const orderedNames: string[] = [];

        (searchResult.producto.atributos ?? []).forEach((atributo) => {
            orderedNames.push(atributo.nombre);
        });

        searchResult.variantes.forEach((variant) => {
            variant.valores?.forEach((valor) => {
                const name = valor.atributo?.nombre;
                const optionValue = valor.valor;
                if (!name || optionValue == null) return;

                if (!options[name]) {
                    options[name] = [];
                }

                if (!options[name].includes(optionValue)) {
                    options[name].push(optionValue);
                }

                if (!orderedNames.includes(name)) {
                    orderedNames.push(name);
                }
            });
        });

        const orderedOptions: AttributeOptions = {};
        orderedNames.forEach((name) => {
            if (options[name]) {
                orderedOptions[name] = options[name];
            }
        });

        Object.keys(options).forEach((name) => {
            if (!orderedOptions[name]) {
                orderedOptions[name] = options[name];
            }
        });

        return orderedOptions;
    }, [searchResult]);

    const primaryAttributeName = Object.keys(attributeOptions)[0] ?? '';

    const isVariantMatch = (variant: Variante, attributes: Record<string, string>) => {
        return Object.entries(attributes).every(([attributeName, optionValue]) =>
            variant.valores?.some((valor) => valor.atributo?.nombre === attributeName && valor.valor === optionValue)
        );
    };

    const getVariantValues = (variant: Variante) => {
        const values: Record<string, string> = {};
        variant.valores?.forEach((valor) => {
            if (valor.atributo?.nombre && valor.valor) {
                values[valor.atributo.nombre] = valor.valor;
            }
        });
        return values;
    };

    const activeVariant = useMemo<Variante | null>(() => {
        if (!searchResult) return null;
        if (Object.keys(selectedAttributes).length === 0) {
            return searchResult.varianteSeleccionada;
        }

        return searchResult.variantes.find((variant) => isVariantMatch(variant, selectedAttributes)) ?? null;
    }, [searchResult, selectedAttributes]);

    const isOptionDisabled = (attributeName: string, optionValue: string) => {
        if (!searchResult) return true;
        if (!primaryAttributeName) return false;

        const primarySelection = selectedAttributes[primaryAttributeName];
        if (!primarySelection || attributeName === primaryAttributeName) {
            return !searchResult.variantes.some((variant) =>
                variant.valores?.some((valor) => valor.atributo?.nombre === attributeName && valor.valor === optionValue)
            );
        }

        return !searchResult.variantes.some((variant) =>
            variant.valores?.some((valor) => valor.atributo?.nombre === primaryAttributeName && valor.valor === primarySelection) &&
            variant.valores?.some((valor) => valor.atributo?.nombre === attributeName && valor.valor === optionValue)
        );
    };

    const handleAttributeSelect = (attributeName: string, value: string) => {
        if (!searchResult) return;

        const updatedSelection = {
            ...selectedAttributes,
            [attributeName]: value
        };

        if (attributeName === primaryAttributeName) {
            // When primary attribute changes, keep only compatible secondary selections.
            const compatibleVariants = searchResult.variantes.filter((variant) =>
                variant.valores?.some((valor) => valor.atributo?.nombre === primaryAttributeName && valor.valor === value)
            );

            const validSecondaryValues = Object.entries(updatedSelection).reduce<Record<string, string>>((acc, [attr, selectedValue]) => {
                if (attr === primaryAttributeName) {
                    acc[attr] = selectedValue;
                    return acc;
                }

                const hasMatch = compatibleVariants.some((variant) =>
                    variant.valores?.some((valor) => valor.atributo?.nombre === attr && valor.valor === selectedValue)
                );

                if (hasMatch) acc[attr] = selectedValue;
                return acc;
            }, {});

            // Always keep the new primary attribute value.
            setSelectedAttributes(validSecondaryValues);
            return;
        }

        // For secondary attributes, use the current primary selection to keep compatibility.
        const primarySelection = selectedAttributes[primaryAttributeName];
        const variantsWithPrimary = primarySelection
            ? searchResult.variantes.filter((variant) =>
                variant.valores?.some((valor) => valor.atributo?.nombre === primaryAttributeName && valor.valor === primarySelection)
            )
            : searchResult.variantes;

        const compatibleVariant = variantsWithPrimary.find((variant) =>
            variant.valores?.some((valor) => valor.atributo?.nombre === attributeName && valor.valor === value) &&
            Object.entries(updatedSelection).every(([attr, selectedValue]) =>
                variant.valores?.some((valor) => valor.atributo?.nombre === attr && valor.valor === selectedValue)
            )
        );

        if (compatibleVariant) {
            setSelectedAttributes(getVariantValues(compatibleVariant));
            return;
        }

        setSelectedAttributes(updatedSelection);
    };

    const handleSearch = async () => {
        if (!codigo.trim()) {
            toast.error('Ingresa un código para buscar');
            return;
        }

        setLoading(true);
        setSearchResult(null);

        try {
            const response = await ProductoRepository.buscarPorCodigo(codigo.trim());
            const found = response.data;
            if (!found) {
                toast.error('No se encontró ninguna variante con ese código');
                return;
            }

            if (!found.producto?.id) {
                toast.error('No se encontró el producto asociado a la variante');
                return;
            }

            const producto = await ProductoRepository.obtener(found.producto.id);
            const variantesRes = await VarianteRepository.listarPorProducto(found.producto.id);
            setSearchResult({ producto, varianteSeleccionada: found, variantes: variantesRes.data });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al buscar el producto');
        } finally {
            setLoading(false);
        }
    };

    const handleCodigoLeido = async (valor: string) => {
        setOpenScanner(false);
        setCodigo(valor);
        setSearchResult(null);

        try {
            setLoading(true);
            const response = await ProductoRepository.buscarPorCodigo(valor);
            const found = response.data;
            if (!found) {
                toast.error('No se encontró ninguna variante con ese código');
                return;
            }

            if (!found.producto?.id) {
                toast.error('No se encontró el producto asociado a la variante');
                return;
            }

            const producto = await ProductoRepository.obtener(found.producto.id);
            const variantesRes = await VarianteRepository.listarPorProducto(found.producto.id);
            setSearchResult({ producto, varianteSeleccionada: found, variantes: variantesRes.data });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al buscar el producto');
        } finally {
            setLoading(false);
        }
    };

    const selectedVariantImage = activeVariant?.imagen?.url
        || searchResult?.producto.imagenes?.find((img) => img.es_principal)?.url
        || searchResult?.producto.imagenes?.[0]?.url
        || searchResult?.producto.url_imagen;

    return (
        <Box p={isMobile ? 2 : 4} bgcolor={theme.palette.background.paper} minHeight="100vh">
            <Typography variant="h5" fontWeight={800} mb={3} textTransform="uppercase" letterSpacing={1} color={theme.palette.text.primary}>
                Buscar productos por código
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 4, border: `1px solid ${theme.palette.divider}` }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 7 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Código, SKU o QR"
                            value={codigo}
                            onChange={(event) => setCodigo(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: theme.palette.text.primary }} />
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="Escanea o escribe un código para buscar"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Stack direction="row" spacing={2} sx={{ height: '56px' }}>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                onClick={handleSearch}
                                sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 700, '&:hover': { bgcolor: theme.palette.primary.dark } }}
                            >
                                Buscar
                            </Button>
                            <Button 
                                fullWidth 
                                variant="outlined" 
                                startIcon={<QrCodeScannerIcon />} 
                                onClick={() => setOpenScanner(true)}
                                sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main, fontWeight: 700, '&:hover': { borderColor: theme.palette.primary.main, bgcolor: theme.palette.action.hover } }}
                            >
                                Escanear
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {loading && (
                <Box display="flex" justifyContent="center" py={8}>
                    <Loading />
                </Box>
            )}

            {searchResult && (
                <Grid container spacing={isMobile ? 3 : 6}>
                    {/* COLUMNA IZQUIERDA: Galería/Imagen de producto limpia */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Box
                            sx={{
                                width: '100%',
                                height: isMobile ? 360 : 580,
                                bgcolor: theme.palette.action.hover,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${theme.palette.divider}`,
                                position: 'sticky',
                                top: 24,
                            }}
                        >
                            {selectedVariantImage ? (
                                <Box
                                    component="img"
                                    src={`${import.meta.env.VITE_API_URL}/${selectedVariantImage}`}
                                    alt={searchResult.producto.nombre}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : (
                                <Typography color="text.secondary">Sin imagen disponible</Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* COLUMNA DERECHA: Datos del producto ordenados por relevancia comercial y configurador */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Stack spacing={3}>
                            {/* Nombre y SKU base */}
                            <Box>
                                <Typography variant="h4" fontWeight={800} sx={{ textTransform: 'uppercase', lineHeight: 1.1, mb: 1, color: theme.palette.text.primary }}>
                                    {searchResult.producto.nombre}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    REFERENCIA BASE: {searchResult.producto.sku}
                                </Typography>
                            </Box>

                            {/* Información Financiera y Estado Crítico */}
                            {activeVariant ? (
                                <Box sx={{ my: 1 }}>
                                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary} mb={0.5}>
                                        {activeVariant.precio_sugerido != null ? formatMoney(activeVariant.precio_sugerido) : 'Precio N/A'}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} color={activeVariant.stock_total && activeVariant.stock_total > 0 ? "success.main" : "error.main"}>
                                        {activeVariant.stock_total != null ? `Disponibilidad: ${activeVariant.stock_total} unidades` : 'Stock N/A'}
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography variant="body1" color="error" fontWeight={600}>
                                    La combinación seleccionada no se encuentra disponible.
                                </Typography>
                            )}

                            <Divider />

                            {/* Panel de Configuración de Atributos (Intercalado exactamente como Adidas) */}
                            <Stack spacing={3.5} py={1}>
                                {Object.entries(attributeOptions).map(([attributeName, values]) => (
                                    <AttributeFilterGroup
                                        key={attributeName}
                                        attributeName={attributeName}
                                        values={values}
                                        selectedValue={selectedAttributes[attributeName]}
                                        onSelect={handleAttributeSelect}
                                        isOptionDisabled={isOptionDisabled}
                                        theme={theme}
                                    />
                                ))}
                            </Stack>

                            {/* Acción Principal */}
                            <Button 
                                variant="contained" 
                                startIcon={<QrCode2 />} 
                                onClick={() => navigate(`/productos/${searchResult.producto.id}`)}
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    borderRadius: 0,
                                    py: 2,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    '&:hover': { bgcolor: theme.palette.primary.dark }
                                }}
                            >
                                Ver producto completo
                            </Button>

                            <Divider />

                            {/* Detalles Técnicos / Administrativos de la Variante al final */}
                            {activeVariant && (
                                <Box sx={{ bgcolor: theme.palette.action.hover, p: 2, border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant="subtitle2" fontWeight={800} mb={1.5} textTransform="uppercase" color={theme.palette.text.primary}>
                                        Detalles de la Variante Activa
                                    </Typography>
                                    <Grid container spacing={1.5}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">SKU ESPECÍFICO</Typography>
                                            <Typography variant="body2" fontWeight={600}>{activeVariant.sku ?? activeVariant.id}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">CÓDIGO SECUENCIAL</Typography>
                                            <Typography variant="body2" fontWeight={600}>{activeVariant.codigo_secuencial ?? 'N/A'}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">CÓDIGO QR</Typography>
                                            <Typography variant="body2" fontWeight={600}>{activeVariant.qr_codigo ?? 'N/A'}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">CÓDIGO DE BARRAS</Typography>
                                            <Typography variant="body2" fontWeight={600}>{activeVariant.codigo_barras ?? 'N/A'}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            )}

            <QrProductScanner open={openScanner} onClose={() => setOpenScanner(false)} onCodigoLeido={handleCodigoLeido} />
        </Box>
    );
};

export default BuscarProductosPage;