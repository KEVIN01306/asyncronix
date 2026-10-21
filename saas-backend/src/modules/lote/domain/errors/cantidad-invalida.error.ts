import AppError from "../../../../shared/errors/AppError.js";

export class CantidadInvalidaError extends AppError {
    constructor(mensaje: string = "La cantidad debe ser un número entero mayor que cero") {
        super(mensaje, "CANTIDAD_INVALIDA", 400);
        Object.setPrototypeOf(this, CantidadInvalidaError.prototype);
    }
}
