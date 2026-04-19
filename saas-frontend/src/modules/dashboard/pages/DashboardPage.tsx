import { alpha, Box, Typography, Paper, Stack, keyframes, Grid } from "@mui/material";
import { 
  WavingHand as WavingHandIcon, 
  Assignment as AssignmentIcon, 
} from "@mui/icons-material";
import { useAuthStore } from "../../../core/store/authStore";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const premiumCardStyle = {
  p: 3,
  borderRadius: "24px", 
  background: `linear-gradient(135deg, ${alpha("#fff", 0.9)} 0%, ${alpha("#edf2f7", 0.4)} 100%)`, // Gradiente sutil de fondo
  border: "1px solid",
  borderColor: alpha("#6889b8", 0.1),
  boxShadow: `0 20px 60px -15px ${alpha("#6889b8", 0.15)}`,
  backdropFilter: "blur(12px)", 
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeIn} 0.5s ease-out both`, 
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: `0 30px 70px -10px ${alpha("#6889b8", 0.25)}`,
  },
};

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1600, margin: "0 auto" }}>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: "-1.5px", position: 'relative' }}>
            ASYNCRONIX
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 1, fontWeight: 500, fontSize: '1.1rem' }}>
            Bienvenido al núcleo operativo de tu red de servicios.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={4}>
        
        <Grid size={12} sx={{ animationDelay: '0.1s' }}>
          <Paper sx={{ 
            ...premiumCardStyle, 
            background: `linear-gradient(160deg, #1d3557 0%, #6889b8 100%)`,
            position: 'relative', overflow: 'hidden'
          }}>
            <Box sx={{ position: 'absolute', top: -50, right: -50, opacity: 0.15, transform: 'rotate(-20deg)' }}>
              <AssignmentIcon sx={{ fontSize: 250, color: '#fff' }} />
            </Box>
            
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ 
                width: 80, height: 80, borderRadius: "24px", bgcolor: alpha("#fff", 0.15),
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 8px 16px ${alpha("#000", 0.2)}`, backdropFilter: 'blur(5px)'
              }}>
                <WavingHandIcon sx={{ color: "secondary.main", fontSize: 45 }} />
              </Box>
              
              <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", letterSpacing: '-1px' }}>
                  ¡Hola, {user?.nombre}!
                </Typography>
                <Typography variant="h6" sx={{ color: alpha("#fff", 0.8), mt: 0.5, fontWeight: 500 }}>
                  Que haremos hoy? 
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        
      </Grid>
    </Box>
  );
};

export default DashboardPage;