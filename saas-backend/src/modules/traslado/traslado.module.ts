import prisma from '@infrastructure/config/prisma.js';
import { CrearTrasladoUseCase } from './application/crear-traslado.usecase.js';
import { ObtenerTrasladoUseCase } from './application/obtener-traslado.usecase.js';
import { ListarTrasladosPorOrigenUseCase } from './application/listar-traslados-por-origen.usecase.js';
import { ListarTrasladosPorDestinoUseCase } from './application/listar-traslados-por-destino.usecase.js';
import { CancelarTrasladoUseCase } from './application/cancelar-traslado.usecase.js';
import { RecibirTrasladoUseCase } from './application/recibir-traslado.usecase.js';
import { PrismaTrasladoRepository } from './infrastructure/prisma-traslado.repository.js';
import { TrasladoController } from './presentation/traslado.controller.js';

const trasladoRepository = new PrismaTrasladoRepository(prisma);

const crearTrasladoUseCase = new CrearTrasladoUseCase(trasladoRepository);
const obtenerTrasladoUseCase = new ObtenerTrasladoUseCase(trasladoRepository);
const listarPorOrigenUseCase = new ListarTrasladosPorOrigenUseCase(trasladoRepository);
const listarPorDestinoUseCase = new ListarTrasladosPorDestinoUseCase(trasladoRepository);
const cancelarTrasladoUseCase = new CancelarTrasladoUseCase(trasladoRepository);
const recibirTrasladoUseCase = new RecibirTrasladoUseCase(trasladoRepository);

export const trasladoController = new TrasladoController(
    crearTrasladoUseCase,
    obtenerTrasladoUseCase,
    listarPorOrigenUseCase,
    listarPorDestinoUseCase,
    cancelarTrasladoUseCase,
    recibirTrasladoUseCase
);
