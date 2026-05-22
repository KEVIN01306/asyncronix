import { PersistenceError } from "./PersistenceError.js";

export class VentaNotFoundPersistenceError extends PersistenceError {
    constructor(message = 'Venta no encontrada') {
        super(message);
        this.name = 'VentaNotFoundPersistenceError';
    }
}
