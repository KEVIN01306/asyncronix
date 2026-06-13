import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import getItemStyle from "./getItemsStyles";
import type { MenuItem } from "../Sidebar";

export const SidebarItem: React.FC<{ item: MenuItem }> = ({ item }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = item.link
  ? pathname === item.link || pathname.startsWith(`${item.link}/`)
  : false;

  return (
    <ListItemButton onClick={() => item.link && navigate(item.link)} sx={getItemStyle(isActive)}>
      <ListItemIcon><item.icon fontSize="small" /></ListItemIcon>
      <ListItemText  primary={item.name} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 700 }} />
    </ListItemButton>
  );
};