import type { Theme } from "@emotion/react";
import { alpha, type SxProps } from "@mui/material";



const getItemStyle = (isActive: boolean, isChild: boolean = false): SxProps<Theme> => ({
  mx: 1.5,
  my: 0.4,
  //borderRadius: '2px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  color: isActive ? 'primary.main' : 'secondary.main',
  bgcolor: isActive && !isChild ? alpha('#172443', 0.05) : 'transparent',
  '&:hover': {
    bgcolor: alpha('#6889b8', 0.08),
    transform: 'translateX(4px)',
    '& .MuiListItemIcon-root': { color: 'primary.main' },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: isChild ? -16 : -12,
    height: isActive ? '60%' : '0%',
    width: '4px',
    bgcolor: 'primary.main',
    //borderRadius: '0 2px 2px 0',
    transition: 'all 0.3s ease',
  },
  '& .MuiListItemIcon-root': {
    color: isActive ? 'primary.main' : 'secondary.main',
    minWidth: 38,
  },
});


export default getItemStyle;