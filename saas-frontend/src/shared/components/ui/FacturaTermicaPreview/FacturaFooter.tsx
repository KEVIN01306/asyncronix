import { Box, Typography } from '@mui/material';
import type { FacturaTermicaData } from '../../../interfaces/factura-termica.interface';

interface Props {
    data: FacturaTermicaData;
}

export const FacturaFooter = ({ data }: Props) => {
    return (
        <Box mt={2}>
            {data.frases && data.frases.length > 0 && (
                <Box textAlign="center" mb={2}>
                    {data.frases.map((frase, index) => (
                        <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.2 }}>
                            {frase}
                        </Typography>
                    ))}
                </Box>
            )}

            {data.certificador_nombre && (
                <Box textAlign="left" mb={3}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px' }}>CERTIFICADOR:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px' }}>{data.certificador_nombre}</Typography>
                    {data.certificador_nit && (
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px' }}>NIT: {data.certificador_nit}</Typography>
                    )}
                </Box>
            )}

            {data.slogan && (
                <Box textAlign="center" mt={3} mb={1}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '16px', fontStyle: 'italic', fontWeight: 'bold' }}>
                        {data.slogan}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
