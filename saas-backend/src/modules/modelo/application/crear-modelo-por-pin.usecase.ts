import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import type { ModeloCrear, ModeloSimple } from "../domain/modelo.entity.js";
import type { ModeloRepository } from "../domain/modelo.repository.js";

interface CrearModeloConPinInput extends ModeloCrear {
    pin_modelo: string;
}

export class CrearModeloPorPinUseCase {
    constructor(
        private readonly modeloRepository: ModeloRepository,
        private readonly db: any,
        private readonly hashProvider: HashProvider,
    ) {}

    async execute(
        payload: CrearModeloConPinInput,
        contexto: { negocio_id: string; sucursal_id: string | null },
    ): Promise<ModeloSimple> {
        const { negocio_id, sucursal_id } = contexto;

        if (!sucursal_id) {
            throw new AppError('Sucursal requerida para validar PIN', 'SUCURSAL_REQUERIDA', 400);
        }

        const { pin_modelo, ...modeloData } = payload;

        // Generar el campo `modelo` automáticamente a partir de marca + linea + anio
        try {
            const marcaRecord = await this.db.marca.findUnique({ where: { id: modeloData.marca_id } });
            if (!marcaRecord) throw new AppError('Marca no encontrada', 'MARCA_NO_ENCONTRADA', 400);

            const lineaRecord = await this.db.linea.findUnique({ where: { id: modeloData.linea_id } });
            if (!lineaRecord) throw new AppError('Línea no encontrada', 'LINEA_NO_ENCONTRADA', 400);

            const anioVal = modeloData.anio;
            const parts = [marcaRecord.marca, lineaRecord.linea, String(anioVal)].filter(Boolean).map(String);
            modeloData.modelo = parts.join(' ');
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al generar el nombre del modelo', 'MODEL_GENERATION_ERROR', 500);
        }

        let usuarios: any[] = [];
        try {
            usuarios = await this.db.usuario.findMany({
                where: { negocio_id, sucursal_id, activo: true },
                include: { roles: { include: { permisos: true } } },
            });
        } catch {
            throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
        }

        let pinCoincideSinPermiso = false;

        for (const usuario of usuarios) {
            if (!usuario.pin_modelo) continue;

            const coincide = await this.hashProvider.compare(String(pin_modelo), usuario.pin_modelo);
            if (!coincide) continue;

            const permisos = (usuario.roles ?? []).flatMap((rol: any) =>
                (rol.permisos ?? []).map((permiso: any) => permiso.codigo),
            );

            if (!permisos.includes('CREAR_MODELO')) {
                pinCoincideSinPermiso = true;
                continue;
            }

            try {
                return await this.modeloRepository.registrar(modeloData);
            } catch (error) {
                if (error instanceof UniqueConstraintError) {
                    throw new AppError('El modelo ya existe', 'DATA_ALREADY_EXISTS', 409);
                }

                if (error instanceof DatabaseError) {
                    throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
                }

                throw error;
            }
        }

        if (pinCoincideSinPermiso) {
            throw new AppError('El PIN es válido pero no tiene permiso CREAR_MODELO', 'FORBIDDEN', 403);
        }

        throw new AppError('PIN inválido', 'PIN_INVALIDO', 400);
    }
}
