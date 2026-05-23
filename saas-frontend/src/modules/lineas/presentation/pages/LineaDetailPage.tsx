import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { lineasRepository } from '../../infrastructure/lineas.repository';

const LineaDetailPage = () => {
    const { id } = useParams();
    const [item, setItem] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await lineasRepository.obtener(id!);
                setItem(res.data);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        })();
    }, [id]);

    return (
        <Box p={4}><Paper sx={{ p: 3 }}>{loading ? <CircularProgress /> : (
            <>
                <Typography variant="h6">Línea</Typography>
                <Typography variant="body1">{item?.linea}</Typography>
            </>
        )}</Paper></Box>
    );
};

export default LineaDetailPage;
