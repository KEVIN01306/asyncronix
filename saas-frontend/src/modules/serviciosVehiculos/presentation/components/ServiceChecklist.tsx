import React from 'react';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import ServiceChecklistTable from './ServiceChecklistTable';

type Props = { servicio: ServicioVehiculo; onUpdate: (s: ServicioVehiculo) => void };

const ServiceChecklist: React.FC<Props> = ({ servicio, onUpdate }) => {
  return <ServiceChecklistTable servicio={servicio} onUpdate={onUpdate} />;
};

export default ServiceChecklist;
