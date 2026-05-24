import { useRef } from 'react';
import { Box, Button, Typography, Avatar } from '@mui/material';
import { PhotoCamera, PictureAsPdf } from '@mui/icons-material';

interface FileUploadPickerProps {
    label: string;
    helperText?: string;
    accept: string;
    capture?: 'user' | 'environment';
    previewUrl?: string;
    fileName?: string;
    uploading?: boolean;
    disabled?: boolean;
    onFileSelected: (file: File | null) => void;
}

const FileUploadPicker = ({
    label,
    helperText,
    accept,
    capture,
    previewUrl,
    fileName,
    uploading = false,
    disabled = false,
    onFileSelected
}: FileUploadPickerProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleOpenFileDialog = () => {
        if (!disabled) inputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        onFileSelected(file);
        if (event.target) {
            event.target.value = '';
        }
    };

    const isImage = accept.includes('image/');

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle2">{label}</Typography>
            <Box
                onClick={handleOpenFileDialog}
                sx={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    border: theme => `1px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 180,
                    bgcolor: disabled ? 'action.disabledBackground' : 'background.paper'
                }}
            >
                {previewUrl && isImage ? (
                    <Avatar
                        variant="rounded"
                        src={previewUrl}
                        alt={label}
                        sx={{ width: 120, height: 120, mb: 2 }}
                    />
                ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                        {accept === 'application/pdf' ? (
                            <PictureAsPdf sx={{ fontSize: 48, color: 'text.disabled' }} />
                        ) : (
                            <PhotoCamera sx={{ fontSize: 48, color: 'text.disabled' }} />
                        )}
                        <Typography variant="body2" color="text.secondary">
                            {helperText ?? 'Selecciona o usa la cámara para capturar el archivo.'}
                        </Typography>
                        {fileName && <Typography variant="caption" color="text.secondary">{fileName}</Typography>}
                    </Box>
                )}
            </Box>
            <Button variant="contained" onClick={handleOpenFileDialog} disabled={disabled || uploading}>
                {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
            </Button>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                capture={capture}
                hidden
                onChange={handleFileChange}
            />
        </Box>
    );
};

export default FileUploadPicker;
