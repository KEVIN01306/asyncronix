import { Avatar, Box, Stack, Tooltip, Typography } from "@mui/material";
import { useAuthStore } from "../../../../../core/store/authStore";
import { formatImage } from '../../../../../core/utils/formatImage';


interface SidebarFooterProps {
  collapsed: boolean;
}

export const SidebarFooter = ({ collapsed }: SidebarFooterProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <Box sx={{ mt: 'auto', p: 1, bgcolor: 'background.paper' }}>
      <Stack
        direction={collapsed ? 'column' : 'row'}
        alignItems="center"
        spacing={collapsed ? 1 : 1.5}
        sx={{
          cursor: 'pointer',
          width: '100%',
          textAlign: collapsed ? 'center' : 'left',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Tooltip followCursor describeChild title={user?.nombre + ' ' + user?.apellido} placement="top-end">
          <Avatar
            src={user?.avatar_url ? formatImage(user.avatar_url) : "/static/images/avatar/1.jpg"}
            sx={{
              width: collapsed ? 40 : 50,
              height: collapsed ? 40 : 50,
              border: user?.avatar_url ? '2px solid' : "",
              borderColor: 'secondary.main',
              background: user?.avatar_url ? '#ffffff' : '#876543cc',
              mx: collapsed ? 'auto' : 0,
            }}
          >
            {user?.nombre?.[0] ?? ''}
          </Avatar>
        </Tooltip>

        {!collapsed && (
          <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Tooltip followCursor describeChild title={user?.nombre + ' ' + user?.apellido} placement="top-end">
              <Typography variant="body2" color="text.primary" fontWeight="500" noWrap>
                {user?.nombre}
              </Typography>
            </Tooltip>
            <Tooltip followCursor describeChild title={user?.email || ''} placement="top-end">
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email}
              </Typography>
            </Tooltip>
          </Box>
        )}

        {!collapsed && (
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
        )}
      </Stack>
    </Box>
  );
};