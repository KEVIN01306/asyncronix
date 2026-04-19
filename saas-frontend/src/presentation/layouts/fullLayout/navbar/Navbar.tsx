import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  //InputBase, 
  //Badge, 
  Avatar, 
  Stack, 
  alpha 
} from "@mui/material";
import { 
  //Search as SearchIcon, 
  //NotificationsNoneOutlined as NotificationsIcon,
  //ChatBubbleOutlineOutlined as ChatIcon,
  MenuOutlined as MenuIcon, 
  Login
} from "@mui/icons-material";
import { useAuthStore } from "../../../../core/store/authStore";

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  drawerWidth: number;
  isMobile: boolean;
}

const Navbar = ({ onToggleSidebar, isSidebarOpen, drawerWidth, isMobile }: NavbarProps) => {
  const lagaout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        width: (!isMobile && isSidebarOpen) ? `calc(100% - ${drawerWidth}px)` : '100%',
        ml: (!isMobile && isSidebarOpen) ? `${drawerWidth}px` : 0,
        transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        bgcolor: "background.paper",
        backdropFilter: 'blur(12px)',
        color: 'primary.main',
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.divider}`,      }}
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
          <IconButton sx={{ color: 'secondary.main' }} onClick={lagaout}>
              <Login fontSize="small" />
          </IconButton>
          {/*
          <IconButton sx={{ color: 'secondary.main' }}>
            <Badge badgeContent={4} color="error" variant="dot">
              <ChatIcon fontSize="small" />
            </Badge>
          </IconButton>

          <IconButton sx={{ color: 'secondary.main' }}>
            <Badge badgeContent={2} color="primary">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
           */}

          <Box sx={{ width: '1px', height: '24px', bgcolor: alpha('#6889b8', 0.2), mx: 1 }} />

          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ cursor: 'pointer' }}>
            <Avatar 
              src="/static/images/avatar/1.jpg"
              sx={{
                width: 38, 
                height: 38, 
                borderColor: 'primary.main',
                background: "#876543cc",
              }}
            >
              {user?.nombre[0]}
            </Avatar>
          </Stack>
        </Stack>
        
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;