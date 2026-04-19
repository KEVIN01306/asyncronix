import { PersistenceError } from "./PersistenceError.js"


export class NotFoundPersistenceError extends PersistenceError {
    constructor() {
        super('Not found')
        this.name = "NotFoundPersistenceError"
    }
}