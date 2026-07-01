import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Box, Button, Card, CardActions, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { Delete, Edit, PhotoCamera, Star } from '@mui/icons-material';
import { toast } from 'sonner';
import ConfirmDialog from '../../../../../shared/components/ui/dialog/ConfirmDialog';
import { bajarCalidadImagen } from '../../../../../core/utils/bajarCalidadImagen';
import type { ImagenProducto } from '../../../domain/interfaces/producto.interface';
import { ProductoRepository } from '../../../infrastructure/repositories/producto.repository';

interface Props {
    productoId: string;
    onRefresh: () => Promise<void>;
}

const ProductoImagenesTab = ({ productoId, onRefresh }: Props) => {
    const [imagenes, setImagenes] = useState<ImagenProducto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<{ id: string; action: 'principal' | 'eliminar' } | null>(null);
    const [uploadingToId, setUploadingToId] = useState<string | null>(null);
    const createFileInputRef = useRef<HTMLInputElement>(null);
    const updateFileInputRef = useRef<HTMLInputElement>(null);

    const fetchImagenes = async () => {
        setLoading(true);
        try {
            const data = await ProductoRepository.listarImagenes(productoId);
            setImagenes(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar las imágenes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImagenes();
    }, [productoId]);

    const handleCreate = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const descripcion = window.prompt('Descripción de la imagen (opcional):') ?? null;
            const optimizada = await bajarCalidadImagen(file);
            await ProductoRepository.subirImagen(productoId, optimizada, descripcion);
            await Promise.all([fetchImagenes(), onRefresh()]);
            toast.success('Imagen agregada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo agregar la imagen');
        } finally {
            if (createFileInputRef.current) createFileInputRef.current.value = '';
        }
    };

    const handleUpdateFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !uploadingToId) return;
        try {
            const optimizada = await bajarCalidadImagen(file);
            await ProductoRepository.actualizarArchivoImagen(uploadingToId, optimizada);
            await Promise.all([fetchImagenes(), onRefresh()]);
            toast.success('Imagen actualizada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo actualizar la imagen');
        } finally {
            setUploadingToId(null);
            if (updateFileInputRef.current) updateFileInputRef.current.value = '';
        }
    };

    const handleEditDescription = async (imagen: ImagenProducto) => {
        const descripcion = window.prompt('Nueva descripción:', imagen.descripcion ?? '');
        if (descripcion === null) return;
        try {
            await ProductoRepository.actualizarDescripcionImagen(imagen.id, descripcion || null);
            await fetchImagenes();
            toast.success('Descripción actualizada');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo actualizar la descripción');
        }
    };

    const handleConfirmAction = async () => {
        if (!selected) return;
        try {
            if (selected.action === 'principal') {
                await ProductoRepository.establecerImagenPrincipal(selected.id);
                toast.success('Imagen principal actualizada');
            } else {
                await ProductoRepository.eliminarImagen(selected.id);
                toast.success('Imagen eliminada');
            }
            await Promise.all([fetchImagenes(), onRefresh()]);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'No se pudo completar la acción');
        } finally {
            setSelected(null);
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Imágenes del producto</Typography>
                <Button variant="contained" onClick={() => createFileInputRef.current?.click()}>Subir imagen</Button>
            </Stack>

            <Grid container spacing={2}>
                {imagenes.map((imagen) => (
                    <Grid key={imagen.id} size={{ xs: 12, md: 4 }}>
                        <Card variant="outlined">
                            <Box component="img" src={`${import.meta.env.VITE_API_URL}/${imagen.url}`} alt={imagen.descripcion || 'Imagen'} sx={{ width: '100%', height: 220, objectFit: 'cover' }} />
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="body2">{imagen.descripcion || 'Sin descripción'}</Typography>
                                    {imagen.es_principal ? <Chip label="Principal" color="primary" size="small" /> : null}
                                </Stack>
                            </CardContent>
                            <CardActions sx={{ flexWrap: 'wrap', gap: 1 }}>
                                <Button size="small" startIcon={<PhotoCamera />} onClick={() => { setUploadingToId(imagen.id); updateFileInputRef.current?.click(); }}>Actualizar imagen</Button>
                                <Button size="small" startIcon={<Edit />} onClick={() => handleEditDescription(imagen)}>Editar descripción</Button>
                                <Button size="small" startIcon={<Star />} onClick={() => setSelected({ id: imagen.id, action: 'principal' })}>Establecer principal</Button>
                                <Button size="small" color="error" startIcon={<Delete />} disabled={imagen.es_principal} onClick={() => setSelected({ id: imagen.id, action: 'eliminar' })}>Eliminar</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {!loading && imagenes.length === 0 ? <Typography color="text.secondary">Este producto aún no tiene imágenes.</Typography> : null}

            <ConfirmDialog
                open={!!selected}
                title={selected?.action === 'principal' ? '¿Cambiar imagen principal?' : '¿Eliminar imagen?'}
                description={selected?.action === 'principal'
                    ? 'La imagen seleccionada será la nueva imagen principal y la actual dejará de serlo. Esto no cambia automáticamente las variantes.'
                    : 'La imagen se eliminará definitivamente. Las variantes que la usen quedarán sin imagen asociada. Esta acción no se puede deshacer.'}
                onClose={() => setSelected(null)}
                onConfirm={handleConfirmAction}
                isLoading={false}
            />

            <input ref={createFileInputRef} type="file" accept="image/*" hidden onChange={handleCreate} />
            <input ref={updateFileInputRef} type="file" accept="image/*" hidden onChange={handleUpdateFile} />
        </Box>
    );
};

export default ProductoImagenesTab;
