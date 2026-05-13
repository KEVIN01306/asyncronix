import React from 'react';
import { 
  Box, Divider, Drawer, List,
} from '@mui/material';
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarItem } from './components/SidebarItem';
import { SidebarGroup } from './components/SidebarGroup';
import { SidebarFooter } from './components/SidebarFooter';

export interface MenuItem {
  name?: string;
  module?: string;
  link?: string;
  icon: React.ElementType;
  children?: MenuItem[];
}
interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  drawerWidth: number;
  menuItems: (MenuItem | null)[];
}

const Sidebar = ({ open, onClose, isMobile, drawerWidth, menuItems }: SidebarProps) => {
  return (
    <Drawer
      variant={isMobile || !open ?  "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, 
      }}
      sx={{
        border: isMobile ? (theme) => `1px solid ${theme.palette.divider}` : undefined,
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          boxShadow: 'none',
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: isMobile ?  "background.paper" : "background.paper",
        },
      }}
    >
      <SidebarHeader />
      <Divider/>
      <Box sx={{ overflow: 'auto', px: 1, pb: 4 }}>
      <List disablePadding>
          {menuItems.map((item) => (
            item ? (
              item.children 
                ? <SidebarGroup key={item.module} item={item} />
                : <SidebarItem key={item.name} item={item} />
            ) : null
          ))}
        </List>
      </Box>
      <SidebarFooter />
    </Drawer>
  );
};
export default Sidebar;