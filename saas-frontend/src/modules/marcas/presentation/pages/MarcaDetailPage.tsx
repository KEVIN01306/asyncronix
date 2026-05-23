import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { marcasRepository } from '../../infrastructure/marcas.repository';

const MarcaDetailPage = () => {
    const { id } = useParams();
    const [item, setItem] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await marcasRepository.obtener(id!);
                setItem(res.data);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        })();
    }, [id]);

    return (
        <Box p={4}><Paper sx={{ p: 3 }}>{loading ? <CircularProgress /> : (
            <>
                <Typography variant="h6">Marca</Typography>
                <Typography variant="body1">{item?.marca}</Typography>
            </>
        )}</Paper></Box>
    );
};

export default MarcaDetailPage;
