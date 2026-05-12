//import type { Theme } from "@emotion/react";
import { /*alpha,*/ Box, Toolbar } from "@mui/material";
import { useAuthStore } from "../../../../../core/store/authStore";

export const SidebarHeader: React.FC = () =>  {

  const user = useAuthStore((state) => state.user);
  console.log("Usuario en SidebarHeader:", user); // Agrega este log para verificar el usuario
  return (
    <Toolbar sx={{ px: 1, my: 1, width: '100%', display:'flex',justifyContent: 'center'}} >
          <Box display="flex" justifyContent="center">
                  <Box
                      component="img"
                      src={import.meta.env.VITE_API_URL + "/" + (user?.negocio?.logo_url || "/icons/asyncronix.png")}
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
  )
};