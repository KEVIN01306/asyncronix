import { useEffect, useState } from "react";
import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./siderbar/Sidebar";
import Navbar from "./navbar/Navbar";
import { Outlet } from "react-router-dom";
import MenuItems from "./siderbar/menuItems";
import { useAuthStore } from "../../../core/store/authStore";
import { authRepository } from "../../../modules/auth/infrastructure/repositories/auth.repository";
import { toast } from "sonner";

const DRAWER_WIDTH = 220;

const FullLayout = () => {
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [open, setOpen] = useState(!isMobile);

    const user = useAuthStore((state) => state.user);
    const getMeStore = useAuthStore((state) => state.getMe)

    const toggleSidebar = () => setOpen(!open);

    const menuItems = MenuItems.map( item => {
        if (item.permiso && !user?.permisos.includes(item.permiso)) {
            return null;
        }
        if (item.children) {
            const filteredChildren = item.children.filter(child => !child.permiso || user?.permisos.includes(child.permiso));
            if (filteredChildren.length === 0) {
                return null;
            }
            return { ...item, children: filteredChildren };
        }
        return item;
    });

    const obtenerMe = async () => {
        const token = localStorage.getItem('accessToken')

        if (!token) return;
        try {
        const usuario = await authRepository.getMe();
        getMeStore(usuario);
        } catch  {
            toast.error("Error al recuperar la sesión:");
        }
    }

    useEffect( () => {
        obtenerMe()
    },[])
    
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            
            <Sidebar 
                open={open} 
                onClose={toggleSidebar}
                isMobile={isMobile}
                drawerWidth={DRAWER_WIDTH} 
                menuItems={menuItems} 
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