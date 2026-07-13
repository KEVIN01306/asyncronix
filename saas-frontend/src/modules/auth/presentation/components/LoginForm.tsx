import { Box, TextField } from "@mui/material"
import { SubmitButton } from "../../../../shared/components/button/SubmitButton";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { LoginFormValues } from "../../domain/schemas/login.schema";


interface LoginFormProps {
    register: UseFormRegister<LoginFormValues>;
    errors: FieldErrors<LoginFormValues>;
    onSubmit: () => void;
    isSubmitting: boolean;
}

const LoginForm = ({ register, errors, onSubmit, isSubmitting }: LoginFormProps) => {

    return (
        <Box component="form" onSubmit={onSubmit} noValidate>
            <TextField
                fullWidth
                variant="standard"
                placeholder="correo@ejemplo.com"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 3 }}
                InputProps={{
                    disableUnderline: false,
                    sx: {
                        py: 1,
                        fontSize: '0.95rem',
                        '&::before': { borderBottomColor: 'divider' },
                        '&:hover:not(.Mui-disabled):before': {
                            borderBottomColor: 'text.primary',
                        },
                    }
                }}
            />
            <TextField
                fullWidth
                variant="standard"
                type="password"
                placeholder="Contraseña"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 4 }}
                InputProps={{
                    disableUnderline: false,
                    sx: {
                        py: 1,
                        fontSize: '0.95rem',
                        '&::before': { borderBottomColor: 'divider' },
                        '&:hover:not(.Mui-disabled):before': {
                            borderBottomColor: 'text.primary',
                        },
                    }
                }}
            />

            <SubmitButton
                isSubmitting={isSubmitting}
                text={"Iniciar Sesión"}
                loadingText="Iniciando..."
                sx={{
                    py: 1.2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                    color: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                    borderRadius: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    '&:hover': {
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                    },
                    mb: 2,
                    boxShadow: 'none'
                }}
                icon={null}
            />

        </Box>
    )
}

export default LoginForm;