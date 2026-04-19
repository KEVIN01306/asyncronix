import { useState } from "react";
import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./siderbar/Sidebar";
import Navbar from "./navbar/Navbar";
import { Outlet } from "react-router-dom";
import MenuItems from "./siderbar/menuItems";

const DRAWER_WIDTH = 280;

const FullLayout = () => {
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [open, setOpen] = useState(!isMobile);

    const toggleSidebar = () => setOpen(!open);
    
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            
            <Sidebar 
                open={open} 
                onClose={toggleSidebar}
                isMobile={isMobile}
                drawerWidth={DRAWER_WIDTH} 
                menuItems={MenuItems} 
            />

            <Box 
                component='main' 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    minWidth: 0,
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    ml: (!isMobile && open) ? 0 : 0, 
                }}
            >
                <Navbar 
                    onToggleSidebar={toggleSidebar} 
                    isSidebarOpen={open}
                    isMobile={isMobile}
                    drawerWidth={DRAWER_WIDTH}
                />
                <Container 
                    maxWidth="xl" 
                    sx={{ 
                        mt: '70px', 
                        mb: 4, 
                        flexGrow: 1,
                        transition: theme.transitions.create('all', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.standard,
                        }),
                        width: '100%',
                        padding: 2,
                        borderRadius: 1
                    }}
                >
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
}

export default FullLayout;