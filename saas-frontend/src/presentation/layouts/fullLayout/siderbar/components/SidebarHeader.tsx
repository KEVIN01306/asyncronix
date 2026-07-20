//import type { Theme } from "@emotion/react";
import { Box, Tooltip } from "@mui/material";
import { useAuthStore } from "../../../../../core/store/authStore";
import { formatImage } from "../../../../../core/utils/formatImage";

export const SidebarHeader: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  return (
    <Box display="flex" justifyContent="center" flex={1} sx={{ py: 1 }}>
      <Tooltip followCursor describeChild title={user?.negocio?.nombre_comercial} placement="top-end">
        <Box display="flex" justifyContent="center" width="100%">
          <Box
            component="img"
            src={user?.negocio?.logo_url ? formatImage(user.negocio.logo_url) : "/icons/asyncronix.png"}
            alt={user?.negocio?.nombre_comercial || "Logo"}
            sx={{
              height: 55,
              width: 'auto',
              maxWidth: '90%',
              objectFit: 'contain',
              filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
};