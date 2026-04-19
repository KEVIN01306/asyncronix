import { Box, Button, Typography } from "@mui/material";


interface Props {    
    text: string;
    textReturn?: string;
    navigate: (path: string) => void;
}

const ErrorPageLoading = ({ text, textReturn, navigate }: Props) => {
    return (
        <Box p={4} textAlign="center">
            <Typography variant="h6">{text}</Typography>
            <Button onClick={() => navigate('/proveedores')}>{textReturn || "Volver a la lista"}</Button>
        </Box>
    );
}

export default ErrorPageLoading;