import type { BarcodeSequenceRepository } from '../domain/barcode-sequence.repository.js';

export class ObtenerSecuenciaUseCase {
    constructor(private readonly repository: BarcodeSequenceRepository) { }

    async execute(): Promise<number> {
        return await this.repository.createSequence();
    }
}
