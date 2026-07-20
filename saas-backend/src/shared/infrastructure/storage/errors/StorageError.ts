import { PersistenceError } from "@shared/database/errors/PersistenceError.js";

export class StorageError extends PersistenceError {
    constructor(message: string = 'Storage operation failed', public readonly originalError?: any) {
        super(message);
        Object.setPrototypeOf(this, StorageError.prototype);
    }
}
