import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface LinkStyleProps {
  ruta: string;
  text: React.ReactNode; // o 'children' si prefieres usarlo como etiqueta contenedora
}

export const LinkStyle = ({ ruta, text }: LinkStyleProps) => {
    const navigate = useNavigate();
    return (
        <Typography variant="body2"  sx={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} onClick={() => navigate(ruta)}>
            {text}
        </Typography>
    );
}