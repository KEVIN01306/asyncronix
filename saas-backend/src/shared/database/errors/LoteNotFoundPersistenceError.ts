import { PersistenceError } from "./PersistenceError.js";

export class LoteNotFoundPersistenceError extends PersistenceError {
    constructor(message = 'Lote no encontrado') {
        super(message);
        this.name = 'LoteNotFoundPersistenceError';
    }
}
