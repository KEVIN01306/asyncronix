import type { PrismaClient } from '@prisma/client';
import type { TransactionManager } from '../TransactionManager.js';

export class PrismaTransactionManager implements TransactionManager {
    constructor(private readonly prisma: PrismaClient) {}

    async run<T>(fn: (tx: any) => Promise<T>): Promise<T> {
        return await this.prisma.$transaction(async (tx) => {
            return await fn(tx);
        }, { maxWait: 10000, timeout: 30000 });
    }
}
