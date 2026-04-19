import { Lock, Login, PhoneAndroid, Visibility, VisibilityOff } from "@mui/icons-material"
import { Box, IconButton, InputAdornment, TextField } from "@mui/material"
import { useState } from "react";
import { SubmitButton } from "../../../../shared/components/button/SubmitButton";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { LoginFormValues } from "../../domain/schemas/login.schema";

interface LoginFormProps {
    register: UseFormRegister<LoginFormValues>;
    errors: FieldErrors<LoginFormValues>;
    onSubmit: () => void;
    isSubmitting: boolean;
}

const LoginForm = ({register,errors,onSubmit,isSubmitting}: LoginFormProps) => {

    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <>
            <Box component="form" onSubmit={onSubmit} noValidate>
                <TextField
                    fullWidth
                    label="Teléfono"
                    placeholder="1234 5678"
                    {...register('telefono')}
                    error={!!errors.telefono}
                    helperText={errors.telefono?.message}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <PhoneAndroid color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 3 }}
                />
                <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 4 }}
                />
                <SubmitButton 
                    isSubmitting={isSubmitting}
                    text={"Iniciar Sesión"}
                    loadingText="Verificando..."
                    icon={<Login/>}
                />
            </Box>
        </>
    )
}


export default LoginForm;