import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Box, Button, Card, CardContent, CardActions, Grid, Typography, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { Add, Delete, Edit, Inventory2, PhotoCamera, QrCode, Download } from '@mui/icons-material';
import { toast } from 'sonner';
import { useForm, type Resolver } from 'react-hook-form';
import CodigoModal from '../../components/CodigoModal';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import BarcodeRenderer from '../../../../../shared/components/BarcodeRenderer';
import ConfirmDialog from '../../../../../shared/components/ui/dialog/ConfirmDialog';
import Loading from '../../../../../shared/components/ui/Loaders/Loading';
import { VarianteRepository } from '../../../infrastructure/repositories/variante.repository';
import { AtributoRepository } from '../../../../atributos/infrastructure/atributo.repository';
import type { Variante } from '../../../domain/interfaces/producto.interface';
import { bajarCalidadImagen } from '../../../../../core/utils/bajarCalidadImagen';

const variantFormSchema = z.object({
    precio_sugerido: z.coerce.number().min(0, 'El precio sugerido es obligatorio'),
    codigo_barras: z.string().max(100, 'El código de barras no puede superar 100 caracteres').optional().nullable()
});

type VarianteForm = z.infer<typeof variantFormSchema>;

const defaultForm: VarianteForm = {
    precio_sugerido: 0,
    codigo_barras: null
};

interface Props {
    productoId: string;
    onRefresh: () => Promise<void>;
}

const ProductoVariantesTab = ({ productoId, onRefresh }: Props) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [editingVariant, setEditingVariant] = useState<Variante | null>(null);
    const [saving, setSaving] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [variantToDelete, setVariantToDelete] = useState<Variante | null>(null);
    const [uploadingVariantId, setUploadingVariantId] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [variants, setVariants] = useState<Variante[]>([]);
    const [loadingVariants, setLoadingVariants] = useState(true);
    const [atributos, setAtributos] = useState<any[]>([]);
    const [attributeSelections, setAttributeSelections] = useState<Array<{ id: string; atributo_id: string; valor_id: string }>>([]);
    const [openCodigoModal, setOpenCodigoModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<VarianteForm>({
        resolver: zodResolver(variantFormSchema) as Resolver<VarianteForm>,
        defaultValues: defaultForm
    });

    useEffect(() => {
        if (editingVariant) {
            reset({
                precio_sugerido: editingVariant.precio_sugerido ?? 0,
                codigo_barras: editingVariant.codigo_barras ?? null
            });

            const rows = ((editingVariant as any)?.valores ?? []).map((valor: any) => ({
                id: `${valor.atributo_id}-${valor.id}`,
                atributo_id: valor.atributo_id,
                valor_id: valor.id
            }));
            setAttributeSelections(Array.isArray(rows) ? rows : []);
        } else {
            reset(defaultForm);
            setAttributeSelections([]);
        }
    }, [editingVariant, reset]);

    useEffect(() => {
        const fetchAtributos = async () => {
            try {
                const resp = await AtributoRepository.listar();
                const data = (resp as any)?.data?.data ?? (resp as any)?.data ?? [];
                setAtributos(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
            }
        };

        fetchAtributos();
    }, []);

    const handleOpenCreate = () => {
        setEditingVariant(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (variant: Variante) => {
        setEditingVariant(variant);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingVariant(null);
    };

    const handleAddAttributeRow = () => {
        setAttributeSelections((prev) => [
            ...prev,
            { id: `row-${Date.now()}-${prev.length}`, atributo_id: '', valor_id: '' }
        ]);
    };

    const handleRemoveAttributeRow = (rowId: string) => {
        setAttributeSelections((prev) => prev.filter((row) => row.id !== rowId));
    };

    const handleAttributeChange = (rowId: string, atributoId: string) => {
        setAttributeSelections((prev) => prev.map((row) => row.id === rowId ? { ...row, atributo_id: atributoId, valor_id: '' } : row));
    };

    const handleValorChange = (rowId: string, valorId: string) => {
        setAttributeSelections((prev) => prev.map((row) => row.id === rowId ? { ...row, valor_id: valorId } : row));
    };

    const handleOpenCodigoModal = () => {
        setOpenCodigoModal(true);
    };

    const handleCloseCodigoModal = () => {
        setOpenCodigoModal(false);
    };

    const handleCodigoCaptured = (codigo: string) => {
        setValue('codigo_barras', codigo);
        handleCloseCodigoModal();
    };

    const downloadBarcode = (svgRef: SVGSVGElement, sku: string) => {
        const serialized = new XMLSerializer().serializeToString(svgRef);
        const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `barcode-${sku}.svg`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadQR = (sku: string) => {
        const svgElement = document.querySelector(`[data-qr-ref="${sku}"] svg`) as SVGSVGElement;
        if (!svgElement) {
            toast.error('No se pudo descargar el QR');
            return;
        }

        const serialized = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-${sku}.svg`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const onSubmit = async (data: VarianteForm) => {
        setSaving(true);

        try {
            const payload: any = {
                precio_sugerido: data.precio_sugerido,
                codigo_barras: data.codigo_barras?.trim() || null
            };

            const valor_atributo_ids = attributeSelections
                .map((row) => row.valor_id)
                .filter(Boolean);
            if (valor_atributo_ids.length) payload.valor_atributo_ids = valor_atributo_ids;

            if (editingVariant) {
                await VarianteRepository.actualizar(editingVariant.id, payload);
                toast.success('Variante actualizada correctamente');
            } else {
                await VarianteRepository.crear(productoId, payload);
                toast.success('Variante creada correctamente');
            }

            await onRefresh();
            await fetchVariants();
            handleCloseDialog();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar la variante');
        } finally {
            setSaving(false);
        }
    };

    const fetchVariants = async () => {
        setLoadingVariants(true);
        try {
            const resp = await VarianteRepository.listarPorProducto(productoId);
            // resp may be AxiosResponse<{ data: Variante[] }> or { data: Variante[] }
            const data = (resp as any)?.data?.data ?? (resp as any)?.data ?? [];
            setVariants(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setVariants([]);
        } finally {
            setLoadingVariants(false);
        }
    };

    const handleDelete = async () => {
        if (!variantToDelete) return;
        setSaving(true);

        try {
            await VarianteRepository.eliminar(variantToDelete.id);
            toast.success('Variante eliminada correctamente');
            await onRefresh();
            await fetchVariants();
            setOpenDelete(false);
            setVariantToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar la variante');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateQr = async (variant: Variante) => {
        setSaving(true);

        try {
            await VarianteRepository.generarQr(variant.id);
            toast.success('QR generado correctamente');
            await onRefresh();
            await fetchVariants();
        } catch (error) {
            console.error(error);
            toast.error('Error al generar el QR');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenImageUpload = (variantId: string) => {
        setUploadingVariantId(variantId);
        fileInputRef.current?.click();
    };

    const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !uploadingVariantId) return;

        setUploadingImage(true);

        try {
            const compressedFile = await bajarCalidadImagen(file);
            await VarianteRepository.subirImagen(uploadingVariantId, compressedFile);
            toast.success('Imagen de variante actualizada correctamente');
            await onRefresh();
            await fetchVariants();
        } catch (error) {
            console.error(error);
            toast.error('Error al subir la imagen de la variante');
        } finally {
            setUploadingVariantId(null);
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    useEffect(() => {
        fetchVariants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productoId]);

    if (loadingVariants) return <Loading />;

    return (
        <Box>
            <Grid container direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Grid size={{ xs: 12, md: 'auto' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Inventory2 color="action" />
                        <Typography variant="h6" fontWeight={700}>Variantes</Typography>
                        <Chip label={`${variants.length} activas`} size="small" variant="outlined" color="primary" />
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 'auto' }}>
                    <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
                        Crear variante
                    </Button>
                </Grid>
            </Grid>

            {variants.length === 0 ? (
                <Card variant="outlined" sx={{ borderStyle: 'dashed', textAlign: 'center', py: 6, bgcolor: 'background.default' }}>
                    <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            No hay variantes registradas
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Agrega una variante para poder registrar lotes y mejorar el control de inventario.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={2}>
                    {variants.map((variant) => (
                        <Grid key={variant.id} size={{ xs: 12, sm: 6 }}>
                            <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack spacing={2}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="text.secondary">SKU</Typography>
                                            <Typography variant="h6" fontWeight={700}>{variant.sku || variant.id}</Typography>

                                            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                                                <Chip label={`Precio: S/ ${variant.precio_sugerido ?? 0}`} size="small" />
                                                <Chip label={`Stock: ${variant.stock_total ?? 0}`} size="small" variant='outlined' color={variant.stock_total && variant.stock_total > 0 ? 'success' : 'default'} />
                                            </Stack>
                                        </Stack>

                                        {variant.url_imagen ? (
                                            <Box
                                                component="img"
                                                src={`${import.meta.env.VITE_API_URL }/${variant.url_imagen}`}
                                                alt={variant.sku ?? 'Variante'}
                                                sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                                            />
                                        ) : (
                                            <Box sx={{ width: '100%', height: 180, borderRadius: 2, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                                                <Typography variant="body2" color="text.secondary">No hay imagen de variante</Typography>
                                            </Box>
                                        )}

                                        <Divider />

                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="text.secondary">Código de barras</Typography>
                                            {variant.codigo_barras ? (
                                                <Box>
                                                    <BarcodeRenderer value={variant.codigo_barras} onDownload={(svg) => downloadBarcode(svg, variant.sku || variant.id)} />
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">Aún no tiene código de barras.</Typography>
                                            )}
                                        </Stack>

                                        {variant.valores && variant.valores.length > 0 ? (
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2" color="text.secondary">Atributos</Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    {variant.valores.map((valor) => (
                                                        <Chip key={valor.id} label={`${valor.atributo?.nombre ?? 'Atributo'}: ${valor.valor}`} size="small" />
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        ) : null}

                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="text.secondary">QR</Typography>
                                            {variant.qr_codigo ? (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} justifyContent="center">
                                                    <Box data-qr-ref={variant.sku || variant.id}>
                                                        <QRCodeSVG value={variant.qr_codigo} size={200} bgColor="#ffffff" fgColor="#000000" includeMargin />
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', justifyContent: 'center', display: 'flex' }}>
                                                        {variant.qr_codigo}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => downloadQR(variant.sku || variant.id)} title="Descargar QR" sx={{ mt: 1 }}>
                                                        <Download fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">Aún no tiene QR generado.</Typography>
                                            )}
                                        </Stack>
                                    </Stack>
                                </CardContent>

                                <CardActions sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, p: 2 }}>
                                    <Button size="small" startIcon={<PhotoCamera />} onClick={() => handleOpenImageUpload(variant.id)} disabled={uploadingImage && uploadingVariantId === variant.id}>
                                        {uploadingImage && uploadingVariantId === variant.id ? 'Subiendo...' : 'Subir imagen'}
                                    </Button>
                                    <Button size="small" startIcon={<QrCode />} onClick={() => handleGenerateQr(variant)}>
                                        {variant.qr_codigo ? 'Regenerar QR' : 'Generar QR'}
                                    </Button>
                                    <Button size="small" startIcon={<Edit />} onClick={() => handleOpenEdit(variant)}>
                                        Editar
                                    </Button>
                                    <Button size="small" color="error" startIcon={<Delete />} onClick={() => {
                                        setVariantToDelete(variant);
                                        setOpenDelete(true);
                                    }}>
                                        Eliminar
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{editingVariant ? 'Editar variante' : 'Crear variante'}</DialogTitle>
                <DialogContent sx={{ py: 2 }}>
                    <Stack spacing={2}>
                        {editingVariant ? (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">SKU</Typography>
                                <Typography variant="body1" fontWeight={700}>{editingVariant.sku ?? editingVariant.id}</Typography>
                            </Box>
                        ) : null}

                        <TextField
                            label="Precio sugerido"
                            type="number"
                            placeholder="0"
                            error={!!errors.precio_sugerido}
                            helperText={errors.precio_sugerido?.message}
                            {...register('precio_sugerido', { valueAsNumber: true })}
                            fullWidth
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                            <TextField
                                label="Código de barras"
                                error={!!errors.codigo_barras}
                                helperText={errors.codigo_barras?.message}
                                {...register('codigo_barras')}
                                fullWidth
                            />
                            <Button
                                variant="outlined"
                                startIcon={<QrCode />}
                                sx={{ whiteSpace: 'nowrap', minWidth: 160 }}
                                onClick={handleOpenCodigoModal}
                            >
                                Escanear
                            </Button>
                        </Stack>

                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2" color="text.secondary">Atributos</Typography>
                                <Button size="small" startIcon={<Add />} onClick={handleAddAttributeRow}>
                                    Agregar atributo
                                </Button>
                            </Stack>

                            {attributeSelections.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">Agrega atributos a la variante para caracterizarla.</Typography>
                            ) : null}

                            <Stack spacing={2}>
                                {attributeSelections.map((row) => {
                                    const selectedAtributo = atributos.find((attr) => attr.id === row.atributo_id);
                                    const selectedIds = attributeSelections.map((item) => item.atributo_id).filter(Boolean);
                                    const availableAtributos = atributos.filter((attr) => !selectedIds.includes(attr.id) || attr.id === row.atributo_id);

                                    return (
                                        <Stack key={row.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-end">
                                            <FormControl fullWidth>
                                                <InputLabel id={`attr-${row.id}-label`}>Atributo</InputLabel>
                                                <Select
                                                    labelId={`attr-${row.id}-label`}
                                                    value={row.atributo_id}
                                                    label="Atributo"
                                                    onChange={(e) => handleAttributeChange(row.id, e.target.value as string)}
                                                >
                                                    <MenuItem value="">--</MenuItem>
                                                    {availableAtributos.map((atributo) => (
                                                        <MenuItem key={atributo.id} value={atributo.id}>{atributo.nombre}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <FormControl fullWidth disabled={!row.atributo_id}>
                                                <InputLabel id={`valor-${row.id}-label`}>Valor</InputLabel>
                                                <Select
                                                    labelId={`valor-${row.id}-label`}
                                                    value={row.valor_id}
                                                    label="Valor"
                                                    onChange={(e) => handleValorChange(row.id, e.target.value as string)}
                                                >
                                                    <MenuItem value="">--</MenuItem>
                                                    {(selectedAtributo?.valores || []).map((valor: any) => (
                                                        <MenuItem key={valor.id} value={valor.id}>{valor.valor}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <Button color="error" variant="outlined" onClick={() => handleRemoveAttributeRow(row.id)}>
                                                Eliminar
                                            </Button>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </Box>

                        <CodigoModal
                            open={openCodigoModal}
                            onClose={handleCloseCodigoModal}
                            onCodigoCaptured={handleCodigoCaptured}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving || isSubmitting}>
                        {editingVariant ? 'Guardar cambios' : 'Crear variante'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={openDelete}
                title="¿Eliminar variante?"
                description={`Estás a punto de eliminar la variante ${variantToDelete?.sku ?? variantToDelete?.id}. Esta acción es irreversible.`}
                onClose={() => !saving && setOpenDelete(false)}
                onConfirm={handleDelete}
                isLoading={saving}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageFileChange}
            />
        </Box>
    );
};

export default ProductoVariantesTab;
