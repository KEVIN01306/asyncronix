import { useEffect, useState, useCallback } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import ListTable from '../../../../../shared/components/ui/tables/ListTable';
import { AtributoRepository } from '../../../../atributos/infrastructure/atributo.repository';
import { toast } from 'sonner';
import Loading from '../../../../../shared/components/ui/Loaders/Loading';

export default function AtributosTab() {
    const [atributos, setAtributos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [nombre, setNombre] = useState('');
    const [valores, setValores] = useState('');
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const columns = [
        { id: 'nombre', name: 'Nombre' },
        {
            id: 'valores',
            name: 'Valores',
            format: (_value: any, row: any) => `${(row.valores || []).length} valores`
        }
    ];

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await AtributoRepository.listar();
            // Maneja ambas posibles estructuras de respuesta
            const respData = (res as any)?.data;
            let data = [];
            
            if (respData?.data && Array.isArray(respData.data)) {
                // Nueva estructura: { data: [...], meta: {...} }
                data = respData.data;
            } else if (Array.isArray(respData)) {
                // Estructura antigua: array directo
                data = respData;
            }
            
            setAtributos(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar atributos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const handleOpenCreate = () => {
        setEditingId(null);
        setNombre('');
        setValores('');
        setOpen(true);
    };

    const handleOpenEdit = (attr: any) => {
        setEditingId(attr.id);
        setNombre(attr.nombre);
        setValores((attr.valores || []).map((v: any) => v.valor).join(', '));
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }

        try {
            const payload = {
                nombre,
                valores: valores ? valores.split(',').map(s => s.trim()).filter(Boolean) : []
            };

            if (editingId) {
                await AtributoRepository.actualizar(editingId, payload);
                toast.success('Atributo actualizado');
            } else {
                await AtributoRepository.crear(payload);
                toast.success('Atributo creado');
            }

            handleCloseDialog();
            await fetch();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar atributo');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await AtributoRepository.eliminar(deleteId);
            toast.success('Atributo eliminado');
            setOpenDelete(false);
            setDeleteId(null);
            await fetch();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar atributo');
        }
    };

    const actions = [
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'primary',
            onClick: (row: any) => handleOpenEdit(row),
        },
        {
            name: 'Eliminar',
            icon: <Delete fontSize="small" />,
            color: 'error',
            onClick: (row: any) => {
                setDeleteId(row.id);
                setOpenDelete(true);
            },
        },
    ];

    if (loading) return <Loading />;

    return (
        <Box p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box />
                <Button startIcon={<Add />} onClick={handleOpenCreate} variant="contained">
                    Nuevo atributo
                </Button>
            </Box>

            <ListTable
                data={atributos}
                columns={columns}
                actions={actions}
            />

            <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingId ? 'Editar atributo' : 'Crear atributo'}</DialogTitle>
                <DialogContent sx={{ py: 2 }}>
                    <TextField
                        fullWidth
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        sx={{ mb: 2 }}
                        autoFocus
                    />
                    <TextField
                        fullWidth
                        label="Valores (coma-separados)"
                        value={valores}
                        onChange={(e) => setValores(e.target.value)}
                        helperText="Ej: Rojo, Azul, Verde"
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave}>
                        {editingId ? 'Guardar cambios' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDelete} onClose={() => setOpenDelete(false)} maxWidth="sm">
                <DialogTitle>¿Eliminar atributo?</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        Estás a punto de eliminar este atributo. Esta acción es irreversible.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
