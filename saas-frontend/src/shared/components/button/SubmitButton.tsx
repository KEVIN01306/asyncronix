import { Button, CircularProgress, type ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';

interface Props extends ButtonProps {
    isSubmitting?: boolean;
    loadingText?: string;
    icon?: ReactNode;
    text: string;
}

export const SubmitButton = ({
    isSubmitting = false,
    loadingText = 'Cargando...',
    icon,
    text,
    sx,
    ...props
}: Props) => {
    return (
        <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            size="large"
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : icon}
            sx={{
                py: 1.8,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1.1rem',
                textTransform: 'none',
                bgcolor: 'primary.main',
                //boxShadow: '0 8px 16px rgba(23, 36, 67, 0.3)',
                '&:hover': {
                    bgcolor: 'secondary.main',
                    //boxShadow: '0 12px 20px rgba(23, 36, 67, 0.4)',
                },
                ...sx,
            }}
            {...props}
        >
            {isSubmitting ? loadingText : text}
        </Button>
    );
};