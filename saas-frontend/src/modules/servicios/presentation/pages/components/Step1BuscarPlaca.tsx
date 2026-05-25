import { useEffect, useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Autocomplete, Typography, Stack } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { vehiculoRepository } from '../../../../vehiculos/infrastructure/vehiculo.repository';
import { clienteRepository } from '../../../../clientes/infrastructure/clientes.repository';
import { modelosRepository } from '../../../../modelos/infrastructure/modelos.repository';
import { vehiculoTipoRepository } from '../../../../vehiculos/infrastructure/vehiculo-tipo.repository';

const schema = z.object({ placa: z.string().min(1) });

type FormData = z.infer<typeof schema>;

export default function Step1BuscarPlaca({ onVehiculoSeleccionado }: { onVehiculoSeleccionado: (v: any) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { placa: '' } });
  const [vehiculo, setVehiculo] = useState<any | null>(null);
  const [openCrearVehiculo, setOpenCrearVehiculo] = useState(false);
  const [openCrearCliente, setOpenCrearCliente] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const onSubmit = async (data: FormData) => {
    setSearching(true);
    try {
      const res = await vehiculoRepository.buscarPorPlaca(data.placa.toUpperCase());
      const found = res.data;
      if (found) {
        setVehiculo(found);
        setSearchError(null);
      } else {
        setVehiculo(null);
        setOpenCrearVehiculo(true);
      }
    } catch (error) {
      console.error(error);
      setSearchError('Error al buscar la placa. Intenta de nuevo.');
    } finally {
      setSearching(false);
    }
  };

  const handleContinue = () => {
    if (vehiculo) {
      onVehiculoSeleccionado(vehiculo);
    }
  };

  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" gap={2} alignItems="flex-end" flexWrap="wrap">
        <TextField
          label="Placa"
          placeholder="Ej: ABC-123"
          {...register('placa')}
          error={!!errors.placa}
          helperText={errors.placa?.message}
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={searching}>
          {searching ? 'Buscando...' : 'Buscar placa'}
        </Button>
      </Box>

      {searchError && (
        <Typography color="error" mt={2}>{searchError}</Typography>
      )}

      {vehiculo && (
        <Box mt={3}>
          <Typography variant="h6" mb={2}>Vehículo encontrado</Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography><strong>Placa:</strong> {vehiculo.placa}</Typography>
            <Typography><strong>Modelo:</strong> {vehiculo.modelo_nombre ?? vehiculo.modelo_id}</Typography>
            <Typography><strong>Marca:</strong> {vehiculo.marca ?? 'N/A'}</Typography>
            <Typography><strong>Línea:</strong> {vehiculo.linea ?? 'N/A'}</Typography>
            <Typography><strong>Cilindrada:</strong> {vehiculo.cilindrada ?? 'N/A'}</Typography>
            <Typography><strong>Tipo de vehículo:</strong> {vehiculo.tipo_vehiculo ?? vehiculo.vehiculo_tipo_id}</Typography>
            <Typography mt={1}><strong>Cliente asociado:</strong> {vehiculo.cliente ? `${vehiculo.cliente.nombre} (${vehiculo.cliente.nit ?? vehiculo.cliente.dpi ?? 'Sin documento'})` : 'Sin cliente asociado'}</Typography>
          </Box>

          <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
            <Button variant="contained" onClick={handleContinue}>Continuar</Button>
            {!vehiculo.cliente && (
              <Button variant="outlined" onClick={() => setOpenCrearCliente(true)}>Asociar cliente</Button>
            )}
          </Stack>
        </Box>
      )}

      <ModalCrearVehiculo
        open={openCrearVehiculo}
        onClose={() => setOpenCrearVehiculo(false)}
        onCreado={(v: any) => {
          setVehiculo(v);
          setOpenCrearVehiculo(false);
          onVehiculoSeleccionado(v);
        }}
      />

      <ModalCrearCliente
        open={openCrearCliente}
        onClose={() => setOpenCrearCliente(false)}
        vehiculo={vehiculo}
        onSuccess={(cliente: any) => {
          if (vehiculo) {
            const updated = { ...vehiculo, cliente_id: cliente.id, cliente };
            setVehiculo(updated);
          }
        }}
      />
    </Box>
  );
}

export function ModalCrearVehiculo({ open, onClose, onCreado }: any) {
  const [modelos, setModelos] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [nit, setNit] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState<any | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteError, setClienteError] = useState<string | null>(null);
  const [openCrearCliente, setOpenCrearCliente] = useState(false);
  const [creatingVehiculo, setCreatingVehiculo] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [modelosRes, tiposRes] = await Promise.all([
          modelosRepository.listar(100, 0),
          vehiculoTipoRepository.listar(100, 0),
        ]);
        setModelos(modelosRes.data);
        setTipos(tiposRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    if (open) load();
  }, [open]);

  const schema = z.object({ modelo_id: z.string().uuid(), vehiculo_tipo_id: z.string().uuid(), placa: z.string().min(1) });
  type Form = z.infer<typeof schema>;
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { modelo_id: '', vehiculo_tipo_id: '', placa: '' } });

  const buscarCliente = async () => {
    if (!nit.trim()) {
      setClienteError('Ingresa un NIT para buscar');
      return;
    }

    setBuscandoCliente(true);
    setClienteError(null);
    try {
      const response = await clienteRepository.buscarPorDocumento({ nit: nit.trim() });
      const found = response.data ?? null;
      if (found) {
        setClienteEncontrado(found);
      } else {
        setClienteEncontrado(null);
        setClienteError('No se encontró cliente con ese NIT. Puedes crearlo.');
      }
    } catch (error) {
      console.error(error);
      setClienteError('Error al buscar cliente');
      setClienteEncontrado(null);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const onSubmit = async (data: Form) => {
    setCreatingVehiculo(true);
    try {
      const created = await vehiculoRepository.registrar({
        ...data,
        placa: data.placa.toUpperCase(),
        cliente_id: clienteEncontrado?.id ?? undefined
      });
      onCreado(created);
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingVehiculo(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear vehículo</DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="form-crear-vehiculo" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                name="vehiculo_tipo_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={tipos}
                    getOptionLabel={(option: any) => option.tipo}
                    value={tipos.find(t => t.id === field.value) ?? null}
                    onChange={(_e, v) => field.onChange(v?.id ?? '')}
                    renderInput={(params) => <TextField {...params} label="Tipo de vehículo" error={!!errors.vehiculo_tipo_id} helperText={errors.vehiculo_tipo_id?.message} />}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="modelo_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={modelos}
                    getOptionLabel={(option: any) => option.modelo}
                    value={modelos.find(m => m.id === field.value) ?? null}
                    onChange={(_e, v) => field.onChange(v?.id ?? '')}
                    renderInput={(params) => <TextField {...params} label="Modelo" error={!!errors.modelo_id} helperText={errors.modelo_id?.message} />}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="placa"
                control={control}
                render={({ field }) => <TextField {...field} label="Placa" fullWidth error={!!errors.placa} helperText={errors.placa?.message} />}
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Typography variant="subtitle1" mb={1}>Asociar propietario</Typography>
            <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap">
              <TextField
                label="Buscar cliente por NIT"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={buscarCliente} disabled={buscandoCliente}>
                {buscandoCliente ? 'Buscando...' : 'Buscar'}
              </Button>
            </Stack>
            {clienteError && (
              <Typography color="error" mt={1}>{clienteError}</Typography>
            )}
            {clienteEncontrado ? (
              <Box mt={2} sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography><strong>Cliente encontrado:</strong> {clienteEncontrado.nombre}</Typography>
                <Typography><strong>NIT:</strong> {clienteEncontrado.nit ?? 'Sin NIT'}</Typography>
                <Typography><strong>DPI:</strong> {clienteEncontrado.dpi ?? 'Sin DPI'}</Typography>
              </Box>
            ) : (
              nit.trim() && !clienteEncontrado && (
                <Box mt={2}>
                  <Typography>No se encontró cliente. Puedes crearlo.</Typography>
                  <Button sx={{ mt: 1 }} variant="contained" onClick={() => setOpenCrearCliente(true)}>
                    Crear cliente
                  </Button>
                </Box>
              )
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="form-crear-vehiculo" variant="contained" disabled={creatingVehiculo}>{creatingVehiculo ? 'Creando...' : 'Crear y continuar'}</Button>
      </DialogActions>

      <ModalCrearCliente
        open={openCrearCliente}
        onClose={() => setOpenCrearCliente(false)}
        onSuccess={(cliente: any) => {
          setClienteEncontrado(cliente);
          setOpenCrearCliente(false);
        }}
      />
    </Dialog>
  );
}

export function ModalCrearCliente({ open, onClose, vehiculo, onSuccess }: any) {
    const [creatingCliente, setCreatingCliente] = useState(false);

  const schema = z.object({ nombre: z.string().min(1), nit: z.string().optional().nullable(), dpi: z.string().optional().nullable() }).refine(d => d.nit || d.dpi, { message: 'Se requiere NIT o DPI' });
  type Form = z.infer<typeof schema>;
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setCreatingCliente(true);
    try {
      const cleanNit = data.nit?.trim() ?? '';
      let cliente = null;

      if (cleanNit) {
        const response = await clienteRepository.buscarPorDocumento({ nit: cleanNit });
        cliente = response.data ?? null;
      }

      if (!cliente) {
        const telefonoFicticio = "";
        const createdRes = await clienteRepository.registrar({
          nombre: data.nombre,
          apellido: null,
          telefono: telefonoFicticio,
          email: null,
          nit: cleanNit || null,
          dpi: data.dpi ?? null,
        });
        cliente = createdRes.data ?? null;
      }

      if (cliente && vehiculo) {
        await vehiculoRepository.actualizar(vehiculo.id, { cliente_id: cliente.id });
      }

      if (cliente) {
        onSuccess(cliente);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingCliente(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Crear cliente</DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="form-crear-cliente" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="Nombre" fullWidth {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
            </Grid>
            <Grid size={12}>
              <TextField label="NIT" fullWidth {...register('nit')} error={!!errors.nit} helperText={errors.nit?.message} />
            </Grid>
            <Grid size={12}>
              <TextField label="DPI" fullWidth {...register('dpi')} error={!!errors.dpi} helperText={errors.dpi?.message} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="form-crear-cliente" variant="contained" disabled={creatingCliente}>{creatingCliente ? 'Creando...' : 'Crear y asociar'}</Button>
      </DialogActions>
    </Dialog>
  );
}
