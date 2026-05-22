import { useState, useCallback, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    CircularProgress,
    Alert,
    InputAdornment,
} from '@mui/material';
import { Search, PersonAdd, ArrowBack } from '@mui/icons-material';
import { toast } from 'sonner';
import { clienteRepository } from '../../../clientes/infrastructure/clientes.repository';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: {
        cliente_id: string | null;
        cf: boolean;
        nit?: string | null;
        dpi?: string | null;
        nombre?: string | null;
        apellido?: string | null;
        telefono?: string | null;
        email?: string | null;
    }) => void;
};

export default function SaleClientModal({ open, onClose, onConfirm }: Props) {
    const [documento, setDocumento] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    const [mostrarCrear, setMostrarCrear] = useState(false);
    const [nombre, setNombre] = useState('');
    const [nit, setNit] = useState('');
    const [dpi, setDpi] = useState('');
    const [creando, setCreando] = useState(false);

    const handleReset = useCallback(() => {
        setDocumento('');
        setNombre('');
        setNit('');
        setDpi('');
        setMostrarCrear(false);
        setSearchError('');
    }, []);

    const handleClose = () => {
        handleReset();
        onClose();
    };

    useEffect(() => {
        if (!open || mostrarCrear) return;

        const cleanDoc = documento.trim();
        if (!cleanDoc) {
            setSearchError('');
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSearchError('');
            setSearching(true);

            try {
                const result = await clienteRepository.buscarPorDocumento({
                    nit: cleanDoc,
                    dpi: cleanDoc,
                });

                if (result.data) {
                    const client = result.data;
                    toast.success(`Cliente asociado: ${client.nombre}`);
                    onConfirm({
                        cliente_id: client.id,
                        cf: false,
                        nit: client.nit || null,
                        dpi: client.dpi || null,
                        nombre: client.nombre || null,
                        apellido: client.apellido || null,
                        telefono: client.telefono || null,
                        email: client.email || null,
                    });
                    handleClose();
                } else {
                    setSearchError('No se encontró un cliente con este documento.');
                }
            } catch (err: any) {
                setSearchError('Error al buscar el cliente.');
            } finally {
                setSearching(false);
            }
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [documento, open, mostrarCrear, onConfirm]);

    const handleCrearCliente = async () => {
        if (!nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }

        const cleanNit = nit.trim();
        const cleanDpi = dpi.trim();

        if (!cleanNit && !cleanDpi) {
            toast.error('Debe ingresar al menos un NIT o DPI');
            return;
        }

        setCreando(true);

        try {
            const telefonoParaBD = cleanNit || cleanDpi;

            const result = await clienteRepository.registrar({
                nombre: nombre.trim(),
                nit: cleanNit || null,
                dpi: cleanDpi || null,
                telefono: telefonoParaBD,
                email: null,
                apellido: null,
            });

            if (result.data) {
                const clienteCreado = result.data;
                toast.success('Cliente creado y seleccionado exitosamente');
                onConfirm({
                    cliente_id: clienteCreado.id,
                    cf: false,
                    nit: clienteCreado.nit || null,
                    dpi: clienteCreado.dpi || null,
                    nombre: clienteCreado.nombre || null,
                    apellido: clienteCreado.apellido || null,
                    telefono: clienteCreado.telefono || null,
                    email: clienteCreado.email || null,
                });
                handleClose();
            }
        } catch (err: any) {
            const serverMsg = err.response?.data?.message;
            if (serverMsg && serverMsg.includes('telefono')) {
                toast.error('Este documento ya está registrado como teléfono de otro cliente.');
            } else {
                toast.error(serverMsg || 'Error al crear el cliente');
            }
        } finally {
            setCreando(false);
        }
    };

    const handleEnterCreateMode = () => {
        setMostrarCrear(true);
        setSearchError('');
        const doc = documento.trim();
        if (doc.length === 13) {
            setDpi(doc);
            setNit('');
        } else {
            setNit(doc);
            setDpi('');
        }
    };

    const handleSelectCF = () => {
        onConfirm({
            cliente_id: null,
            cf: true,
            nit: null,
            dpi: null,
            nombre: 'Consumidor Final',
            apellido: null,
            telefono: null,
            email: null,
        });
        toast.info('Venta configurada como Consumidor Final (C/F)');
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 600 }}>
                {mostrarCrear ? 'Nuevo Cliente' : 'Asociar Cliente'}
            </DialogTitle>
            <DialogContent dividers>
                {!mostrarCrear ? (
                    <Box display="flex" flexDirection="column" gap={2.5} py={1}>
                        <Typography variant="body2" color="textSecondary">
                            Escribe el NIT o DPI del cliente para buscarlo automáticamente.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Documento"
                            placeholder="Buscar por NIT o DPI"
                            value={documento}
                            onChange={(e) => setDocumento(e.target.value)}
                            autoFocus
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: searching && (
                                    <InputAdornment position="end">
                                        <CircularProgress size={20} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {searchError && (
                            <Alert
                                severity="warning"
                                action={
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={handleEnterCreateMode}
                                        startIcon={<PersonAdd />}
                                    >
                                        Crear
                                    </Button>
                                }
                            >
                                {searchError}
                            </Alert>
                        )}

                        <Box display="flex" justifyContent="space-between" mt={1}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleSelectCF}
                                fullWidth
                                sx={{ textTransform: 'none' }}
                            >
                                Consumidor Final (C/F)
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2} py={1}>
                        <TextField
                            fullWidth
                            label="Nombre Completo"
                            placeholder="Nombre del cliente"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            disabled={creando}
                            autoFocus
                            required
                        />
                        <TextField
                            fullWidth
                            label="NIT"
                            placeholder="Opcional si tiene DPI"
                            value={nit}
                            onChange={(e) => setNit(e.target.value)}
                            disabled={creando}
                        />
                        <TextField
                            fullWidth
                            label="DPI"
                            placeholder="Opcional si tiene NIT"
                            value={dpi}
                            onChange={(e) => setDpi(e.target.value)}
                            disabled={creando}
                        />
                        <Typography variant="caption" color="textSecondary">
                            * Se requiere ingresar al menos el NIT o el DPI.
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} disabled={creando} color="inherit">
                    Cancelar
                </Button>
                {mostrarCrear ? (
                    <>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => setMostrarCrear(false)}
                            disabled={creando}
                        >
                            Atrás
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCrearCliente}
                            disabled={creando}
                        >
                            {creando ? <CircularProgress size={20} color="inherit" /> : 'Crear y Asociar'}
                        </Button>
                    </>
                ) : (
                    <Button
                        startIcon={<PersonAdd />}
                        onClick={() => setMostrarCrear(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        Nuevo Cliente
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
