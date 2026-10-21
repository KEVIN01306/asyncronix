import AppError from "../../../../shared/errors/AppError.js";

export class LoteNoEncontradoError extends AppError {
    constructor(mensaje: string = "El lote no existe o no fue encontrado") {
        super(mensaje, "LOTE_NO_ENCONTRADO", 404);
        Object.setPrototypeOf(this, LoteNoEncontradoError.prototype);
    }
}
