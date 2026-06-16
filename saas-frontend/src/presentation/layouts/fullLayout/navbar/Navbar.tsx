import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  //InputBase, 
  //Badge, 
  Avatar, 
  Stack, 
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip
} from "@mui/material";
import { 
  //Search as SearchIcon, 
  //NotificationsNoneOutlined as NotificationsIcon,
  //ChatBubbleOutlineOutlined as ChatIcon,
  MenuOutlined as MenuIcon, 
  PersonOutline,
  Logout,
  CopyAll,
  Tune,
} from "@mui/icons-material";
import { useAuthStore } from "../../../../core/store/authStore";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  drawerWidth: number;
  isMobile: boolean;
}

const Navbar = ({ onToggleSidebar, isSidebarOpen, drawerWidth, isMobile }: NavbarProps) => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/auth/login', { replace: true });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/perfil');
  };

  const handleCustomClick = () => {
    handleMenuClose();
    navigate('/custom');
  };

  const location = useLocation();

  const handleDuplicate = () => {
    const fullUrl = `${window.location.origin}${location.pathname}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        width: (!isMobile && isSidebarOpen) ? `calc(100% - ${drawerWidth}px)` : '100%',
        ml: (!isMobile && isSidebarOpen) ? `${drawerWidth}px` : 0,
        transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        bgcolor: "background.paper",
        color: 'text.primary',
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
        <IconButton 
            onClick={onToggleSidebar}
            edge="start"
            sx={{ 
              color: 'primary.main',
              mr: 1 
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/*<Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: alpha('#f4f7fa', 1),
              px: 2, 
              py: 0.5, 
              borderRadius: '12px',
              width: { xs: '40px', md: '300px' },
              transition: 'all 0.3s ease',
              border: '1px solid transparent',
              '&:focus-within': {
                bgcolor: '#ffffff',
                borderColor: 'secondary.main',
                boxShadow: `0 0 0 4px ${alpha('#6889b8', 0.1)}`
              }
            }}
          >
            
            <SearchIcon sx={{ color: 'secondary.main', fontSize: '1.2rem' }} />
            <InputBase
              placeholder="Buscar servicios, motos..."
              sx={{ 
                ml: 1, 
                flex: 1, 
                fontSize: '0.875rem', 
                fontWeight: 500,
                display: { xs: 'none', md: 'block' } 
              }}
            />
            
          </Box>
          */}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Tooltip followCursor describeChild title="Duplicar página" placement="top-end">
              <ListItemIcon sx={{ borderRadius: 1, padding: 2 }} onClick={handleDuplicate}>
                    <CopyAll fontSize="small" />
              </ListItemIcon>
            </Tooltip>
          <Box sx={{ width: '1px', height: '24px', bgcolor: alpha('#6889b8', 0.2), mx: 1 }} />

          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ cursor: 'pointer' }} onClick={handleMenuOpen}>
            <Avatar 
              src={user?.avatar_url ? `${import.meta.env.VITE_API_URL}/${user.avatar_url}` : "/static/images/avatar/1.jpg"}
              sx={{
                width: 38, 
                height: 38, 
                border: user?.avatar_url ?  '2px solid' : "",
                borderColor: 'secondary.main',
                background: user?.avatar_url ? "#ffffff" : "#876543cc",
              }}
            >
              {user?.nombre[0]}
            </Avatar>
          </Stack>
        </Stack>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
              mt: 1.5,
              width: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <PersonOutline fontSize="small" />
            </ListItemIcon>
            Perfil
          </MenuItem>
          <MenuItem onClick={handleCustomClick}>
            <ListItemIcon>
              <Tune fontSize="small" />
            </ListItemIcon>
            Personalización
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;