import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, FormControl, InputLabel, Select, MenuItem, TextField, Stack } from '@mui/material';
import { toast } from 'sonner';
import { ChecklistItemRepository } from '../../../checklist-items/infrastructure/repositories/checklist-item.repository';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import type { ChecklistItem } from '../../../checklist-items/domain/interfaces/checklist-item.interface';
import { ESTADO_SERVICIO } from '../../domain/servicio.constants';

const checklistEstados = ['OPTIMO', 'REGULAR', 'REQUIERE_CAMBIO', 'NO_APLICA'];

type Props = { servicio: Servicio; onUpdate: (s: Servicio) => void };

const ServiceChecklistTable: React.FC<Props> = ({ servicio, onUpdate }) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [editingRespuestaId, setEditingRespuestaId] = useState<string | null>(null);
  const [editingEstado, setEditingEstado] = useState<string>(checklistEstados[0]);
  const [editingObservaciones, setEditingObservaciones] = useState<string>('');
  const [editingAll, setEditingAll] = useState(false);
  const [editingMap, setEditingMap] = useState<Record<string, { estado: string; observaciones: string }>>({});
  const [savingRespuesta, setSavingRespuesta] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => { const load = async () => { try { const resp = await ChecklistItemRepository.listar(100,0); setChecklistItems(resp.data); } catch (e) { console.error(e); toast.error('No se pudieron cargar los items de checklist'); } }; load(); }, []);

  const startEditRespuesta = (respuesta: any) => { setEditingRespuestaId(respuesta.id); setEditingEstado(respuesta.estado); setEditingObservaciones(respuesta.observaciones ?? ''); };
  const cancelEditRespuesta = () => { setEditingRespuestaId(null); setEditingEstado(checklistEstados[0]); setEditingObservaciones(''); };

  const saveEditRespuesta = async (respuestaId: string) => {
    if (!servicio.id) return;
    setSavingRespuesta(true);
    try {
      await servicioRepository.actualizarChecklistRespuesta(servicio.id, respuestaId, { estado: editingEstado, observaciones: editingObservaciones || null });
      toast.success('Respuesta actualizada');
      cancelEditRespuesta();
      const updated = await servicioRepository.obtener(servicio.id);
      onUpdate(updated);
    } catch (error) { console.error(error); toast.error('No se pudo actualizar la respuesta'); } finally { setSavingRespuesta(false); }
  };

  const startEditAll = () => {
    const map: Record<string, { estado: string; observaciones: string }> = {};
    servicio.checklist?.forEach((r) => { map[r.id] = { estado: r.estado, observaciones: r.observaciones ?? '' }; });
    setEditingMap(map); setEditingAll(true);
  };

  const cancelEditAll = () => { setEditingMap({}); setEditingAll(false); };

  const saveAllEdits = async () => {
    if (!servicio.id) return;
    setSavingAll(true);
    try {
      for (const [respuestaId, payload] of Object.entries(editingMap)) {
        await servicioRepository.actualizarChecklistRespuesta(servicio.id, respuestaId, { estado: payload.estado, observaciones: payload.observaciones || null });
      }
      toast.success('Checklist actualizado correctamente');
      setEditingAll(false); setEditingMap({});
      const updated = await servicioRepository.obtener(servicio.id);
      onUpdate(updated);
    } catch (error) { console.error(error); toast.error('No se pudieron guardar los cambios del checklist'); } finally { setSavingAll(false); }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Checklist</Typography>
            <Box>
          {!editingAll ? (
            <Button variant="outlined" size="small" onClick={startEditAll} sx={{ mr: 1 }} disabled={savingAll || servicio.estado !== ESTADO_SERVICIO.RECEPCION}>Editar checklist</Button>
          ) : (
            <>
              <Button variant="contained" size="small" onClick={saveAllEdits} sx={{ mr: 1 }} disabled={savingAll}>{savingAll ? 'Guardando...' : 'Guardar cambios'}</Button>
              <Button variant="outlined" size="small" onClick={cancelEditAll} disabled={savingAll}>Cancelar</Button>
            </>
          )}
        </Box>
      </Box>

      {servicio.checklist?.length ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicio.checklist.map((respuesta) => {
                const itemNombre = checklistItems.find(i => i.id === respuesta.checklist_item_id)?.nombre ?? respuesta.checklist_item_id;
                if (editingAll) {
                  const bulkState = editingMap[respuesta.id];
                  return (
                    <TableRow key={respuesta.id}>
                      <TableCell>{itemNombre}</TableCell>
                      <TableCell>
                        <FormControl fullWidth>
                          <InputLabel id={`bulk-estado-${respuesta.id}`}>Estado</InputLabel>
                          <Select labelId={`bulk-estado-${respuesta.id}`} value={bulkState?.estado ?? respuesta.estado} label="Estado" onChange={(e) => setEditingMap(prev => ({ ...prev, [respuesta.id]: { ...(prev[respuesta.id] ?? { estado: respuesta.estado, observaciones: respuesta.observaciones ?? '' }), estado: e.target.value } }))}>
                            {checklistEstados.map((estado) => (<MenuItem key={estado} value={estado}>{estado.replace('_', ' ')}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell><TextField fullWidth multiline minRows={2} value={bulkState?.observaciones ?? respuesta.observaciones ?? ''} onChange={(e) => setEditingMap(prev => ({ ...prev, [respuesta.id]: { ...(prev[respuesta.id] ?? { estado: respuesta.estado, observaciones: respuesta.observaciones ?? '' }), observaciones: e.target.value } }))} /></TableCell>
                      <TableCell />
                    </TableRow>
                  );
                }
                if (editingRespuestaId === respuesta.id) {
                  return (
                    <TableRow key={respuesta.id}>
                      <TableCell>{itemNombre}</TableCell>
                      <TableCell>
                        <FormControl fullWidth>
                          <InputLabel id={`estado-edit-${respuesta.id}`}>Estado</InputLabel>
                          <Select labelId={`estado-edit-${respuesta.id}`} value={editingEstado} label="Estado" onChange={(e) => setEditingEstado(e.target.value)}>
                            {checklistEstados.map((estado) => (<MenuItem key={estado} value={estado}>{estado.replace('_', ' ')}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell><TextField fullWidth multiline minRows={2} value={editingObservaciones} onChange={(e) => setEditingObservaciones(e.target.value)} /></TableCell>
                      <TableCell><Stack direction="row" spacing={1}><Button variant="contained" onClick={() => saveEditRespuesta(respuesta.id)} disabled={savingRespuesta}>{savingRespuesta ? 'Guardando...' : 'Guardar'}</Button><Button variant="outlined" onClick={cancelEditRespuesta} disabled={savingRespuesta}>Cancelar</Button></Stack></TableCell>
                    </TableRow>
                  );
                }
                return (
                    <TableRow key={respuesta.id}>
                    <TableCell>{itemNombre}</TableCell>
                    <TableCell>{respuesta.estado}</TableCell>
                    <TableCell>{respuesta.observaciones ?? 'Sin observaciones'}</TableCell>
                    <TableCell><Button size="small" onClick={() => startEditRespuesta(respuesta)} disabled={savingAll || savingRespuesta || servicio.estado !== ESTADO_SERVICIO.RECEPCION}>Editar</Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="text.secondary">No se han registrado respuestas de checklist aún.</Typography>
      )}
    </Paper>
  );
};

export default ServiceChecklistTable;
