import { Breadcrumbs, Button, Stack, Typography, Link as MuiLink } from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';

interface LoteDetailHeaderProps {
    title: string;
    subtitle?: string;
    onBack: () => void;
    onCreate?: () => void;
}

const LoteDetailHeader = ({ title, subtitle, onBack, onCreate }: LoteDetailHeaderProps) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
        <Stack spacing={1}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                <MuiLink
                    underline="hover"
                    color="inherit"
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                    onClick={onBack}
                >
                    <ArrowBack sx={{ fontSize: 16 }} /> Lotes
                </MuiLink>
                <Typography color="text.primary">Detalle del lote</Typography>
            </Breadcrumbs>
            <Typography variant="h4" fontWeight={800} color="text.primary">
                {title}
            </Typography>
            {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
        </Stack>

        <Stack direction="row" spacing={1} width={{ xs: '100%', sm: 'auto' }}>
            {onCreate && (
                <Button variant="contained" startIcon={<Add />} sx={{ width: { xs: '100%', sm: 'auto' } }} onClick={onCreate}>
                    Agregar lote
                </Button>
            )}
        </Stack>
    </Stack>
);

export default LoteDetailHeader;
