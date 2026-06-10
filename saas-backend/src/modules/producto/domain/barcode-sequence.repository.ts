export interface BarcodeSequenceRepository {
    createSequence(): Promise<number>;
}
