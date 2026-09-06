import { Box, Typography, Divider } from '@mui/material';
import type { FacturaTermicaData } from '../../../interfaces/factura-termica.interface';

interface Props {
    data: FacturaTermicaData;
}

export const FacturaItems = ({ data }: Props) => {
    return (
        <Box my={1} sx={{ width: '100%', boxSizing: 'border-box' }}>
            <Divider sx={{ borderStyle: 'dashed', mb: 0.5, borderColor: '#000' }} />
            <Divider sx={{ borderStyle: 'dashed', mb: 1, borderColor: '#000' }} />

            {/* Cabecera estructurada al 100% */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 40px 58px 65px',
                    gap: 0.5,
                    mb: 0.5,
                    '& span': {
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        lineHeight: 1.1,
                    }
                }}
            >
                <Typography component="span" sx={{ textAlign: 'left' }}>PRODUCTO</Typography>
                <Typography component="span" sx={{ textAlign: 'right' }}>CANT</Typography>
                <Typography component="span" sx={{ textAlign: 'right' }}>P.UNIT</Typography>
                <Typography component="span" sx={{ textAlign: 'right' }}>TOTAL</Typography>
            </Box>

            {/* Filas de items */}
            {data.items.map((item, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                    {/* Nombre del producto en línea completa para que no apriete los números */}
                    <Typography
                        sx={{
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            lineHeight: 1.15,
                            wordBreak: 'break-word',
                            fontWeight: 500,
                        }}
                    >
                        {item.descripcion}
                    </Typography>

                    {/* Fila con desglose numérico alineado a la cabecera */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 40px 58px 65px',
                            gap: 0.5,
                            '& span': {
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                lineHeight: 1.1,
                                textAlign: 'right',
                            }
                        }}
                    >
                        <Typography component="span" /> {/* Celda vacía que empuja los números al grid */}
                        <Typography component="span">{item.cantidad.toFixed(2)}</Typography>
                        <Typography component="span">{item.precio_unitario.toFixed(2)}</Typography>
                        <Typography component="span">{item.total.toFixed(2)}</Typography>
                    </Box>
                </Box>
            ))}

            <Divider sx={{ borderStyle: 'dashed', mt: 0.5, mb: 1, borderColor: '#000' }} />
        </Box>
    );
};