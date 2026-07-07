import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardHeader, Checkbox, FormControlLabel, MenuItem, Stack, TextField } from '@mui/material';
import { toast } from 'sonner';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { categoriaTransaccionRepository } from '../../infrastructure/categoria-transaccion.repository';
import type { CategoriaTransaccionFormValues } from '../../domain/interfaces/categoria-transaccion.interface';

const initialValues: CategoriaTransaccionFormValues = {
  nombre: '',
  tipo: 'INGRESO',
  activo: true,
};

const CategoriaTransaccionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [values, setValues] = useState<CategoriaTransaccionFormValues>(initialValues);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const loadCategoria = async () => {
      setLoading(true);
      try {
        const response = await categoriaTransaccionRepository.obtener(id!);
        setValues({
          nombre: response.data.nombre,
          tipo: response.data.tipo,
          activo: response.data.activo,
        });
      } catch (error) {
        toast.error('No se pudo cargar la categoría');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoria();
  }, [id, isEdit]);

  const title = useMemo(() => isEdit ? 'Editar categoría' : 'Nueva categoría', [isEdit]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await categoriaTransaccionRepository.actualizar(id!, values);
        toast.success('Categoría actualizada');
      } else {
        await categoriaTransaccionRepository.crear(values);
        toast.success('Categoría creada');
      }
      navigate('/categorias-transaccion');
    } catch (error) {
      toast.error('No se pudo guardar la categoría');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box maxWidth={700} mx="auto" p={3}>
      <Card>
        <CardHeader title={title} subheader="Define el nombre, tipo de movimiento y estado de la categoría." />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Nombre"
                value={values.nombre}
                onChange={(event) => setValues((prev) => ({ ...prev, nombre: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                select
                label="Tipo de movimiento"
                value={values.tipo}
                onChange={(event) => setValues((prev) => ({ ...prev, tipo: event.target.value as CategoriaTransaccionFormValues['tipo'] }))}
                fullWidth
              >
                <MenuItem value="INGRESO">Ingreso</MenuItem>
                <MenuItem value="EGRESO">Egreso</MenuItem>
              </TextField>
              <FormControlLabel
                control={<Checkbox checked={values.activo} onChange={(event) => setValues((prev) => ({ ...prev, activo: event.target.checked }))} />}
                label="Activo"
              />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/categorias-transaccion')}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}</Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CategoriaTransaccionFormPage;
