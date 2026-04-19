

export interface HashProvider {
    hash(valor: string): Promise<string>
    compare(valor: string, hash: string): Promise<boolean>
}