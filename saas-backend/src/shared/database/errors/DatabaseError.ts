import { PersistenceError } from "./PersistenceError.js"


export class DatabaseError extends PersistenceError {
    constructor() {
        super('Database error')
        this.name = "DatabaseError"
    }
}