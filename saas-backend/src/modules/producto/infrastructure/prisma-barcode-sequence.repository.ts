import type { PrismaClient } from '@prisma/client';
import type { BarcodeSequenceRepository } from '../domain/barcode-sequence.repository.js';

export class PrismaBarcodeSequenceRepository implements BarcodeSequenceRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async createSequence(): Promise<number> {
        const created = await this.prisma.barcodeSequence.create({ data: {} });
        return typeof created.id === 'bigint' ? Number(created.id) : created.id;
    }
}
