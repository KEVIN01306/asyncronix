//import type { Theme } from "@emotion/react";
import { /*alpha,*/ Box, Toolbar } from "@mui/material";

export const SidebarHeader: React.FC = () => (
  
  <Toolbar sx={{ px: 1, my: 1, width: '100%', display:'flex',justifyContent: 'center'}} >
        <Box display="flex" justifyContent="center">
                <Box
                    component="img"
                    src="/icons/asyncronix.png"
                    alt="Logo Foxint"
                    sx={{
                        height: 55,
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
                    }}
                />
    </Box>
  </Toolbar>
);