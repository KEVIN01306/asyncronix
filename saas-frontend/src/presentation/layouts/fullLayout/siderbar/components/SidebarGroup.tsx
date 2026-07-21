import { alpha, Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Popper, Paper, ClickAwayListener } from "@mui/material";
import React, { useContext, useState, useRef, useEffect } from "react";
import getItemStyle from "./getItemsStyles";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import type { MenuItem } from "../Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarContext } from "../SidebarContext";
export const SidebarGroup: React.FC<{ item: MenuItem }> = ({ item }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const ctx = useContext(SidebarContext);

  const matchesRoute = (currentPath: string, link?: string) => {
    if (!link) return false;

    return (
      currentPath === link ||
      currentPath.startsWith(`${link}/`)
    );
  };

  const isActiveModule =
    item.children?.some((child) =>
      matchesRoute(pathname, child.link)
    ) || false;

  // Only expand if explicitly opened by user, not automatically by route
  const isExpanded = item.module ? ctx.openGroups.includes(item.module) : false;

  const prevPathnameRef = useRef<string>(pathname);

  // Auto-open group only when navigating to a sub-item (on route change, not on every render)
  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      if (isActiveModule && !isExpanded && item.module && !ctx.collapsed) {
        ctx.setGroupOpen(item.module, true);
      }
    }
  }, [pathname, isActiveModule, isExpanded, item.module, ctx]);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const popperOpen = Boolean(anchorEl) && ctx.collapsed && ctx.drawerOpen && ctx.hoverGroup === item.module;

  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearOpenTimer = () => {
    if (openTimer.current) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  };

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleOpen = (target: HTMLElement, moduleName: string) => {
    clearOpenTimer();
    openTimer.current = window.setTimeout(() => {
      if (ctx.collapsed && ctx.drawerOpen) {
        setAnchorEl(target);
        ctx.setHoverGroup(moduleName);
      }
      openTimer.current = null;
    }, 220);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!item.module || !ctx.collapsed || !ctx.drawerOpen) return;

    clearCloseTimer();

    if (ctx.hoverGroup && ctx.hoverGroup !== item.module) {
      ctx.setHoverGroup(null);
      setAnchorEl(null);
      scheduleOpen(e.currentTarget, item.module);
      return;
    }

    clearOpenTimer();
    setAnchorEl(e.currentTarget);
    ctx.setHoverGroup(item.module);
  };

  const handleMouseLeave = () => {
    if (ctx.collapsed && ctx.drawerOpen) {
      clearOpenTimer();
      clearCloseTimer();
      closeTimer.current = window.setTimeout(() => {
        setAnchorEl(null);
        if (ctx.hoverGroup === item.module) {
          ctx.setHoverGroup(null);
        }
      }, 180);
    }
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
      clearOpenTimer();
    };
  }, []);

  return (
    <>
      <ListItemButton
        onClick={() => ctx.toggleGroup(item.module)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={getItemStyle(isActiveModule || isExpanded, false, ctx.drawerOpen, ctx.collapsed, ctx.isMobile)}
      >
        {item.icon && (
          <ListItemIcon sx={{ minWidth: 'auto', display: 'flex', justifyContent: 'center', mr: ctx.collapsed ? 0 : 1.5 }}>
            <item.icon fontSize="small" sx={{ fontSize: '1.2rem', color: (isActiveModule || isExpanded) ? 'text.primary' : 'text.secondary' }} />
          </ListItemIcon>
        )}
        
        {!ctx.collapsed && (
          <ListItemText
            primary={item.module}
            primaryTypographyProps={{
              fontSize: "0.85rem",
              fontWeight: (isActiveModule || isExpanded) ? 600 : 500,
              color: (isActiveModule || isExpanded) ? 'text.primary' : 'text.secondary'
            }}
          />
        )}
        
        {!ctx.collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            {isExpanded ? (
              <ExpandLess sx={{ fontSize: '1rem', opacity: 0.6 }} />
            ) : (
              <ExpandMore sx={{ fontSize: '1rem', opacity: 0.6 }} />
            )}
          </Box>
        )}
      </ListItemButton>

      <Popper
        open={popperOpen}
        anchorEl={anchorEl}
        placement="right-start"
        modifiers={[
          { name: 'preventOverflow', options: { boundary: 'viewport' } },
          { name: 'offset', options: { offset: [0, 8] } },
        ]}
        style={{ zIndex: 1400 }}
      >
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <Paper
            elevation={3}
            sx={{ minWidth: 220, p: 1 }}
            onMouseEnter={() => clearCloseTimer()}
            onMouseLeave={() => {
              clearCloseTimer();
              closeTimer.current = window.setTimeout(() => setAnchorEl(null), 180);
            }}
          >
            <Box sx={{ fontSize: '0.8rem', fontWeight: 700, mb: 1, color: 'text.primary', p: 1 }}>{item.module}</Box>
            <List disablePadding>
              {item.children?.map((child) => (
                  <ListItemButton
                    key={child.name}
                    onClick={() => {
                      setAnchorEl(null);
                      if (child.link) {
                        navigate(child.link);
                      }
                      ctx.closeAllGroups();
                    }}
                    sx={getItemStyle(false, true, ctx.drawerOpen, ctx.collapsed, ctx.isMobile)}
                  >
                    {child.icon && (
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                        <child.icon sx={{ fontSize: '1rem' }} />
                      </ListItemIcon>
                    )}
                    <ListItemText primary={child.name} primaryTypographyProps={{ fontSize: '0.8rem' }} />
                  </ListItemButton>
                ))}
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>

      <Collapse in={isExpanded && ctx.drawerOpen} timeout="auto" unmountOnExit>
        <List
          component="div"
          disablePadding
          sx={{
            position: "relative",
          }}
        >
          {item.children?.map((child) => {
            const isChildActive = matchesRoute(
              pathname,
              child.link
            );

            return (
              <ListItemButton
                key={child.name}
                onClick={() =>
                  child.link && navigate(child.link)
                }
                sx={getItemStyle(isChildActive, true, ctx.drawerOpen, ctx.collapsed, ctx.isMobile)}
              >
                {child.icon && (
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                    <child.icon sx={{ fontSize: '1rem', color: isChildActive ? 'text.primary' : 'text.secondary' }} />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={child.name}
                  primaryTypographyProps={{
                    fontSize: "0.85rem",
                    fontWeight: isChildActive ? 600 : 500,
                    color: isChildActive ? 'text.primary' : 'text.secondary'
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </>
  );
};