import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  useTheme,
} from '@mui/material';
import { SidebarContext } from './SidebarContext';
import type { SidebarContextValue } from './SidebarContext';
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarItem } from './components/SidebarItem';
import { SidebarGroup } from './components/SidebarGroup';
import { SidebarFooter } from './components/SidebarFooter';
import { Add, ChevronLeft } from '@mui/icons-material';

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
  onOpen?: () => void;
  onCollapseSidebar?: () => void;
  onExpandSidebar?: () => void;
  collapsed: boolean;
}

const Sidebar = ({ open, onClose, isMobile, drawerWidth, menuItems, onOpen, onCollapseSidebar, onExpandSidebar, collapsed }: SidebarProps) => {
  const theme = useTheme();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [pendingOpenGroup, setPendingOpenGroup] = useState<string | null>(null);
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);

  // Close all groups when the sidebar is closed
  useEffect(() => {
    if (!open) {
      const timer = window.setTimeout(() => setOpenGroups([]));
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [open]);

  const toggleGroup = (module?: string) => {
    if (!module) return;
    if (collapsed) return;
    // If drawer is closed, request parent to open first and defer opening group
    if (!open && typeof onOpen === 'function') {
      setPendingOpenGroup(module);
      onOpen();
      return;
    }

    setOpenGroups((prev) => {
      const has = prev.includes(module);
      if (has) return prev.filter((m) => m !== module);
      return [...prev, module];
    });
  };

  // When drawer becomes open and there's a pending group to open, open it
  useEffect(() => {
    if (open && pendingOpenGroup) {
      const timer = window.setTimeout(() => {
        setOpenGroups((prev) => (prev.includes(pendingOpenGroup as string) ? prev : [...prev, pendingOpenGroup as string]));
        setPendingOpenGroup(null);
      });
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [open, pendingOpenGroup]);

  useEffect(() => {
    if (collapsed) {
      const timer = window.setTimeout(() => setOpenGroups([]));
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [collapsed]);

  const setGroupOpen = (module: string, value: boolean) => {
    if (!module) return;
    setOpenGroups((prev) => {
      const has = prev.includes(module);
      if (value && !has) return [...prev, module];
      if (!value && has) return prev.filter((m) => m !== module);
      return prev;
    });
  };

  const closeAllGroups = () => setOpenGroups([]);

  const sidebarContext: SidebarContextValue = {
    openGroups,
    toggleGroup,
    setGroupOpen,
    closeAllGroups,
    collapsed,
    drawerOpen: open,
    isMobile,
    hoverGroup,
    setHoverGroup,
    openSidebar: onOpen,
  };

  const expandedWidth = drawerWidth || 260;
  const collapsedWidth = 72;

  const effectiveWidth = isMobile ? expandedWidth : collapsed ? collapsedWidth : expandedWidth;

  const variant = isMobile || !open ? 'temporary' : 'persistent';

  const listItemTextStyles = useMemo(() => ({
    transition: theme.transitions.create(['opacity', 'width', 'margin'], {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }),
    opacity: collapsed ? 0 : 1,
    width: collapsed ? 0 : 'auto',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    mr: collapsed ? 0 : 1,
  }), [collapsed, theme]);

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
      elevation={0}
      ModalProps={{ keepMounted: !isMobile }}
      sx={{
        border: isMobile ? 'none' : undefined,
        // prevent closed drawer from intercepting pointer events on mobile
        pointerEvents: open ? 'auto' : 'none',
        width: effectiveWidth,
        flexShrink: 0,
        transition: (theme) => theme.transitions.create(['width'], {
          duration: theme.transitions.duration.standard,
          easing: theme.transitions.easing.easeInOut,
        }),
        '& .MuiDrawer-paper': {
          boxShadow: 'none',
          width: effectiveWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          // also ensure the paper doesn't capture pointer events when closed
          pointerEvents: open ? 'auto' : 'none',
          transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
          }),
          willChange: 'width',
        },
      }}
    >
      <SidebarContext.Provider value={sidebarContext}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ px: 1, py: 1, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', flexShrink: 0 }}>
          {!collapsed && <SidebarHeader />}
          {!isMobile && onCollapseSidebar && onExpandSidebar ? (
            <IconButton
              onClick={collapsed ? onExpandSidebar : onCollapseSidebar}
              size="small"
              sx={{ color: 'primary.main', ml: collapsed ? 0 : 1 }}
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {collapsed ? <Add fontSize="small" /> : <ChevronLeft fontSize="small" />}
            </IconButton>
          ) : null}
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 1, pt: 1, pb: 1 }}>
          <List disablePadding sx={{
            '& .MuiListItemText-root': listItemTextStyles,
            '& .MuiListItemIcon-root': {
              minWidth: collapsed ? 0 : 38,
              justifyContent: 'center',
              color: 'text.secondary',
            },
            '& .MuiListItemButton-root': {
              px: collapsed ? 1 : 1.5,
              justifyContent: collapsed ? 'center' : 'flex-start',
            },
            }}>
            {menuItems.map((item) => (
              item ? (
                item.children 
                  ? <SidebarGroup key={item.module} item={item} />
                  : <SidebarItem key={item.name} item={item} />
              ) : null
            ))}
          </List>
        </Box>

        <Divider sx={{ flexShrink: 0 }} />
        <Box sx={{ p: 1, flexShrink: 0 }}>
          <SidebarFooter collapsed={collapsed} />
        </Box>
      </Box>
      </SidebarContext.Provider>
    </Drawer>
  );
};
export default Sidebar;