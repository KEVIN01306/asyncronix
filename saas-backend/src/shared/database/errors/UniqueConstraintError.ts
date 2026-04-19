import { PersistenceError } from "./PersistenceError.js";


export class UniqueConstraintError extends PersistenceError {
    constructor() {
        super('Unique constraint violated')
        this.name = "UniqueConstraintError"
    }
}