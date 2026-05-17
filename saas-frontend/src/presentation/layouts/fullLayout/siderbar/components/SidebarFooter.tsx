import { alpha, Box, Typography } from "@mui/material";

export const SidebarFooter: React.FC = () => (
  <Box sx={{ mt: 'auto', p: 2.5, mx: 2, mb: 3, borderRadius: '2px', bgcolor: '#f4f7fa', border: '1px solid', borderColor: alpha('#6889b8', 0.1) }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800 }}>PLAN EMPRESARIAL</Typography>
    </Box>
    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.85rem' }}>Kevin Sanchez</Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Software Engineer</Typography>
  </Box>
);