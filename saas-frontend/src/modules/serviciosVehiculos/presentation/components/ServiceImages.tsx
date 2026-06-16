import React, { useEffect, useState, type ChangeEvent } from 'react';
import { Box, Button, Card, CardMedia, Typography, CardActionArea } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { bajarCalidadImagen } from '../../../../core/utils/bajarCalidadImagen';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import CreateImageModal from './modals/CreateImageModal';
import ImagePreviewModal from './modals/ImagePreviewModal';
import { ESTADO_SERVICIO_VEHICULO } from '../../domain/servicio.constants';

type Props = {
  servicio: ServicioVehiculo;
  onUpdate: (s: ServicioVehiculo) => void;
  isMobile?: boolean;
};

const ServiceImages: React.FC<Props> = ({ servicio, onUpdate, isMobile }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadDescription, setUploadDescription] = useState(`${ESTADO_SERVICIO_VEHICULO.RECEPCION}: `);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canModify = servicio.estado === ESTADO_SERVICIO_VEHICULO.RECEPCION;

  useEffect(() => {
    const count = servicio.imagenes?.length ?? 0;
    setSelectedIndex((prev) => Math.min(prev, Math.max(0, count - 1)));
  }, [servicio.imagenes]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setUploadDescription(`${ESTADO_SERVICIO_VEHICULO.RECEPCION}: `);
    setOpenUpload(true);
    e.currentTarget.value = '';
  };

  const closeUpload = () => {
    setOpenUpload(false);
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setUploadDescription(`${ESTADO_SERVICIO_VEHICULO.RECEPCION}: `);
  };

  const handleUploadConfirm = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const preparado = await bajarCalidadImagen(pendingFile);
      const updated = await servicioRepository.subirImagen(
        servicio.id,
        preparado,
        uploadDescription.trim() || `${ESTADO_SERVICIO_VEHICULO.RECEPCION}: `
      );
      onUpdate(updated);
      toast.success('Imagen subida correctamente');
      closeUpload();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenPreview = (imagen: { url: string; descripcion?: string | null }) => {
    setPreviewUrl(`${import.meta.env.VITE_API_URL}/${imagen.url}`);
    setOpenPreview(true);
  };

  const handleDelete = async (imageId: string) => {
    try {
      await servicioRepository.eliminarImagen(servicio.id, imageId);
      toast.success('Imagen eliminada correctamente');
      // refetch service
      const updated = await servicioRepository.obtener(servicio.id);
      onUpdate(updated);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar la imagen');
    }
  };

  return (
    <Box>
      <Button variant="contained" component="label" disabled={!canModify || uploading}>
        {uploading ? 'Subiendo...' : 'Subir imagen'}
        <input hidden accept="image/*" type="file" onChange={handleFileSelect} capture={isMobile ? 'environment' : undefined} />
      </Button>

      {servicio.imagenes?.length ? (
        <>
          <Card sx={{ mt: 2, cursor: 'pointer' }} onClick={() => servicio.imagenes && servicio.imagenes[selectedIndex] && handleOpenPreview(servicio.imagenes[selectedIndex])}>
            <CardMedia
              component="img"
              height="280"
              image={`${import.meta.env.VITE_API_URL}/${servicio.imagenes[selectedIndex]?.url}`}
              alt={servicio.imagenes[selectedIndex]?.descripcion ?? 'Servicio'}
            />
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" fontWeight={600} noWrap>
                {servicio.imagenes[selectedIndex]?.descripcion ?? 'Sin descripción'}
              </Typography>
            </Box>
          </Card>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            {servicio.imagenes.map((imagen, index) => (
              <Card key={imagen.id} onClick={() => setSelectedIndex(index)} sx={{ minWidth: 100, maxWidth: 120, flex: '0 0 auto', cursor: 'pointer' }}>
                <CardActionArea>
                  <CardMedia component="img" height="84" image={`${import.meta.env.VITE_API_URL}/${imagen.url}`} alt={imagen.descripcion ?? 'Miniatura'} />
                </CardActionArea>
              </Card>
            ))}
          </Box>
          <Button sx={{ mt: 1 }} color="error" onClick={() => servicio.imagenes && servicio.imagenes[selectedIndex] && handleDelete(servicio.imagenes[selectedIndex].id)} disabled={!canModify}>
            Eliminar imagen seleccionada
          </Button>
        </>
      ) : (
        <Typography color="text.secondary" sx={{ mt: 2 }}>No hay imágenes cargadas.</Typography>
      )}

      <CreateImageModal
        open={openUpload}
        preview={pendingPreview}
        description={uploadDescription}
        setDescription={setUploadDescription}
        onCancel={closeUpload}
        onConfirm={handleUploadConfirm}
        uploading={uploading}
      />

      <ImagePreviewModal open={openPreview} imageUrl={previewUrl} onClose={() => setOpenPreview(false)} />
    </Box>
  );
};

export default ServiceImages;
