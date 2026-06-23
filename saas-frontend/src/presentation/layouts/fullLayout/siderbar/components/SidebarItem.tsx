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
      <ListItemIcon><item.icon fontSize="small" /></ListItemIcon>
      <ListItemText  primary={item.name} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 700 }} />
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