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
    const [dpi, setDpi] = useState('');
    const [nit, setNit] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [creando, setCreando] = useState(false);

    const handleReset = useCallback(() => {
        setDocumento('');
        setNombre('');
        setDpi('');
        setNit('');
        setTelefono('');
        setEmail('');
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
            } catch {
                setSearchError('Error al buscar el cliente.');
            } finally {
                setSearching(false);
            }
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [documento, open, mostrarCrear, onConfirm]);

    const handleCrearCliente = async () => {
        const cleanNombre = nombre.trim();
        const cleanDpi = dpi.trim();
        const cleanNit = nit.trim();
        const cleanTel = telefono.trim();
        const cleanEmail = email.trim();

        if (!cleanNombre) {
            toast.error('El nombre es obligatorio');
            return;
        }

        if (!cleanDpi && !cleanNit) {
            toast.error('Debe ingresar al menos el DPI o el NIT');
            return;
        }

        setCreando(true);

        try {
            const result = await clienteRepository.registrar({
                nombre: cleanNombre,
                dpi: cleanDpi || null,
                nit: cleanNit || null,
                telefono: cleanTel || null,
                email: cleanEmail || null,
                apellido: null,
            });

            if (result.data) {
                const clienteCreado = result.data;
                if (clienteCreado.reutilizado) {
                    toast.info('Cliente existente asociado: se completaron los datos faltantes ingresados');
                } else {
                    toast.success('Cliente creado y seleccionado exitosamente');
                }
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
            toast.error(serverMsg || 'Error al crear el cliente');
        } finally {
            setCreando(false);
        }
    };

    const handleEnterCreateMode = () => {
        setMostrarCrear(true);
        setSearchError('');
        const doc = documento.trim();
        if (doc.replace(/\D/g, '').length === 13) {
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
                            Escribe el DPI o NIT del cliente para buscarlo automáticamente.
                        </Typography>
                        <TextField
                            fullWidth
                            label="DPI o NIT"
                            placeholder="Buscar por DPI o NIT"
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
                            label="DPI (CUI - 13 dígitos)"
                            placeholder="DPI del cliente"
                            value={dpi}
                            onChange={(e) => setDpi(e.target.value)}
                            disabled={creando}
                            helperText="Identificador principal de acceso"
                        />
                        <TextField
                            fullWidth
                            label="NIT"
                            placeholder="NIT para facturación (opcional)"
                            value={nit}
                            onChange={(e) => setNit(e.target.value)}
                            disabled={creando}
                        />
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
                            label="Teléfono"
                            placeholder="Teléfono (opcional)"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            disabled={creando}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            placeholder="Correo electrónico (opcional)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={creando}
                        />
                        <Typography variant="caption" color="textSecondary">
                            * Nombre es obligatorio. Ingrese DPI o NIT.
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
