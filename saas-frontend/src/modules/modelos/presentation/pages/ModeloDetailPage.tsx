import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import { modelosRepository } from '../../infrastructure/modelos.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ModeloDetailPage = () => {
    const { id } = useParams();
    const [item, setItem] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await modelosRepository.obtener(id!);
                setItem(res.data);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        })();
    }, [id]);

    return (
        <Box p={4}><Paper sx={{ p: 3 }}>{loading ? <Loading /> : (
            <>
                <Typography variant="h6">Modelo</Typography>
                <Typography variant="body1">{item?.modelo} ({item?.anio})</Typography>
                <Typography variant="body2">Marca: {item?.marca}</Typography>
                <Typography variant="body2">Línea: {item?.linea}</Typography>
                <Typography variant="body2">Cilindrada: {item?.cilindrada}</Typography>
            </>
        )}</Paper></Box>
    );
};

export default ModeloDetailPage;
