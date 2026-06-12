import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Grid, InputAdornment, Paper, Stack, TextField, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import { QrCodeScanner as QrCodeScannerIcon, Search as SearchIcon, QrCode2 } from '@mui/icons-material';
import { toast } from 'sonner';
import QrProductScanner from '../../../ventas/presentation/components/lectorSkuQr';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import { VarianteRepository } from '../../infrastructure/repositories/variante.repository';
import type { ProductoBusquedaDetalle, Variante } from '../../domain/interfaces/producto.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

type AttributeOptions = Record<string, string[]>;

type AttributeFilterProps = {
    attributeName: string;
    values: string[];
    selectedValue?: string;
    onSelect: (attributeName: string, value: string) => void;
    isOptionDisabled: (attributeName: string, value: string) => boolean;
};

const AttributeFilterGroup = ({ attributeName, values, selectedValue, onSelect, isOptionDisabled }: AttributeFilterProps) => {
    const isColorAttribute = attributeName.toLowerCase().includes('color');

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
                {attributeName}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
                {values.map((value) => {
                    const selected = value === selectedValue;
                    const disabled = isOptionDisabled(attributeName, value);

                    if (isColorAttribute) {
                        return (
                            <Chip
                                key={value}
                                label={value}
                                clickable={!disabled}
                                onClick={() => !disabled && onSelect(attributeName, value)}
                                variant={selected ? 'filled' : 'outlined'}
                                color={selected ? 'primary' : 'default'}
                                disabled={disabled}
                                sx={{
                                    minWidth: 88,
                                    borderRadius: 2,
                                    px: 1.5,
                                    py: 1,
                                    textTransform: 'none'
                                }}
                            />
                        );
                    }

                    return (
                        <Button
                            key={value}
                            variant={selected ? 'contained' : 'outlined'}
                            color={selected ? 'primary' : 'inherit'}
                            onClick={() => onSelect(attributeName, value)}
                            disabled={disabled}
                            sx={{
                                minWidth: 64,
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 2,
                                py: 1
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

        return !searchResult.variantes.some((variant) =>
            variant.valores?.some((valor) => valor.atributo?.nombre === attributeName && valor.valor === optionValue)
        );
    };

    const handleAttributeSelect = (attributeName: string, value: string) => {
        if (!searchResult) return;

        const variantsWithOption = searchResult.variantes.filter((variant) =>
            variant.valores?.some((valor) => valor.atributo?.nombre === attributeName && valor.valor === value)
        );

        const currentSelection = Object.fromEntries(
            Object.entries(selectedAttributes).filter(([key]) => key !== attributeName)
        );

        const compatibleVariant = variantsWithOption.find((variant) => isVariantMatch(variant, currentSelection));
        const targetVariant = compatibleVariant ?? variantsWithOption[0];

        if (targetVariant) {
            setSelectedAttributes(getVariantValues(targetVariant));
            return;
        }

        setSelectedAttributes((prev) => ({
            ...prev,
            [attributeName]: value
        }));
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

    const selectedVariantImage = activeVariant?.url_imagen || searchResult?.producto.url_imagen;

    return (
        <Box p={4}>
            <Typography variant="h5" fontWeight={700} mb={2}>
                Buscar productos por código
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <TextField
                            fullWidth
                            label="Código, SKU o QR"
                            value={codigo}
                            onChange={(event) => setCodigo(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                            placeholder="Escanea o escribe un código para buscar"
                        />
                    </Box>
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ width: '100%', maxWidth: isMobile ? '100%' : '380px' }}>
                        <Button fullWidth variant="contained" onClick={handleSearch}>
                            Buscar
                        </Button>
                        <Button fullWidth variant="outlined" startIcon={<QrCodeScannerIcon />} onClick={() => setOpenScanner(true)}>
                            Escanear
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {loading && (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            )}

            {searchResult && (
                <Box>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Box
                                    component="img"
                                    src={selectedVariantImage ? `${import.meta.env.VITE_API_URL}/${selectedVariantImage}` : undefined}
                                    alt={searchResult.producto.nombre}
                                    sx={{
                                        width: '100%',
                                        height: isMobile ? 320 : 420,
                                        objectFit: 'contain',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'background.default'
                                    }}
                                />
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 7 }}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Stack spacing={2}>
                                    <Typography variant="h4" fontWeight={700}>
                                        {searchResult.producto.nombre}
                                    </Typography>
                                    <Typography color="text.secondary">SKU producto: {searchResult.producto.sku}</Typography>

                                    {activeVariant ? (
                                        <Stack spacing={1}>
                                            <Typography variant="h6" fontWeight={700}>
                                                {activeVariant.sku ?? activeVariant.id}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Código secuencial: {activeVariant.codigo_secuencial ?? 'N/A'}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                QR: {activeVariant.qr_codigo ?? 'N/A'}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Codigo de barras: {activeVariant.codigo_barras ?? 'N/A'}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Precio: {activeVariant.precio_sugerido != null ? formatMoney(activeVariant.precio_sugerido) : 'N/A'}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Stock: {activeVariant.stock_total != null ? activeVariant.stock_total : 'N/A'}
                                            </Typography>
                                        </Stack>
                                    ) : (
                                        <Typography color="text.secondary">No existe una variante válida con la combinación seleccionada.</Typography>
                                    )}

                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {searchResult.producto.atributos?.map((atributo) => (
                                            <Chip key={atributo.id} label={atributo.nombre} size="small" />
                                        ))}
                                    </Stack>

                                    <Button variant="outlined" startIcon={<QrCode2 />} onClick={() => navigate(`/productos/${searchResult.producto.id}`)}>
                                        Ver producto completo
                                    </Button>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight={700}>
                                Configura tu producto
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Selecciona la combinación de atributos disponible para encontrar la variante correcta.
                            </Typography>

                            <Stack spacing={3}>
                                {Object.entries(attributeOptions).map(([attributeName, values]) => (
                                    <AttributeFilterGroup
                                        key={attributeName}
                                        attributeName={attributeName}
                                        values={values}
                                        selectedValue={selectedAttributes[attributeName]}
                                        onSelect={handleAttributeSelect}
                                        isOptionDisabled={isOptionDisabled}
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    </Paper>
                </Box>
            )}

            <QrProductScanner open={openScanner} onClose={() => setOpenScanner(false)} onCodigoLeido={handleCodigoLeido} />
        </Box>
    );
};

export default BuscarProductosPage;
