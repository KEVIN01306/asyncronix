import { Breadcrumbs, Button, Stack, Typography, Link as MuiLink } from '@mui/material';
import { ArrowBack, Delete, Edit } from '@mui/icons-material';

interface ProductoDetailHeaderProps {
    nombre: string;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const ProductoDetailHeader = ({ nombre, onBack, onEdit, onDelete }: ProductoDetailHeaderProps) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
        <Stack spacing={1}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                <MuiLink
                    underline="hover"
                    color="inherit"
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                    onClick={onBack}
                >
                    <ArrowBack sx={{ fontSize: 16 }} /> Productos
                </MuiLink>
                <Typography color="text.primary">Detalle del producto</Typography>
            </Breadcrumbs>
            <Typography variant="h4" fontWeight={800} color="text.primary">
                {nombre}
            </Typography>
        </Stack>

        <Stack direction="row" spacing={1} width={{ xs: '100%', sm: 'auto' }}>
            <Button variant="outlined" sx={{ width: { xs: '100%', sm: 'auto' } }} startIcon={<Edit />} onClick={onEdit}>
                Editar
            </Button>
            <Button variant="contained" color="error" sx={{ width: { xs: '100%', sm: 'auto' } }} startIcon={<Delete />} onClick={onDelete}>
                Eliminar
            </Button>
        </Stack>
    </Stack>
);

export default ProductoDetailHeader;
