import { alpha, Box, Typography, Paper,/* Stack,*/ keyframes} from "@mui/material";
import { 
  /*WavingHand as WavingHandIcon,*/
  Inventory2 as Inventory2Icon,
  PointOfSale as PointOfSaleIcon,
  People as PeopleIcon,
  Build as BuildIcon,
} from "@mui/icons-material";
import type { ReactNode } from "react";
import { useAuthStore } from "../../../core/store/authStore";
import { useNavigate } from "react-router-dom";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const cardStyle = {
  p: 3,
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
  transition: "transform 0.2s, box-shadow 0.2s",
  animation: `${fadeIn} 0.5s ease-out both`,
  "&:hover": {
    borderColor: "primary.light",
    boxShadow: (theme: any) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
};

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const canViewProducts = Boolean(user?.permisos.includes('BUSCAR_PRODUCTOS'));
  const canViewSales = Boolean(user?.permisos.includes('CREAR_VENTAS'));
  const canViewUsers = Boolean(user?.permisos.includes('VER_USUARIOS'));
  const canViewServices = Boolean(user?.permisos.includes('VER_SERVICIOS'));

  const quickLinks = [
    canViewProducts && { title: 'Productos', description: 'Búsqueda y scanner', icon: <Inventory2Icon color="primary" />, path: '/productos/scanner' },
    canViewSales && { title: 'Ventas', description: 'Iniciar venta', icon: <PointOfSaleIcon color="primary" />, path: '/ventas/nuevo' },
    canViewUsers && { title: 'Usuarios', description: 'Gestión de personal', icon: <PeopleIcon color="primary" />, path: '/usuarios' },
    canViewServices && { title: 'Servicios', description: 'Servicios activos', icon: <BuildIcon color="primary" />, path: '/servicios-vehiculo?estado=EN_SERVICIO' },
  ].filter(Boolean) as Array<{ title: string; description: string; icon: ReactNode; path: string }>


  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>Hola, {user?.nombre}</Typography>
        <Typography color="text.secondary">Bienvenido a {user?.negocio?.nombre_comercial || "Asyncronix"}</Typography>
      </Box>

      {/*
      <Paper sx={{ ...cardStyle, mb: 4, background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #1d3557 100%)`, color: 'white' }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Box sx={{ bgcolor: alpha('#fff', 0.2), p: 2, borderRadius: 3 }}>
            <WavingHandIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>¿Qué haremos hoy?</Typography>
            <Typography sx={{ opacity: 0.8 }}>Tienes {0} servicios pendientes para esta jornada.</Typography>
          </Box>
        </Stack>
      </Paper>
      */}

      {/* Quick Links */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {quickLinks.map((link) => (
          <Paper key={link.title} onClick={() => navigate(link.path)} sx={{ ...cardStyle, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {link.icon}
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{link.title}</Typography>
            <Typography variant="body2" color="text.secondary">{link.description}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardPage;