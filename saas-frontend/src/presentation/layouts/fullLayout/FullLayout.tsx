import { useState } from "react";
import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./siderbar/Sidebar";
import Navbar from "./navbar/Navbar";
import { Outlet } from "react-router-dom";
import MenuItems from "./siderbar/menuItems";
import { useAuthStore } from "../../../core/store/authStore";

const DRAWER_WIDTH = 220;

const FullLayout = () => {
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [open, setOpen] = useState(!isMobile);

    const user = useAuthStore((state) => state.user);

    const toggleSidebar = () => setOpen(!open);

    const menuItems = MenuItems.map((item: any) => {
        if (item.permiso && !user?.permisos.includes(item.permiso)) {
            return null;
        }
        if (item.children) {
            const filteredChildren = item.children.filter((child: any) => !child.permiso || user?.permisos.includes(child.permiso));
            if (filteredChildren.length === 0) {
                return null;
            }
            return { ...item, children: filteredChildren };
        }
        return item;
    });
    
    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            bgcolor: 'background.default',
            width: '100%',
            backgroundImage: `url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27250%27%20height%3D%27250%27%20viewBox%3D%270%200%20250%20250%27%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20transform%3D%22rotate(-15%20125%20125)%22%20opacity%3D%220.1%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20transform%3D%22translate(32.5%2C%2052.5)%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2230%22%20y%3D%2210%22%20font-family%3D%22%27Space%20Mono%27%2C%20monospace%22%20font-size%3D%2215%22%20font-weight%3D%22bold%22%20fill%3D%22%234f46e5%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EASYNCRONIX%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20transform%3D%22translate(174.75%2C%2049.75)%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20transform%3D%22scale(0.85)%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Crect%20x%3D%222%22%20y%3D%221%22%20width%3D%2220%22%20height%3D%2234%22%20rx%3D%223%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Crect%20x%3D%224%22%20y%3D%223%22%20width%3D%2216%22%20height%3D%2210%22%20rx%3D%221.5%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cline%20x1%3D%226%22%20y1%3D%226%22%20x2%3D%2218%22%20y2%3D%226%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cline%20x1%3D%226%22%20y1%3D%229%22%20x2%3D%2213%22%20y2%3D%229%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%226%22%20cy%3D%2218%22%20r%3D%221%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2218%22%20r%3D%221%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%2218%22%20cy%3D%2218%22%20r%3D%221%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%226%22%20cy%3D%2223%22%20r%3D%221%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2223%22%20r%3D%221%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%2218%22%20cy%3D%2223%22%20r%3D%221%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%226%22%20cy%3D%2228%22%20r%3D%221%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2228%22%20r%3D%221%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Crect%20x%3D%2216%22%20y%3D%2227%22%20width%3D%224%22%20height%3D%223%22%20rx%3D%220.5%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20transform%3D%22translate(48.25%2C%20173.25)%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20transform%3D%22scale(0.890625)%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%226%22%20cy%3D%2224%22%20r%3D%225%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%2226%22%20cy%3D%2224%22%20r%3D%225%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M6%2C24%20L12%2C14%20L24%2C14%20L26%2C24%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M12%2C14%20L11%2C5%20L7%2C5%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Crect%20x%3D%2217%22%20y%3D%225%22%20width%3D%2210%22%20height%3D%229%22%20rx%3D%221.5%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cline%20x1%3D%2212%22%20y1%3D%2220%22%20x2%3D%2220%22%20y2%3D%2220%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20transform%3D%22translate(173.25%2C%20173.25)%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cg%20transform%3D%22scale(0.890625)%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%2213%22%20cy%3D%228%22%20r%3D%225%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M3%2C28%20C3%2C20%208%2C16%2013%2C16%20C16%2C16%2020%2C18%2022%2C22%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Crect%20x%3D%2219%22%20y%3D%2214%22%20width%3D%2211%22%20height%3D%2215%22%20rx%3D%221%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Crect%20x%3D%2223%22%20y%3D%2212%22%20width%3D%223%22%20height%3D%222%22%20rx%3D%220.5%22%20fill%3D%22%234f46e5%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M22%2C20%20L24%2C22%20L28%2C18%22%20fill%3D%22none%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cline%20x1%3D%2222%22%20y1%3D%2225%22%20x2%3D%2227%22%20y2%3D%2225%22%20stroke%3D%22%234f46e5%22%20stroke-width%3D%221%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fg%3E%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fsvg%3E")`,
            backgroundRepeat: 'repeat',
            }}>


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