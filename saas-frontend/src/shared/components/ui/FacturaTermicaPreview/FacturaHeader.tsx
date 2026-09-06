import { Box, Typography } from '@mui/material';
import type { FacturaTermicaData } from '../../../interfaces/factura-termica.interface';
import { format } from 'date-fns';

interface Props {
    data: FacturaTermicaData;
}

export const FacturaHeader = ({ data }: Props) => {
    return (
        <Box textAlign="center" mb={1}>
            <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', fontSize: '15px' }}>
                DOCUMENTO TRIBUTARIO ELECTRONICO
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ textTransform: 'uppercase', mt: 1, fontFamily: 'monospace', fontSize: '19px' }}>
                {data.negocio_nombre}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                {data.sucursal_direccion}
            </Typography>

            <Box textAlign="left" mt={1}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    NIT: {data.negocio_nit}
                </Typography>
                {data.negocio_telefono && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                        TEL: {data.negocio_telefono}
                    </Typography>
                )}
            </Box>

            <Box mt={2} mb={1}>
                <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', fontSize: '15px' }}>
                    FACTURA ELECTRÓNICA
                </Typography>
            </Box>

            <Box textAlign="left" mt={1}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    DTE NUMERO DE AUTORIZACION:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    {data.uuid || '---'}
                </Typography>
            </Box>

            <Box textAlign="left" mt={1} mb={2}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    DTE SERIE: {data.serie || '---'}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    DTE NUMERO: {data.numero || '---'}
                </Typography>
            </Box>

            <Box textAlign="left" mt={1}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    FECHA Y HORA:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    {data.fecha_emision ? format(new Date(data.fecha_emision), 'dd/MM/yyyy HH:mm') : '---'}
                </Typography>
            </Box>

            <Box textAlign="left" mt={1}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    ATENDIDO:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    {data.atendido_por}
                </Typography>
            </Box>

            <Box textAlign="left" mt={2} mb={2}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    NOMBRE:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    {data.cliente_nombre}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    NIT: {data.cliente_nit}
                </Typography>
            </Box>
        </Box>
    );
};
