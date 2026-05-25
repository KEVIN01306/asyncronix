import React from 'react';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import ServiceChecklistTable from './ServiceChecklistTable';

type Props = { servicio: Servicio; onUpdate: (s: Servicio) => void };

const ServiceChecklist: React.FC<Props> = ({ servicio, onUpdate }) => {
  return <ServiceChecklistTable servicio={servicio} onUpdate={onUpdate} />;
};

export default ServiceChecklist;
