import { Box, CircularProgress } from "@mui/material";



const Loading = () => {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
        </Box>
    );
};

export default Loading;