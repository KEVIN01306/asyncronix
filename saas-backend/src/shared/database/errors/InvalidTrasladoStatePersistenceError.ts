import { PersistenceError } from './PersistenceError.js';

export class InvalidTrasladoStatePersistenceError extends PersistenceError {
    constructor(message = 'Invalid traslado state') {
        super(message);
        this.name = 'InvalidTrasladoStatePersistenceError';
    }
}
