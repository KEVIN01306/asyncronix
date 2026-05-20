import { Box, Button, Stack, Typography } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import type { ChangeEvent, RefObject } from 'react';

interface ProductoImageCardProps {
    nombre: string;
    imageSource?: string;
    uploading: boolean;
    onUploadImage: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const ProductoImageCard = ({
    nombre,
    imageSource,
    uploading,
    onUploadImage,
    fileInputRef,
    onFileChange
}: ProductoImageCardProps) => (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} mb={4} alignItems="flex-start">
        <Box flex={1}>
            {imageSource ? (
                <Box
                    component="img"
                    src={imageSource}
                    alt={nombre}
                    sx={{ width: '100%', maxHeight: 350, objectFit: 'contain', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
                />
            ) : (
                <Box
                    sx={{
                        width: '100%',
                        height: 280,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        border: (theme) => `1px dashed ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <PhotoCamera sx={{ fontSize: 48, color: 'text.disabled' }} />
                </Box>
            )}
        </Box>

        <Stack spacing={2} flex={1}>
            <Button variant="contained" onClick={onUploadImage} disabled={uploading}>
                {uploading ? 'Subiendo...' : 'Cambiar imagen'}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onFileChange} />
            <Typography variant="subtitle2" color="text.secondary">
                Selecciona una imagen JPG o PNG para actualizar la vista del producto.
            </Typography>
        </Stack>
    </Box>
);

export default ProductoImageCard;
