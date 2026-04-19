import { Box, Container } from "@mui/material"
import { Outlet } from "react-router-dom";


const BlankLayout = () => {

    return (
        <>
            <Box sx={{display: 'flex', minHeight: '100vh', bgcolor: 'background.default'}}>
                <Box component='main' sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                        <Outlet />
                    </Container>
                </Box>
            </Box>
        </>
    )
}

export default BlankLayout;