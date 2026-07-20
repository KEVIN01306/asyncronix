import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    Typography,
    Stack,
    Pagination,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    Link,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Delete, InsertDriveFile, OpenInNew } from '@mui/icons-material';
import { mediaRepository, type MediaItem } from '../../infrastructure/repositories/media.repository';
import { formatImage } from '../../../../core/utils/formatImage';

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MediaGallery: React.FC = () => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const perPage = 20;

    const fetchMedia = async (pageNumber: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await mediaRepository.listar(pageNumber, perPage);
            setMediaItems(data?.data || []);
            setTotal(data?.total || 0);
        } catch (err: any) {
            setError('Error al cargar la galería de imágenes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia(page);
    }, [page]);

    const handlePageChange = (value: number) => {
        setPage(value);
    };

    const handleDelete = async () => {
        alert('Para eliminar se requiere implementar el endpoint de borrado de medias en el backend.');
    };

    if (loading && mediaItems.length === 0) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!mediaItems || mediaItems.length === 0) {
        return <Alert severity="info">No hay archivos multimedia registrados.</Alert>;
    }

    return (
        <Box sx={{ mt: 2, position: 'relative' }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(4, 1fr)',
                        md: 'repeat(6, 1fr)',
                        lg: 'repeat(6, 1fr)'
                    },
                    gap: 2
                }}
            >
                {mediaItems.map((item) => (
                    <Card
                        key={item.id}
                        sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                            }
                        }}
                    >
                        {/* Image Preview - Square */}
                        <Box sx={{
                            width: '100%',
                            aspectRatio: '1 / 1',
                            bgcolor: 'grey.100',
                            position: 'relative',
                            backgroundImage: `url(${formatImage(item.path)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            {!item.path && <InsertDriveFile sx={{ fontSize: 40, color: 'grey.400', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}

                            <Box sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: '0.65rem',
                                fontWeight: 600
                            }}>
                                {formatBytes(item.size_bytes)}
                            </Box>
                        </Box>

                        <Box sx={{ p: 1 }}>
                            <Tooltip title={item.path}>
                                <Typography variant="caption" sx={{
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: 600,
                                    mb: 0.5
                                }}>
                                    <Link href={formatImage(item.path)} target="_blank" rel="noopener noreferrer" underline="hover" color="inherit">
                                        {item.path.split('/').pop()} <OpenInNew sx={{ fontSize: 10, ml: 0.5 }} />
                                    </Link>
                                </Typography>
                            </Tooltip>

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                    {item.mime_type}
                                </Typography>
                                <IconButton size="small" color="error" onClick={() => handleDelete()} sx={{ p: 0.5 }}>
                                    <Delete sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Stack>
                        </Box>
                    </Card>
                ))}
            </Box>

            {total > perPage && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                        count={Math.ceil(total / perPage)}
                        page={page}
                        onChange={(_, val) => handlePageChange(val)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default MediaGallery;
