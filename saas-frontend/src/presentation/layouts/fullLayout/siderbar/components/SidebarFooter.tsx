import { alpha, Avatar, Box, Stack, Tooltip, Typography } from "@mui/material";
import { useAuthStore } from "../../../../../core/store/authStore";

export const SidebarFooter = () => {

  const user = useAuthStore((state) => state.user);

  return (
    <Box sx={{ mt: 'auto', p: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: alpha('#6889b8', 0.1) }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ cursor: 'pointer' }}>
                    <Tooltip followCursor describeChild title={user?.nombre + ' ' + user?.apellido} placement="top-end">
                      <Avatar
                        src={user?.avatar_url ? `${import.meta.env.VITE_API_URL}/${user.avatar_url}` : "/static/images/avatar/1.jpg"}
                        sx={{
                          width: 50, 
                          height: 50, 
                          border: user?.avatar_url ?  '2px solid' : "",
                          borderColor: 'secondary.main',
                          background: user?.avatar_url ? "#ffffff" : "#876543cc",
                        }}
                      >
                        {user?.nombre[0]}
                      </Avatar>
                    </Tooltip>
                    <Tooltip followCursor describeChild title={user?.email} placement="top-end">
                      <Typography variant="body2" color="text.primary" fontWeight="500">
                        {user?.nombre}
                      </Typography>
                    </Tooltip>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
          </Stack>
    </Box>
  )
};