import AppError from "../../../../shared/errors/AppError.js";

export class StockInsuficienteError extends AppError {
    constructor(mensaje: string = "Stock insuficiente en el lote") {
        super(mensaje, "INSUFICIENTE_STOCK", 400);
        Object.setPrototypeOf(this, StockInsuficienteError.prototype);
    }
}
