import { alpha, Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import React, { useState } from "react";
import getItemStyle from "./getItemsStyles";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import type { MenuItem } from "../Sidebar";
import { useLocation, useNavigate } from "react-router-dom";

export const SidebarGroup: React.FC<{ item: MenuItem }> = ({ item }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  
  const isActiveModule = item.children?.some(child => pathname === child.link) || false;
  const isExpanded = open || isActiveModule;

  return (
    <React.Fragment>
      <ListItemButton onClick={() => setOpen(!open)} sx={getItemStyle(isActiveModule || open)}>
        <ListItemIcon><item.icon fontSize="small" /></ListItemIcon>
        <ListItemText primary={item.module} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.01em' }} />
        {isExpanded ? <ExpandLess fontSize="small" sx={{ opacity: 0.5 }} /> : <ExpandMore fontSize="small" sx={{ opacity: 0.5 }} />}
      </ListItemButton>
      
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ position: 'relative', ml: 3.5 }}>
          <Box sx={{ position: 'absolute', left: 8, top: 0, bottom: 8, width: '1px', bgcolor: alpha('#6889b8', 0.2) }} />
          {item.children?.map((child) => {
            const isChildActive = pathname === child.link;
            return (
              <ListItemButton key={child.name} onClick={() => child.link && navigate(child.link)} sx={getItemStyle(isChildActive, true)}>
                <ListItemText 
                  primary={child.name} 
                  primaryTypographyProps={{ 
                    fontSize: '0.7rem', 
                    fontWeight: isChildActive ? 700 : 500,
                    color: isChildActive ? 'primary.main' : 'text.secondary' 
                  }} 
                />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </React.Fragment>
  );
};