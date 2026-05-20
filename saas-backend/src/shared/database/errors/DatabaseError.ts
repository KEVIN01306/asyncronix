import { PersistenceError } from "./PersistenceError.js"


export class DatabaseError extends PersistenceError {
    constructor(message: string = 'Database error') {
        super(message)
        this.name = "DatabaseError"
    }
}