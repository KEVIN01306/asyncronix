import { PersistenceError } from "./PersistenceError.js";

export class InsufficientStockPersistenceError extends PersistenceError {
    constructor(message = 'Insufficient stock') {
        super(message);
        this.name = 'InsufficientStockPersistenceError';
    }
}
