import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    Typography,
    Stack,
    TablePagination,
    Tooltip,
    Alert,
    CircularProgress,
    Link,
    Dialog,
    DialogContent,
    IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { InsertDriveFile, OpenInNew, Close, ZoomIn, ZoomOut } from '@mui/icons-material';
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
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleOpenImage = (item: MediaItem) => {
        setSelectedImage(item);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleCloseImage = () => {
        setSelectedImage(null);
        setTimeout(() => {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }, 200);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => {
        setZoom(prev => {
            const newZoom = Math.max(prev - 0.5, 1);
            if (newZoom === 1) setPosition({ x: 0, y: 0 });
            return newZoom;
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || zoom <= 1) return;
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => {
        if (isDragging) setIsDragging(false);
    };

    const fetchMedia = async (pageNumber: number, itemsPerPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await mediaRepository.listar(pageNumber, itemsPerPage);
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
        fetchMedia(page, perPage);
    }, [page, perPage]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage + 1);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPerPage(parseInt(event.target.value, 10));
        setPage(1);
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
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2} px={1}>
                <TablePagination
                    component="div"
                    count={total}
                    page={page - 1}
                    onPageChange={handleChangePage}
                    rowsPerPage={perPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Archivos por página"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Box>

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
                        <Box
                            onClick={() => handleOpenImage(item)}
                            sx={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                bgcolor: 'grey.100',
                                position: 'relative',
                                backgroundImage: `url(${formatImage(item.path)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                cursor: 'pointer'
                            }}
                        >
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
                            </Stack>
                        </Box>
                    </Card>
                ))}
            </Box>

            <Dialog
                open={Boolean(selectedImage)}
                onClose={handleCloseImage}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { bgcolor: 'transparent', boxShadow: 'none' }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, position: 'absolute', right: 0, zIndex: 10 }}>
                    <IconButton onClick={handleZoomOut} sx={{ bgcolor: 'rgba(255,255,255,0.7)', mr: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                        <ZoomOut />
                    </IconButton>
                    <IconButton onClick={handleZoomIn} sx={{ bgcolor: 'rgba(255,255,255,0.7)', mr: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                        <ZoomIn />
                    </IconButton>
                    <IconButton onClick={handleCloseImage} sx={{ bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                        <Close />
                    </IconButton>
                </Box>
                <DialogContent
                    sx={{ p: 0, overflow: 'hidden', textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {selectedImage && (
                        <Box
                            component="img"
                            src={formatImage(selectedImage.path)}
                            alt={selectedImage.path}
                            draggable="false" // prevent native HTML drag
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '85vh',
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                transition: isDragging ? 'none' : 'transform 0.2s ease-in-out',
                                transformOrigin: 'center center',
                                objectFit: 'contain',
                                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MediaGallery;
