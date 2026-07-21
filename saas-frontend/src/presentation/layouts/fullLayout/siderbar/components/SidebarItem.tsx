import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import getItemStyle from "./getItemsStyles";
import type { MenuItem } from "../Sidebar";
import { useContext } from "react";
import { SidebarContext } from "../SidebarContext";

export const SidebarItem: React.FC<{ item: MenuItem }> = ({ item }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = item.link
    ? pathname === item.link || pathname.startsWith(`${item.link}/`)
    : false;
  const ctx = useContext(SidebarContext);

  const content = (
    <ListItemButton onClick={() => item.link && navigate(item.link)} sx={getItemStyle(isActive, false, ctx.drawerOpen, ctx.collapsed, ctx.isMobile)}>
      {item.icon && (
        <ListItemIcon sx={{ minWidth: 'auto', display: 'flex', justifyContent: 'center', mr: ctx.collapsed ? 0 : 1.5 }}>
          <item.icon fontSize="small" sx={{ fontSize: '1.2rem', color: isActive ? 'text.primary' : 'text.secondary' }} />
        </ListItemIcon>
      )}
      {!ctx.collapsed && (
        <ListItemText
          primary={item.name}
          primaryTypographyProps={{
            fontSize: '0.85rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'text.primary' : 'text.secondary'
          }}
        />
      )}
    </ListItemButton>
  );

  // When collapsed show a tooltip with the name
  if (ctx.collapsed) {
    return (
      <Tooltip title={item.name || ''} placement="right" arrow>
        <span>{content}</span>
      </Tooltip>
    );
  }

  return content;
};