import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle, Chip, Avatar } from '@mui/material';
import { Add, Edit, Visibility,Search } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Usuario } from '../../domain/interfaces/usuario.interface';
import { usuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';


const UsuariosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const URL_BASE = `${import.meta.env.VITE_API_URL}/`

    const columns = [
        { 
        id: 'nombre', 
        name: 'Nombre', 
        format: (value: any, row: any) => ( 
            <Box display={'flex'} alignItems={'center'} gap={2}> 
            <Avatar 
                src={URL_BASE + row.avatar_url} 
                sx={{ 
                width: 38,  
                height: 38, 
                border: row.avatar_url ? '2px solid' : "",
                borderColor:'secondary.main', 
                background: row.avatar_url ? "#ffffff" : "#876543cc", 
                }} 
            > 
                {value[0]}
            </Avatar> 
            {value.toUpperCase()}
            </Box>
        ) 
        }, 
                { id: 'telefono', name: 'Teléfono' },
        { id: 'roles', name: 'Roles', format: (value: any) => <Chip  color={value?.[0]?.nombre === 'ADMIN' ? 'primary' : 'default'} label={value?.[0]?.nombre} /> },
        { id: 'sucursal', name: 'Sucursal', format: (value: any) => <Chip color={value ? "primary" : "default"} label={value ? value.nombre : 'Sin sucursal'} /> },
    ];

    const actions = [       
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/usuarios/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'blue',
            onClick: (row: any) => navigate(`/usuarios/${row.id}/editar`),
        },
    ];

    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const response = await usuarioRepository.listar(limit, offset);
            setUsuarios(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Informacion</AlertTitle>
                            En este modulo puedes administrar tus Usuarios, registrar nuevos, editar su información o eliminarlos. Mantén tu lista de usuarios actualizada para una mejor gestión de tu negocio.
            </Alert>

            <Box display="flex" flexDirection={ isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    label="Buscar Usuario"
                    placeholder="Ej: Juan Pérez"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="primary" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/usuarios/nuevo')}>
                    Nuevo usuario
                </Button>
            </Box>

            <TableContainer >
                {loading ? (
                    <Loading/>                
                ) : (
                    <>
                        <ListTable
                            data={usuarios}
                            columns={columns}
                            actions={actions}
                            pagination={{
                                total,
                                limit,
                                offset,
                                onPageChange: (newPage) => {
                                    const newOffset = newPage * limit;
                                    setSearchParams({ limit: limit.toString(), offset: newOffset.toString() });
                                },
                                onRowsPerPageChange: (newLimit) => {
                                    setSearchParams({ limit: newLimit.toString(), offset: '0' });
                                },
                            }}
                        />
                    </>
                )}
            </TableContainer>
        </Box>
    );
};

export default UsuariosListPage;