import type { Theme } from "@emotion/react";
import { alpha, type SxProps } from "@mui/material";

const getItemStyle = (isActive: boolean, _isChild: boolean = false, drawerOpen: boolean = true, collapsed: boolean = false, _isMobile: boolean = false): SxProps<Theme> => ({
  mx: 1,
  my: 0.1,
  px: 1.5,
  py: 0.75,
  borderRadius: '6px',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  color: isActive ? 'text.primary' : 'text.secondary',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  bgcolor: (drawerOpen && isActive && !collapsed) ? alpha('#000000', 0.05) : 'transparent',
  ...(drawerOpen && !collapsed ? {
    '&:hover': {
      bgcolor: alpha('#000000', 0.04),
    },
  } : {}),
  '& .MuiListItemIcon-root': {
    color: isActive ? 'text.primary' : 'text.secondary',
    minWidth: 'auto',
  },
});

export default getItemStyle;