import { Prisma } from "@prisma/client"
import { DatabaseError } from "../errors/DatabaseError.js"
import { NotFoundPersistenceError } from "../errors/NotFoundPersistenceError.js"
import type { PersistenceError } from "../errors/PersistenceError.js"
import { UniqueConstraintError } from "../errors/UniqueConstraintError.js"



export class PrismaErrorMapper {
    static map(error: unknown): PersistenceError {
        console.error("PrismaErrorMapper caught error:", error);

        if (error instanceof Prisma.PrismaClientInitializationError) {
            const message = error.message?.includes("Can't reach database server")
                ? 'DATABASE_UNAVAILABLE'
                : (error.message || 'Prisma initialization error');

            return new DatabaseError(message);
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return new UniqueConstraintError()
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return new NotFoundPersistenceError()
        }

        return new DatabaseError(error instanceof Error ? error.message : 'Database error')
    }
}

