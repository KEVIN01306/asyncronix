import { useRef, useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { DeleteSweep, Gesture } from '@mui/icons-material';

interface SignaturePadProps {
    onSave?: (base64Image: string | null) => void;
    height?: number;
    label?: string;
}

const SignaturePad = ({ 
    onSave, 
    height = 300, 
    label = "Firma Autorizada" 
}: SignaturePadProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = height;

        ctx.strokeStyle = '#0f172a'; 
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [height]);

    // Obtener las coordenadas correctas del mouse o touch
    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        
        if ('touches' in e) {
            if (e.touches.length === 0) return { x: 0, y: 0 };
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        // Previene el scroll de la página en dispositivos móviles al firmar
        if ('touches' in e) e.preventDefault(); 
        
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        if ('touches' in e) e.preventDefault();

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        triggerSave();
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        if (onSave) onSave(null);
    };

    const triggerSave = () => {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty) return;
        
        if (onSave) {
            // Retorna la firma en formato Base64 de imagen
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                width: '100%'
            }}
        >
            <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={1.5}
            >
                <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: 1, fontWeight: 700 }}
                >
                    <Gesture sx={{ fontSize: 16 }} /> {label.toUpperCase()}
                </Typography>
                
                <Button
                    variant="text"
                    color="error"
                    size="small"
                    startIcon={<DeleteSweep />}
                    disabled={isEmpty}
                    onClick={handleClear}
                    sx={{ 
                        px: 1.5, 
                        py: 0.5,
                        '&:hover': {
                            backgroundColor: 'error.lighter' // O fallback nativo según tus utilitarios
                        }
                    }}
                >
                    Limpiar
                </Button>
            </Stack>

            <Box 
                sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: height,
                    backgroundColor: '#f8faff', // background.default de tu theme
                    borderRadius: 1,
                    border: '1px dashed',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    cursor: 'crosshair',
                    touchAction: 'none' // Evita comportamientos extraños de scroll en móvil
                }}
            >
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                />

                {isEmpty && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none', // Permite que el click pase al canvas de fondo
                            opacity: 0.4
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Coloque su firma aquí
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default SignaturePad;