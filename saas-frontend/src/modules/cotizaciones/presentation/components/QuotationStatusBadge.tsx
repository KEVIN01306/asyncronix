import { Chip } from '@mui/material';
import { EstadoCotizacion } from '../../domain/interfaces/cotizacion.interface';

interface Props {
    estado: EstadoCotizacion;
    size?: 'small' | 'medium';
}

const QuotationStatusBadge = ({ estado, size = 'small' }: Props) => {
    let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
    let label = estado;

    switch (estado) {
        case EstadoCotizacion.PENDIENTE:
            color = 'warning';
            label = 'Pendiente';
            break;
        case EstadoCotizacion.ACEPTADA:
            color = 'success';
            label = 'Aceptada';
            break;
        case EstadoCotizacion.RECHAZADA:
            color = 'error';
            label = 'Rechazada';
            break;
        case EstadoCotizacion.VENCIDA:
            color = 'default';
            label = 'Vencida';
            break;
    }

    return <Chip label={label} color={color} size={size} variant="outlined" />;
};

export default QuotationStatusBadge;
