import { Box, Typography } from "@mui/material"



const Header = () => {

    return (
        <>
            <Box display="flex" justifyContent="center" mb={2}>
                <Box
                    component="img"
                    src="/icons/asyncronix_corto.png"
                    alt="Logo Foxint"
                    sx={{
                        height: 100,
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
                    }}
                />
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                Inicia sesion para administrar tu negocio
            </Typography>
        </>
    )
}

export default Header;